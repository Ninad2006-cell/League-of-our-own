from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.stats_engine import stats_engine
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from supabase_client import get_supabase_client

router = APIRouter(tags=["Players & Profiles"])


@router.get("")
def list_players(
    search: Optional[str] = Query(None, description="Search player by name"),
    role: Optional[str] = Query(None, description="Filter by role: Batter, Bowler, All-Rounder, Wicket-Keeper"),
    team_id: Optional[str] = Query(None, description="Filter by team UUID")
):
    """
    Search and filter players with career overview stats.
    """
    supabase = get_supabase_client()
    query = supabase.table("players").select("*, team:teams(team_name)")

    if search:
        query = query.ilike("name", f"%{search}%")
    if role and role.lower() != "all":
        query = query.ilike("role", f"%{role}%")
    if team_id:
        query = query.eq("team_id", team_id)

    players = query.order("name").execute().data or []

    result = []
    for p in players:
        p_id = p["player_id"]
        career = stats_engine.get_player_career_stats(p_id)
        result.append({
            "player_id": p_id,
            "name": p.get("name"),
            "team_id": p.get("team_id"),
            "team_name": p.get("team", {}).get("team_name") if p.get("team") else None,
            "role": p.get("role"),
            "batting_style": p.get("batting_style"),
            "bowling_style": p.get("bowling_style"),
            "matches": career["matches_played"],
            "runs": career["runs"],
            "wickets": career["wickets"],
            "batting_average": career["batting_average"],
            "strike_rate": career["strike_rate"],
        })

    return result


@router.get("/{player_id}")
def get_player_profile(player_id: str):
    """
    Returns full player profile:
    - Biographical information and team affiliation
    - Detailed career metrics (batting average, SR, 50s/100s, wickets, economy)
    - Last 5 match performances form guide
    """
    supabase = get_supabase_client()
    p_res = supabase.table("players").select("*, team:teams(team_name, city)").eq("player_id", player_id).execute()
    if not p_res.data:
        raise HTTPException(status_code=404, detail="Player not found")
    player = p_res.data[0]

    career_stats = stats_engine.get_player_career_stats(player_id)
    recent_form = stats_engine.get_player_recent_form(player_id, limit=5)

    return {
        "player_id": player["player_id"],
        "name": player.get("name"),
        "dob": str(player.get("dob")) if player.get("dob") else None,
        "team_id": player.get("team_id"),
        "team_name": player.get("team", {}).get("team_name") if player.get("team") else None,
        "team_city": player.get("team", {}).get("city") if player.get("team") else None,
        "role": player.get("role"),
        "batting_style": player.get("batting_style"),
        "bowling_style": player.get("bowling_style"),
        "career_stats": career_stats,
        "recent_performances": recent_form
    }
