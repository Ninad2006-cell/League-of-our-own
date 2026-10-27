from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.nrr_calculator import nrr_calculator
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from supabase_client import get_supabase_client

router = APIRouter(tags=["Tournaments & Standings"])


@router.get("")
def list_all_tournaments():
    """
    Returns list of tournaments with status, level, format, start/end dates,
    and associated team/match counts. Tournaments with active matches or teams
    are prioritized.
    """
    supabase = get_supabase_client()
    tournaments = supabase.table("tournaments").select("*").order("start_date", desc=True).execute().data or []
    
    result = []
    for t in tournaments:
        t_id = t["tournament_id"]
        # Count teams and matches
        m_count = supabase.table("matches").select("match_id", count="exact").eq("tournament_id", t_id).execute().count or 0
        t_count = supabase.table("tournament_teams").select("team_id", count="exact").eq("tournament_id", t_id).execute().count or 0
        
        status_val = "In Progress" if t.get("name") == "City Champions League" or m_count > 0 else "Upcoming"

        result.append({
            "tournament_id": t_id,
            "name": t.get("name"),
            "level": t.get("level"),
            "format": t.get("format"),
            "start_date": str(t.get("start_date")),
            "end_date": str(t.get("end_date")),
            "status": status_val,
            "teams_count": t_count,
            "matches_count": m_count
        })

    # Sort tournaments so that those with matches/teams appear first
    result.sort(key=lambda x: (x["matches_count"] > 0 or x["teams_count"] > 0, x["matches_count"]), reverse=True)
    return result


@router.get("/{tournament_id}")
def get_tournament_details(tournament_id: str):
    """
    Returns specific tournament metadata.
    """
    supabase = get_supabase_client()
    res = supabase.table("tournaments").select("*").eq("tournament_id", tournament_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return res.data[0]


@router.get("/{tournament_id}/fixtures")
def get_tournament_fixtures(
    tournament_id: str,
    status: Optional[str] = Query(None, description="Filter fixtures by status: live, upcoming, completed")
):
    """
    Returns fixture schedule for the tournament with optional status filter.
    """
    supabase = get_supabase_client()
    query = (
        supabase.table("matches")
        .select("*, team1:teams!team1_id(*), team2:teams!team2_id(*), venue:venues(*), tournament:tournaments(*)")
        .eq("tournament_id", tournament_id)
    )
    if status:
        query = query.eq("status", status.lower())
        
    matches = query.order("match_date").execute().data or []

    # Batch-fetch all innings for these matches in ONE query
    match_ids = [m["match_id"] for m in matches]
    innings_by_match = {}
    if match_ids:
        all_innings = (
            supabase.table("innings")
            .select("match_id, batting_team_id, total_runs, wickets, overs_played, innings_no")
            .in_("match_id", match_ids)
            .order("innings_no")
            .execute()
            .data or []
        )
        for inn in all_innings:
            mid = inn["match_id"]
            if mid not in innings_by_match:
                innings_by_match[mid] = []
            innings_by_match[mid].append(inn)

    fixtures = []
    for m in matches:
        m_id = m["match_id"]
        innings = innings_by_match.get(m_id, [])
        
        team1_score = None
        team2_score = None
        for inn in innings:
            score_str = f"{inn['total_runs']}/{inn['wickets']} ({inn['overs_played']} ov)"
            if inn["batting_team_id"] == m.get("team1_id"):
                team1_score = score_str
            else:
                team2_score = score_str

        # Generate result summary if missing
        res_summary = m.get("result_summary")
        if not res_summary:
            winner_id = m.get("winner_id")
            m_status = (m.get("status") or "").lower()
            if winner_id:
                t1 = m.get("team1") or {}
                t2 = m.get("team2") or {}
                if winner_id == t1.get("team_id"):
                    res_summary = f"{t1.get('team_name', 'Team 1')} won"
                elif winner_id == t2.get("team_id"):
                    res_summary = f"{t2.get('team_name', 'Team 2')} won"
            elif m_status == "live":
                res_summary = "Match in progress"
            elif m_status == "completed":
                res_summary = "Match completed"

        fixtures.append({
            "match_id": m_id,
            "tournament_name": m.get("tournament", {}).get("name", "Tournament"),
            "venue_name": m.get("venue", {}).get("venue_name", "Stadium"),
            "match_date": str(m.get("match_date")),
            "status": m.get("status", "scheduled").upper(),
            "overs": m.get("overs", 20),
            "team1": m.get("team1") or {},
            "team2": m.get("team2") or {},
            "team1_score": team1_score,
            "team2_score": team2_score,
            "result_summary": res_summary,
        })

    return fixtures


@router.get("/{tournament_id}/standings")
def get_tournament_standings(tournament_id: str):
    """
    Returns the points table standings for the tournament with dynamically 
    computed Net Run Rate (NRR) and last-5 match form.
    Falls back to pre-aggregated points_table table if dynamic results are empty.
    """
    try:
        standings = nrr_calculator.calculate_tournament_standings(tournament_id)
        if standings:
            return standings
        
        # Fallback to points_table table if dynamic calculation returned empty
        supabase = get_supabase_client()
        pt_rows = (
            supabase.table("points_table")
            .select("*, team:teams(team_name, city)")
            .eq("tournament_id", tournament_id)
            .order("points", desc=True)
            .order("nrr", desc=True)
            .execute()
            .data or []
        )
        if pt_rows:
            fallback = []
            for rank, r in enumerate(pt_rows, start=1):
                t_info = r.get("team") or {}
                fallback.append({
                    "tournament_id": tournament_id,
                    "team_id": r["team_id"],
                    "team_name": t_info.get("team_name", "Team"),
                    "team_city": t_info.get("city"),
                    "played": r.get("played", 0),
                    "won": r.get("won", 0),
                    "lost": r.get("lost", 0),
                    "tied": r.get("tied", 0),
                    "nr": r.get("nr", 0),
                    "points": r.get("points", 0),
                    "nrr": float(r.get("nrr", 0.0) or 0.0),
                    "form": ["W", "L"] if r.get("won", 0) > 0 else [],
                    "rank": rank
                })
            return fallback

        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate standings: {str(e)}")
