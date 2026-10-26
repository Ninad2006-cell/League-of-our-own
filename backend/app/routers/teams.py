from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from supabase_client import get_supabase_client

router = APIRouter(tags=["Teams & Squads"])


@router.get("")
def list_teams():
    """
    Returns list of all domestic and franchise teams.
    """
    supabase = get_supabase_client()
    teams = supabase.table("teams").select("*").order("team_name").execute().data or []
    
    result = []
    for t in teams:
        t_id = t["team_id"]
        # Squad count
        player_count = supabase.table("players").select("player_id", count="exact").eq("team_id", t_id).execute().count or 0
        result.append({
            "team_id": t_id,
            "team_name": t.get("team_name"),
            "city": t.get("city"),
            "coach_name": t.get("coach_name"),
            "squad_count": player_count
        })
    return result


@router.get("/{team_id}")
def get_team_profile(team_id: str):
    """
    Returns comprehensive team profile:
    - Team details and coach
    - Full squad roster of players
    - Recent match fixtures
    """
    supabase = get_supabase_client()
    team_res = supabase.table("teams").select("*").eq("team_id", team_id).execute()
    if not team_res.data:
        raise HTTPException(status_code=404, detail="Team not found")
    team = team_res.data[0]

    # Squad roster
    squad = (
        supabase.table("players")
        .select("player_id, name, role, batting_style, bowling_style, dob")
        .eq("team_id", team_id)
        .order("name")
        .execute()
        .data
        or []
    )

    # Recent matches
    matches = (
        supabase.table("matches")
        .select("*, team1:teams!team1_id(team_name), team2:teams!team2_id(team_name), venue:venues(venue_name)")
        .or_(f"team1_id.eq.{team_id},team2_id.eq.{team_id}")
        .order("match_date", desc=True)
        .limit(10)
        .execute()
        .data
        or []
    )

    return {
        "team_id": team["team_id"],
        "team_name": team.get("team_name"),
        "city": team.get("city"),
        "coach_name": team.get("coach_name"),
        "squad": squad,
        "recent_matches": matches
    }
