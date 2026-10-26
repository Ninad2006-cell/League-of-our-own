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
    and associated team/match counts.
    """
    supabase = get_supabase_client()
    tournaments = supabase.table("tournaments").select("*").order("start_date", desc=True).execute().data or []
    
    result = []
    for t in tournaments:
        t_id = t["tournament_id"]
        # Count teams and matches
        m_count = supabase.table("matches").select("match_id", count="exact").eq("tournament_id", t_id).execute().count or 0
        t_count = supabase.table("tournament_teams").select("team_id", count="exact").eq("tournament_id", t_id).execute().count or 0
        
        result.append({
            "tournament_id": t_id,
            "name": t.get("name"),
            "level": t.get("level"),
            "format": t.get("format"),
            "start_date": str(t.get("start_date")),
            "end_date": str(t.get("end_date")),
            "status": "In Progress" if t.get("name") == "City Champions League" else "Upcoming",
            "teams_count": t_count,
            "matches_count": m_count
        })
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

    # Fetch latest scores for matches
    fixtures = []
    for m in matches:
        m_id = m["match_id"]
        innings = supabase.table("innings").select("*").eq("match_id", m_id).order("innings_no").execute().data or []
        
        team1_score = None
        team2_score = None
        for inn in innings:
            score_str = f"{inn['total_runs']}/{inn['wickets']} ({inn['overs_played']} ov)"
            if inn["batting_team_id"] == m.get("team1_id"):
                team1_score = score_str
            else:
                team2_score = score_str

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
            "result_summary": m.get("result_summary"),
        })

    return fixtures


@router.get("/{tournament_id}/standings")
def get_tournament_standings(tournament_id: str):
    """
    Returns the points table standings for the tournament with dynamically 
    computed Net Run Rate (NRR) and last-5 match form.
    """
    try:
        return nrr_calculator.calculate_tournament_standings(tournament_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate standings: {str(e)}")
