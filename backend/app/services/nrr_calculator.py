from typing import Dict, List, Any, Tuple
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from supabase_client import get_supabase_client


class NRRCalculator:
    """
    Cricket Net Run Rate (NRR) and Standings Computation Engine.
    Formula: NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
    """

    @staticmethod
    def overs_to_decimal(overs_played: float, is_all_out: bool = False, max_overs: int = 20) -> float:
        """
        Converts fractional cricket overs (e.g., 16.2 meaning 16 overs and 2 balls)
        into a precise mathematical decimal (16 + 2/6 = 16.3333).
        If the team is bowled out (all out), the full quota of overs is applied.
        """
        if is_all_out:
            return float(max_overs)

        overs_int = int(overs_played)
        # Extract legal ball fraction (e.g. 0.2 -> 2 balls)
        ball_fraction = round((overs_played - overs_int) * 10)
        return float(overs_int + (ball_fraction / 6.0))

    @staticmethod
    def calculate_nrr(
        runs_scored: int,
        overs_faced_dec: float,
        runs_conceded: int,
        overs_bowled_dec: float
    ) -> float:
        """
        Computes Net Run Rate rounded to 3 decimal places.
        """
        for_rate = (runs_scored / overs_faced_dec) if overs_faced_dec > 0 else 0.0
        against_rate = (runs_conceded / overs_bowled_dec) if overs_bowled_dec > 0 else 0.0
        return round(for_rate - against_rate, 3)

    def calculate_tournament_standings(self, tournament_id: str) -> List[Dict[str, Any]]:
        """
        Aggregates match results and dynamically computes the points table with NRR for a tournament.
        """
        supabase = get_supabase_client()

        # Fetch tournament teams
        # 1. First check tournament_teams junction table or teams playing in matches of this tournament
        t_teams = supabase.table("tournament_teams").select("team_id, team:team_id(*)").eq("tournament_id", tournament_id).execute().data or []
        teams_dict: Dict[str, Dict[str, Any]] = {}
        for entry in t_teams:
            if entry.get("team"):
                t = entry["team"]
                teams_dict[t["team_id"]] = t

        # Fetch matches in tournament
        matches = (
            supabase.table("matches")
            .select("*, team1:teams!team1_id(*), team2:teams!team2_id(*)")
            .eq("tournament_id", tournament_id)
            .execute()
            .data
            or []
        )

        # Include teams from match fixtures if not in junction table
        for m in matches:
            if m.get("team1") and m["team1"]["team_id"] not in teams_dict:
                teams_dict[m["team1"]["team_id"]] = m["team1"]
            if m.get("team2") and m["team2"]["team_id"] not in teams_dict:
                teams_dict[m["team2"]["team_id"]] = m["team2"]

        # Fetch all completed innings for these matches
        match_ids = [m["match_id"] for m in matches]
        innings_list = []
        if match_ids:
            innings_list = (
                supabase.table("innings")
                .select("*")
                .in_("match_id", match_ids)
                .execute()
                .data
                or []
            )

        match_map = {m["match_id"]: m for m in matches}
        innings_by_match: Dict[str, List[Dict[str, Any]]] = {}
        for inn in innings_list:
            m_id = inn["match_id"]
            if m_id not in innings_by_match:
                innings_by_match[m_id] = []
            innings_by_match[m_id].append(inn)

        # Initialize team record stats
        stats_by_team: Dict[str, Dict[str, Any]] = {}
        for t_id, t_info in teams_dict.items():
            stats_by_team[t_id] = {
                "tournament_id": tournament_id,
                "team_id": t_id,
                "team_name": t_info.get("team_name", "Team"),
                "team_city": t_info.get("city"),
                "played": 0,
                "won": 0,
                "lost": 0,
                "tied": 0,
                "nr": 0,
                "points": 0,
                "total_runs_scored": 0,
                "total_overs_faced_dec": 0.0,
                "total_runs_conceded": 0,
                "total_overs_bowled_dec": 0.0,
                "nrr": 0.000,
                "form": []
            }

        # Process each match
        for m in matches:
            t1_id = m.get("team1_id")
            t2_id = m.get("team2_id")
            if not t1_id or not t2_id:
                continue

            status = m.get("status")
            if status not in ("completed", "live"):
                continue

            max_overs = m.get("overs", 20)
            winner_id = m.get("winner_id")
            m_innings = innings_by_match.get(m["match_id"], [])

            # Update played counts and results if match is completed
            if status == "completed":
                if t1_id in stats_by_team:
                    stats_by_team[t1_id]["played"] += 1
                if t2_id in stats_by_team:
                    stats_by_team[t2_id]["played"] += 1

                if winner_id:
                    loser_id = t2_id if winner_id == t1_id else t1_id
                    if winner_id in stats_by_team:
                        stats_by_team[winner_id]["won"] += 1
                        stats_by_team[winner_id]["points"] += 2
                        stats_by_team[winner_id]["form"].append("W")
                    if loser_id in stats_by_team:
                        stats_by_team[loser_id]["lost"] += 1
                        stats_by_team[loser_id]["form"].append("L")
                elif status == "abandoned":
                    if t1_id in stats_by_team:
                        stats_by_team[t1_id]["nr"] += 1
                        stats_by_team[t1_id]["points"] += 1
                        stats_by_team[t1_id]["form"].append("NR")
                    if t2_id in stats_by_team:
                        stats_by_team[t2_id]["nr"] += 1
                        stats_by_team[t2_id]["points"] += 1
                        stats_by_team[t2_id]["form"].append("NR")
                else:
                    # Tie
                    for tid in (t1_id, t2_id):
                        if tid in stats_by_team:
                            stats_by_team[tid]["tied"] += 1
                            stats_by_team[tid]["points"] += 1
                            stats_by_team[tid]["form"].append("T")

            # Process innings runs & overs for NRR
            for inn in m_innings:
                bat_id = inn.get("batting_team_id")
                bowl_id = inn.get("bowling_team_id")
                runs = inn.get("total_runs", 0)
                wickets = inn.get("wickets", 0)
                overs_played = float(inn.get("overs_played", 0.0))
                is_all_out = (wickets >= 10)

                dec_overs = self.overs_to_decimal(overs_played, is_all_out=is_all_out, max_overs=max_overs)

                if bat_id in stats_by_team:
                    stats_by_team[bat_id]["total_runs_scored"] += runs
                    stats_by_team[bat_id]["total_overs_faced_dec"] += dec_overs

                if bowl_id in stats_by_team:
                    stats_by_team[bowl_id]["total_runs_conceded"] += runs
                    stats_by_team[bowl_id]["total_overs_bowled_dec"] += dec_overs

        # Final NRR computation and sorting
        standings = []
        for team_stat in stats_by_team.values():
            team_stat["nrr"] = self.calculate_nrr(
                runs_scored=team_stat["total_runs_scored"],
                overs_faced_dec=team_stat["total_overs_faced_dec"],
                runs_conceded=team_stat["total_runs_conceded"],
                overs_bowled_dec=team_stat["total_overs_bowled_dec"]
            )
            # Retain only last 5 match form
            team_stat["form"] = team_stat["form"][-5:]
            standings.append(team_stat)

        # Sort: Points (desc), NRR (desc), Won (desc), Played (asc)
        standings.sort(key=lambda x: (x["points"], x["nrr"], x["won"], -x["played"]), reverse=True)

        # Add ranking index
        for rank, item in enumerate(standings, start=1):
            item["rank"] = rank

        return standings


nrr_calculator = NRRCalculator()
