from typing import Dict, List, Any, Optional
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from supabase_client import get_supabase_client


class StatsEngine:
    """
    Cricket Domain Metrics & Player Career Statistics Engine.
    Computes batting strike rate, average, milestones, bowling economy, and match forms.
    """

    def __init__(self):
        # Lazy client initialization to avoid import-time failures
        self._supabase = None

    @property
    def supabase(self):
        if self._supabase is None:
            self._supabase = get_supabase_client()
        return self._supabase

    def get_player_career_stats(self, player_id: str) -> Dict[str, Any]:
        """
        Dynamically aggregates career statistics for a player across all matches.
        """
        # Fetch all ball events involving this player as striker
        striker_balls = (
            self.supabase.table("ball_events")
            .select("runs_scored, extras_type, innings_id, is_wicket, dismissed_player_id")
            .eq("striker_id", player_id)
            .execute()
            .data
            or []
        )

        total_runs = sum(b.get("runs_scored", 0) for b in striker_balls)
        # Balls faced excludes wides
        balls_faced = sum(1 for b in striker_balls if b.get("extras_type") != "wide")

        # Fetch dismissals (where this player was dismissed)
        dismissals = (
            self.supabase.table("ball_events")
            .select("ball_id")
            .eq("dismissed_player_id", player_id)
            .execute()
            .data
            or []
        )
        times_out = len(dismissals)

        # Innings batted
        innings_batted_set = {b["innings_id"] for b in striker_balls}
        innings_batted_count = len(innings_batted_set)

        # Batting Average: runs / times_out (if out 0 times, runs)
        batting_avg = round(total_runs / times_out, 2) if times_out > 0 else float(total_runs)
        strike_rate = round((total_runs / balls_faced) * 100, 2) if balls_faced > 0 else 0.0

        # Calculate 50s and 100s per inning
        runs_by_inning: Dict[str, int] = {}
        for b in striker_balls:
            inn = b["innings_id"]
            runs_by_inning[inn] = runs_by_inning.get(inn, 0) + b.get("runs_scored", 0)

        fifties = sum(1 for r in runs_by_inning.values() if 50 <= r < 100)
        hundreds = sum(1 for r in runs_by_inning.values() if r >= 100)

        # Fetch bowling balls
        bowler_balls = (
            self.supabase.table("ball_events")
            .select("runs_scored, extras_type, extras_runs, is_wicket, wicket_type, innings_id")
            .eq("bowler_id", player_id)
            .execute()
            .data
            or []
        )

        # Legal balls bowled
        legal_bowler_balls = sum(1 for b in bowler_balls if b.get("extras_type") not in ("wide", "no_ball"))
        overs_bowled = float(f"{legal_bowler_balls // 6}.{legal_bowler_balls % 6}")
        overs_bowled_dec = (legal_bowler_balls // 6) + ((legal_bowler_balls % 6) / 6.0)

        # Bowling runs conceded (wides + no-balls + off bat)
        runs_conceded = 0
        for b in bowler_balls:
            if b.get("extras_type") in ("wide", "no_ball"):
                runs_conceded += (b.get("extras_runs", 0) + b.get("runs_scored", 0))
            elif b.get("extras_type") not in ("bye", "leg_bye"):
                runs_conceded += b.get("runs_scored", 0)

        # Wickets credited to bowler (run out is not credited to bowler)
        wickets = sum(1 for b in bowler_balls if b.get("is_wicket") and b.get("wicket_type") != "run_out")
        economy = round(runs_conceded / overs_bowled_dec, 2) if overs_bowled_dec > 0 else 0.0

        # Total distinct matches involved in
        all_involved_innings = innings_batted_set.union({b["innings_id"] for b in bowler_balls})
        matches_played = 0
        if all_involved_innings:
            inns = self.supabase.table("innings").select("match_id").in_("innings_id", list(all_involved_innings)).execute().data or []
            matches_played = len({i["match_id"] for i in inns})

        return {
            "player_id": player_id,
            "matches_played": max(1, matches_played) if (total_runs > 0 or wickets > 0) else 0,
            "runs": total_runs,
            "balls_faced": balls_faced,
            "batting_average": batting_avg,
            "strike_rate": strike_rate,
            "fifties": fifties,
            "hundreds": hundreds,
            "wickets": wickets,
            "runs_conceded": runs_conceded,
            "overs_bowled": overs_bowled,
            "economy": economy
        }

    def get_player_recent_form(self, player_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves recent match performances (last 5 matches) for a player profile.
        """
        # Fetch balls where player batted or bowled
        balls = (
            self.supabase.table("ball_events")
            .select("*, innings:innings_id(match_id, match:match_id(*, team1:team1_id(*), team2:team2_id(*)))")
            .or_(f"striker_id.eq.{player_id},bowler_id.eq.{player_id}")
            .order("created_at", desc=True)
            .execute()
            .data
            or []
        )

        performances_by_match: Dict[str, Dict[str, Any]] = {}
        for b in balls:
            inn = b.get("innings")
            if not inn or not inn.get("match"):
                continue
            m = inn["match"]
            m_id = m["match_id"]

            if m_id not in performances_by_match:
                # Find opponent name
                # Player team
                t1 = m.get("team1") or {}
                t2 = m.get("team2") or {}
                opponent_name = t2.get("team_name", "Opponent")

                performances_by_match[m_id] = {
                    "match_id": m_id,
                    "match_date": m.get("match_date"),
                    "opponent": opponent_name,
                    "runs": 0,
                    "balls": 0,
                    "wickets": 0,
                    "runs_conceded": 0,
                    "legal_balls_bowled": 0,
                }

            p = performances_by_match[m_id]

            # If player was striker
            if b.get("striker_id") == player_id:
                p["runs"] += b.get("runs_scored", 0)
                if b.get("extras_type") != "wide":
                    p["balls"] += 1

            # If player was bowler
            if b.get("bowler_id") == player_id:
                if b.get("is_wicket") and b.get("wicket_type") != "run_out":
                    p["wickets"] += 1
                if b.get("extras_type") in ("wide", "no_ball"):
                    p["runs_conceded"] += (b.get("extras_runs", 0) + b.get("runs_scored", 0))
                elif b.get("extras_type") not in ("bye", "leg_bye"):
                    p["runs_conceded"] += b.get("runs_scored", 0)
                if b.get("extras_type") not in ("wide", "no_ball"):
                    p["legal_balls_bowled"] += 1

        result = []
        for p in list(performances_by_match.values())[:limit]:
            legal_b = p.pop("legal_balls_bowled", 0)
            p["overs_bowled"] = float(f"{legal_b // 6}.{legal_b % 6}")
            result.append(p)

        return result


stats_engine = StatsEngine()
