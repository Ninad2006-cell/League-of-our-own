import math
from typing import Optional, Dict, Any, List, Tuple
from app.schemas.scoring import (
    StartMatchRequest,
    RecordBallRequest,
    ExtrasType,
    WicketType,
)
from app.services.connection_manager import manager
import sys
from pathlib import Path

# Ensure root backend directory is accessible for supabase_client
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from supabase_client import get_supabase_client


class ScoringService:
    def __init__(self):
        self.supabase = get_supabase_client()

    def get_match(self, match_id: str) -> Dict[str, Any]:
        res = self.supabase.table("matches").select("*, team1:teams!team1_id(*), team2:teams!team2_id(*), venue:venues(*), tournament:tournaments(*)").eq("match_id", match_id).single().execute()
        if not res.data:
            raise ValueError(f"Match {match_id} not found")
        return res.data


    def get_active_inning(self, match_id: str) -> Optional[Dict[str, Any]]:
        res = (
            self.supabase.table("innings")
            .select("*")
            .eq("match_id", match_id)
            .eq("is_completed", False)
            .order("innings_no", desc=True)
            .limit(1)
            .execute()
        )
        return res.data[0] if res.data else None

    async def start_match(self, match_id: str, payload: StartMatchRequest) -> Dict[str, Any]:
        match = self.get_match(match_id)
        team1_id = match["team1_id"]
        team2_id = match["team2_id"]

        # Determine batting and bowling teams from toss
        if payload.toss_decision.lower() == "bat":
            batting_team_id = payload.toss_winner_id
            bowling_team_id = team2_id if payload.toss_winner_id == team1_id else team1_id
        else:
            bowling_team_id = payload.toss_winner_id
            batting_team_id = team2_id if payload.toss_winner_id == team1_id else team1_id

        # Update match record
        self.supabase.table("matches").update({
            "status": "live",
            "toss_winner_id": payload.toss_winner_id,
            "toss_decision": payload.toss_decision.lower(),
            "overs": payload.overs
        }).eq("match_id", match_id).execute()

        # Check if 1st inning already exists
        existing_innings = self.supabase.table("innings").select("*").eq("match_id", match_id).eq("innings_no", 1).execute()
        if not existing_innings.data:
            inning_res = self.supabase.table("innings").insert({
                "match_id": match_id,
                "batting_team_id": batting_team_id,
                "bowling_team_id": bowling_team_id,
                "innings_no": 1,
                "total_runs": 0,
                "wickets": 0,
                "overs_played": 0.0,
                "is_completed": False
            }).execute()
            active_inning = inning_res.data[0]
        else:
            active_inning = existing_innings.data[0]

        # Compile live state & broadcast
        scorecard = await self.compile_live_scorecard(match_id, current_striker_id=payload.striker_id, current_non_striker_id=payload.non_striker_id, current_bowler_id=payload.bowler_id)
        await manager.broadcast(match_id, {"event": "MATCH_STARTED", "scorecard": scorecard})
        return scorecard

    async def record_ball(self, match_id: str, payload: RecordBallRequest) -> Dict[str, Any]:
        active_inning = self.get_active_inning(match_id)
        if not active_inning:
            raise ValueError(f"No active inning found for match {match_id}")

        innings_id = active_inning["innings_id"]

        # Fetch all existing balls in this inning to calculate legal over and ball count
        existing_balls = (
            self.supabase.table("ball_events")
            .select("extras_type")
            .eq("innings_id", innings_id)
            .order("created_at")
            .execute()
            .data
            or []
        )

        legal_balls_count = sum(1 for b in existing_balls if b.get("extras_type") not in ("wide", "no_ball"))
        current_over_no = legal_balls_count // 6
        current_ball_in_over = (legal_balls_count % 6) + 1  # 1 to 6 for the next legal ball

        # Calculate runs and extras
        is_legal = payload.extras_type not in (ExtrasType.WIDE, ExtrasType.NO_BALL)
        batsman_runs = payload.runs_scored
        extras_penalty = 0

        if payload.extras_type == ExtrasType.WIDE:
            extras_penalty = 1 + payload.extras_runs
            batsman_runs = 0  # batsman does not get runs for wides
        elif payload.extras_type == ExtrasType.NO_BALL:
            extras_penalty = 1 + payload.extras_runs
            # batsman DOES get runs hit off no ball
        elif payload.extras_type in (ExtrasType.BYE, ExtrasType.LEG_BYE):
            extras_penalty = payload.runs_scored
            batsman_runs = 0

        total_ball_runs = batsman_runs + extras_penalty

        # Insert ball event
        ball_insert = {
            "innings_id": innings_id,
            "over_no": current_over_no,
            "ball_no": current_ball_in_over if is_legal else current_ball_in_over,
            "striker_id": payload.striker_id,
            "non_striker_id": payload.non_striker_id,
            "bowler_id": payload.bowler_id,
            "runs_scored": batsman_runs,
            "extras_type": payload.extras_type.value,
            "extras_runs": extras_penalty,
            "is_wicket": payload.is_wicket,
            "wicket_type": payload.wicket_type.value,
            "dismissed_player_id": payload.dismissed_player_id if payload.is_wicket else None,
        }
        self.supabase.table("ball_events").insert(ball_insert).execute()

        # Update innings totals
        new_total_runs = active_inning["total_runs"] + total_ball_runs
        new_wickets = active_inning["wickets"] + (1 if payload.is_wicket else 0)
        
        # New overs played (fractional representation: e.g. 16.2 = 16 overs + 2 legal balls)
        new_legal_balls = legal_balls_count + (1 if is_legal else 0)
        new_overs_played = float(f"{new_legal_balls // 6}.{new_legal_balls % 6}")

        self.supabase.table("innings").update({
            "total_runs": new_total_runs,
            "wickets": new_wickets,
            "overs_played": new_overs_played,
        }).eq("innings_id", innings_id).execute()

        # Strike rotation calculation
        over_completed = is_legal and (new_legal_balls % 6 == 0)
        
        # Runs that caused physical crossing of batsmen
        running_runs = payload.runs_scored if payload.extras_type not in (ExtrasType.WIDE, ExtrasType.NO_BALL) else (total_ball_runs - 1)
        if payload.extras_type in (ExtrasType.BYE, ExtrasType.LEG_BYE):
            running_runs = total_ball_runs
        
        odd_runs_crossed = (running_runs % 2 == 1)
        # Batsmen swap ends on odd runs XOR over completed
        strike_swap = odd_runs_crossed ^ over_completed

        next_striker = payload.non_striker_id if strike_swap else payload.striker_id
        next_non_striker = payload.striker_id if strike_swap else payload.non_striker_id

        # If wicket fell, replace dismissed batsman with incoming batsman
        if payload.is_wicket and payload.next_batsman_id:
            if payload.dismissed_player_id == payload.striker_id:
                next_striker = payload.next_batsman_id
            elif payload.dismissed_player_id == payload.non_striker_id:
                next_non_striker = payload.next_batsman_id

        # Check if 2nd innings target reached
        match = self.get_match(match_id)
        if active_inning.get("target_runs") and new_total_runs >= active_inning["target_runs"]:
            # Batting team won!
            summary = f"{active_inning['batting_team_id']} won by {10 - new_wickets} wickets"
            await self.complete_match(match_id, active_inning["batting_team_id"], summary)

        # Broadcast live update
        scorecard = await self.compile_live_scorecard(
            match_id,
            current_striker_id=next_striker,
            current_non_striker_id=next_non_striker,
            current_bowler_id=payload.bowler_id
        )
        scorecard["over_completed"] = over_completed
        await manager.broadcast(match_id, {"event": "BALL_RECORDED", "scorecard": scorecard})
        return scorecard

    async def undo_last_ball(self, match_id: str) -> Dict[str, Any]:
        active_inning = self.get_active_inning(match_id)
        if not active_inning:
            raise ValueError(f"No active inning for match {match_id}")

        innings_id = active_inning["innings_id"]

        # Find most recent ball
        last_ball_res = (
            self.supabase.table("ball_events")
            .select("*")
            .eq("innings_id", innings_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not last_ball_res.data:
            raise ValueError("No deliveries found to undo in this inning")

        last_ball = last_ball_res.data[0]
        ball_id = last_ball["ball_id"]

        # Calculate runs and wicket to reverse
        runs_to_remove = (last_ball.get("runs_scored") or 0) + (last_ball.get("extras_runs") or 0)
        wickets_to_remove = 1 if last_ball.get("is_wicket") else 0

        # Delete ball event
        self.supabase.table("ball_events").delete().eq("ball_id", ball_id).execute()

        # Recalculate legal balls
        remaining_balls = (
            self.supabase.table("ball_events")
            .select("extras_type")
            .eq("innings_id", innings_id)
            .execute()
            .data
            or []
        )
        legal_count = sum(1 for b in remaining_balls if b.get("extras_type") not in ("wide", "no_ball"))
        overs_played = float(f"{legal_count // 6}.{legal_count % 6}")

        new_total_runs = max(0, active_inning["total_runs"] - runs_to_remove)
        new_wickets = max(0, active_inning["wickets"] - wickets_to_remove)

        self.supabase.table("innings").update({
            "total_runs": new_total_runs,
            "wickets": new_wickets,
            "overs_played": overs_played
        }).eq("innings_id", innings_id).execute()

        # Recompile scorecard with restored batsmen
        scorecard = await self.compile_live_scorecard(
            match_id,
            current_striker_id=last_ball["striker_id"],
            current_non_striker_id=last_ball["non_striker_id"],
            current_bowler_id=last_ball["bowler_id"]
        )
        await manager.broadcast(match_id, {"event": "BALL_UNDONE", "scorecard": scorecard})
        return scorecard

    async def end_innings(self, match_id: str, target_runs: Optional[int] = None) -> Dict[str, Any]:
        active_inning = self.get_active_inning(match_id)
        if not active_inning:
            raise ValueError(f"No active inning to close for match {match_id}")

        innings_id = active_inning["innings_id"]
        innings_no = active_inning["innings_no"]

        # Close current inning
        self.supabase.table("innings").update({"is_completed": True}).eq("innings_id", innings_id).execute()

        match = self.get_match(match_id)

        if innings_no == 1:
            # Start 2nd inning
            target = target_runs if target_runs is not None else (active_inning["total_runs"] + 1)
            
            # Batting and bowling swap
            batting_team_id = active_inning["bowling_team_id"]
            bowling_team_id = active_inning["batting_team_id"]

            new_inning = self.supabase.table("innings").insert({
                "match_id": match_id,
                "batting_team_id": batting_team_id,
                "bowling_team_id": bowling_team_id,
                "innings_no": 2,
                "total_runs": 0,
                "wickets": 0,
                "overs_played": 0.0,
                "target_runs": target,
                "is_completed": False
            }).execute().data[0]

            scorecard = await self.compile_live_scorecard(match_id)
            await manager.broadcast(match_id, {"event": "INNINGS_ENDED", "new_innings": new_inning, "scorecard": scorecard})
            return {"status": "Innings 1 closed. Innings 2 initialized.", "target": target}
        else:
            # Match is finished
            return await self.complete_match(
                match_id,
                winner_id=None,
                result_summary="Innings completed. Ready to conclude match."
            )

    async def complete_match(self, match_id: str, winner_id: Optional[str], result_summary: str) -> Dict[str, Any]:
        # Close any open innings
        self.supabase.table("innings").update({"is_completed": True}).eq("match_id", match_id).execute()

        # Update match status
        update_data = {
            "status": "completed",
            "result_summary": result_summary
        }
        if winner_id:
            update_data["winner_id"] = winner_id

        self.supabase.table("matches").update(update_data).eq("match_id", match_id).execute()

        scorecard = await self.compile_live_scorecard(match_id)
        await manager.broadcast(match_id, {"event": "MATCH_COMPLETED", "scorecard": scorecard})
        return {"status": "completed", "result_summary": result_summary}

    async def compile_live_scorecard(
        self,
        match_id: str,
        current_striker_id: Optional[str] = None,
        current_non_striker_id: Optional[str] = None,
        current_bowler_id: Optional[str] = None
    ) -> Dict[str, Any]:
        match = self.get_match(match_id)
        active_inning = self.get_active_inning(match_id)

        # If no active inning, get latest inning
        if not active_inning:
            inns = (
                self.supabase.table("innings")
                .select("*")
                .eq("match_id", match_id)
                .order("innings_no", desc=True)
                .limit(1)
                .execute()
                .data
            )
            active_inning = inns[0] if inns else None

        if not active_inning:
            # Match has not started
            return {
                "match_id": match_id,
                "tournament": match.get("tournament", {}).get("name", "Cricket League"),
                "venue": match.get("venue", {}).get("venue_name", "TBD"),
                "status": match.get("status", "scheduled"),
                "overs_limit": match.get("overs", 20),
                "team1": match.get("team1") or {},
                "team2": match.get("team2") or {},
                "current_innings_no": 1,
                "total_runs": 0,
                "wickets": 0,
                "overs_played": 0.0,
                "crr": 0.0,
                "recent_balls": [],
                "recent_balls_log": []
            }

        innings_id = active_inning["innings_id"]

        # Fetch all balls in this inning with player info
        balls = (
            self.supabase.table("ball_events")
            .select("*, striker:striker_id(name), non_striker:non_striker_id(name), bowler:bowler_id(name)")
            .eq("innings_id", innings_id)
            .order("created_at")
            .execute()
            .data
            or []
        )

        # Calculate CRR and RRR
        legal_balls = sum(1 for b in balls if b.get("extras_type") not in ("wide", "no_ball"))
        overs_in_decimal = (legal_balls // 6) + ((legal_balls % 6) / 6.0)
        total_runs = active_inning.get("total_runs", 0)
        crr = round(total_runs / overs_in_decimal, 2) if overs_in_decimal > 0 else 0.0

        target = active_inning.get("target_runs")
        rrr = None
        if target:
            rem_runs = max(0, target - total_runs)
            total_match_balls = match.get("overs", 20) * 6
            rem_balls = max(0, total_match_balls - legal_balls)
            rem_overs = rem_balls / 6.0
            rrr = round(rem_runs / rem_overs, 2) if rem_overs > 0 else None

        # Build recent balls ribbon
        recent_balls_ribbon = []
        for b in balls[-6:]:
            if b.get("is_wicket"):
                recent_balls_ribbon.append("W")
            elif b.get("extras_type") == "wide":
                extra_r = b.get("extras_runs", 1)
                recent_balls_ribbon.append(f"{extra_r}Wd" if extra_r > 1 else "Wd")
            elif b.get("extras_type") == "no_ball":
                recent_balls_ribbon.append("Nb")
            elif b.get("extras_type") in ("bye", "leg_bye"):
                recent_balls_ribbon.append(f"{b.get('extras_runs', 1)}B")
            else:
                recent_balls_ribbon.append(str(b.get("runs_scored", 0)))

        # Build recent balls table log
        recent_log = []
        for b in reversed(balls[-10:]):
            ext = "-"
            if b.get("extras_type") != "none":
                ext = f"{b.get('extras_type').title()} ({b.get('extras_runs')}r)"
            wkt = "-"
            if b.get("is_wicket"):
                wkt = f"OUT ({b.get('wicket_type')})"
            
            recent_log.append({
                "id": b["ball_id"],
                "over": b["over_no"],
                "ball": b["ball_no"],
                "runs": b["runs_scored"],
                "extras": ext,
                "wicket": wkt,
                "batsman": b.get("striker", {}).get("name", "Batsman") if b.get("striker") else "Batsman",
                "bowler": b.get("bowler", {}).get("name", "Bowler") if b.get("bowler") else "Bowler"
            })

        # Calculate active striker & non-striker stats if IDs provided
        def get_batsman_stats(player_id: Optional[str], is_strk: bool):
            if not player_id:
                return None
            p_balls = [b for b in balls if b.get("striker_id") == player_id]
            runs = sum(b.get("runs_scored", 0) for b in p_balls)
            # Balls faced = legal deliveries + no balls (wides don't count as ball faced)
            faced = sum(1 for b in p_balls if b.get("extras_type") != "wide")
            fours = sum(1 for b in p_balls if b.get("runs_scored") == 4)
            sixes = sum(1 for b in p_balls if b.get("runs_scored") == 6)
            sr = round((runs / faced) * 100, 1) if faced > 0 else 0.0
            
            # Fetch name
            p_data = self.supabase.table("players").select("name").eq("player_id", player_id).execute().data
            name = p_data[0]["name"] if p_data else "Player"

            return {
                "player_id": player_id,
                "name": name,
                "runs": runs,
                "balls": faced,
                "fours": fours,
                "sixes": sixes,
                "strike_rate": sr,
                "is_striker": is_strk,
                "is_out": False
            }

        def get_bowler_stats(bowler_id: Optional[str]):
            if not bowler_id:
                return None
            b_balls = [b for b in balls if b.get("bowler_id") == bowler_id]
            b_legal = sum(1 for b in b_balls if b.get("extras_type") not in ("wide", "no_ball"))
            overs = float(f"{b_legal // 6}.{b_legal % 6}")
            overs_dec = (b_legal // 6) + ((b_legal % 6) / 6.0)
            
            # Runs conceded: batsman runs + wides + no-balls (byes and leg byes do NOT count against bowler)
            runs_conceded = 0
            for b in b_balls:
                if b.get("extras_type") in ("wide", "no_ball"):
                    runs_conceded += (b.get("extras_runs", 0) + b.get("runs_scored", 0))
                elif b.get("extras_type") not in ("bye", "leg_bye"):
                    runs_conceded += b.get("runs_scored", 0)

            # Wickets credited to bowler (run out is not bowler's wicket)
            wickets = sum(1 for b in b_balls if b.get("is_wicket") and b.get("wicket_type") != "run_out")
            eco = round(runs_conceded / overs_dec, 2) if overs_dec > 0 else 0.0

            p_data = self.supabase.table("players").select("name").eq("player_id", bowler_id).execute().data
            name = p_data[0]["name"] if p_data else "Bowler"

            return {
                "player_id": bowler_id,
                "name": name,
                "overs": overs,
                "runs": runs_conceded,
                "wickets": wickets,
                "economy": eco
            }

        # If current players are not passed, infer from the last ball
        last_ball = balls[-1] if balls else None
        striker_id = current_striker_id or (last_ball.get("striker_id") if last_ball else None)
        non_striker_id = current_non_striker_id or (last_ball.get("non_striker_id") if last_ball else None)
        bowler_id = current_bowler_id or (last_ball.get("bowler_id") if last_ball else None)

        return {
            "match_id": match_id,
            "tournament": match.get("tournament", {}).get("name", "Cricket League"),
            "venue": match.get("venue", {}).get("venue_name", "TBD"),
            "status": match.get("status", "live"),
            "overs_limit": match.get("overs", 20),
            "team1": match.get("team1") or {},
            "team2": match.get("team2") or {},
            "current_innings_no": active_inning.get("innings_no", 1),
            "batting_team_id": active_inning.get("batting_team_id"),
            "bowling_team_id": active_inning.get("bowling_team_id"),
            "total_runs": total_runs,
            "wickets": active_inning.get("wickets", 0),
            "overs_played": active_inning.get("overs_played", 0.0),
            "target": target,
            "crr": crr,
            "rrr": rrr,
            "striker": get_batsman_stats(striker_id, is_strk=True),
            "non_striker": get_batsman_stats(non_striker_id, is_strk=False),
            "current_bowler": get_bowler_stats(bowler_id),
            "recent_balls": recent_balls_ribbon,
            "recent_balls_log": recent_log,
            "result_summary": match.get("result_summary")
        }


scoring_service = ScoringService()
