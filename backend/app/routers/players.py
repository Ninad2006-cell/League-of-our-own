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
    Uses the pre-aggregated player_stats table for fast listing.
    Falls back to 0 stats for players without a player_stats row.
    """
    supabase = get_supabase_client()
    query = supabase.table("players").select("*, team:teams(team_name)")

    if search:
        query = query.ilike("name", f"%{search}%")
    if role and role.lower() != "all":
        r_low = role.lower().strip()
        if "bat" in r_low:
            query = query.or_("role.ilike.%bat%,role.ilike.%batter%,role.ilike.%batsman%")
        elif "bowl" in r_low:
            query = query.ilike("role", "%bowl%")
        elif "all" in r_low:
            query = query.or_("role.ilike.%all-round%,role.ilike.%all round%,role.ilike.%allrounder%")
        elif "keep" in r_low or "wicket" in r_low or "wk" in r_low:
            query = query.or_("role.ilike.%keeper%,role.ilike.%wicket%")
        else:
            query = query.ilike("role", f"%{role}%")
    if team_id:
        query = query.eq("team_id", team_id)

    players = query.order("name").execute().data or []

    # Batch-fetch pre-aggregated stats from player_stats table
    player_ids = [p["player_id"] for p in players]
    stats_map = {}
    if player_ids:
        # Supabase .in_() supports lists; fetch all stats in a single query
        stats_rows = (
            supabase.table("player_stats")
            .select("*")
            .in_("player_id", player_ids)
            .execute()
            .data or []
        )
        for s in stats_rows:
            stats_map[s["player_id"]] = s

    result = []
    for p in players:
        p_id = p["player_id"]
        ps = stats_map.get(p_id, {})
        runs = int(ps.get("runs", 0))
        balls_faced = int(ps.get("balls_faced", 0))
        wickets = int(ps.get("wickets", 0))
        matches_played = int(ps.get("matches_played", 0))

        # Compute batting average and strike rate from stored aggregates
        stored_sr = float(ps.get("strike_rate", 0.0) or 0.0)
        strike_rate_val = stored_sr if stored_sr > 0 else (round((runs / balls_faced) * 100, 2) if balls_faced > 0 else 0.0)
        batting_avg_val = round(runs / max(1, matches_played), 2) if matches_played > 0 else 0.0

        result.append({
            "player_id": p_id,
            "name": p.get("name"),
            "team_id": p.get("team_id"),
            "team_name": p.get("team", {}).get("team_name") if p.get("team") else None,
            "role": p.get("role"),
            "batting_style": p.get("batting_style"),
            "bowling_style": p.get("bowling_style"),
            "matches": matches_played,
            "runs": runs,
            "wickets": wickets,
            "batting_average": batting_avg_val,
            "strike_rate": strike_rate_val,
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

    # Fallback to player_stats table if dynamic ball_events stats are 0
    if career_stats.get("matches_played", 0) == 0 and career_stats.get("runs", 0) == 0 and career_stats.get("wickets", 0) == 0:
        ps_res = supabase.table("player_stats").select("*").eq("player_id", player_id).execute()
        if ps_res.data:
            ps = ps_res.data[0]
            runs = int(ps.get("runs", 0))
            balls_faced = int(ps.get("balls_faced", 0))
            wickets = int(ps.get("wickets", 0))
            matches_played = int(ps.get("matches_played", 0))
            stored_sr = float(ps.get("strike_rate", 0.0) or 0.0)
            sr_val = stored_sr if stored_sr > 0 else (round((runs / balls_faced) * 100, 2) if balls_faced > 0 else 0.0)
            avg_val = round(runs / max(1, matches_played), 2) if matches_played > 0 else 0.0

            career_stats = {
                "player_id": player_id,
                "matches_played": matches_played,
                "runs": runs,
                "balls_faced": balls_faced,
                "batting_average": avg_val,
                "strike_rate": sr_val,
                "fifties": 1 if 50 <= runs < 100 else (2 if runs >= 100 else 0),
                "hundreds": 1 if runs >= 100 else 0,
                "wickets": wickets,
                "runs_conceded": int(ps.get("runs_conceded", 0)),
                "overs_bowled": float(ps.get("overs_bowled", 0.0)),
                "economy": float(ps.get("economy", 0.0))
            }

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
