from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any, Optional
from supabase_client import get_supabase_client
from app.auth import require_admin
from app.schemas.admin import (
    TournamentCreate,
    TeamCreate,
    PlayerCreate,
    VenueCreate,
    MatchCreate
)
from app.schemas.auth import RoleUpdateRequest

router = APIRouter(tags=["Administrator"])


@router.post("/tournaments", status_code=status.HTTP_201_CREATED)
def create_tournament(req: TournamentCreate, admin: dict = Depends(require_admin)):
    """
    Creates a new tournament in the database.
    """
    supabase = get_supabase_client()
    data = {
        "name": req.name.strip(),
        "level": req.level,
        "format": req.format,
        "start_date": str(req.start_date),
        "end_date": str(req.end_date),
        "created_by": admin.get("user_id")
    }
    res = supabase.table("tournaments").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create tournament.")
    return res.data[0]


@router.post("/teams", status_code=status.HTTP_201_CREATED)
def create_team(req: TeamCreate, admin: dict = Depends(require_admin)):
    """
    Registers a new team.
    """
    supabase = get_supabase_client()
    data = {
        "team_name": req.team_name.strip(),
        "city": req.city.strip(),
        "coach_name": req.coach_name.strip() if req.coach_name else None
    }
    res = supabase.table("teams").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create team.")
    return res.data[0]


@router.post("/players", status_code=status.HTTP_201_CREATED)
def create_player(req: PlayerCreate, admin: dict = Depends(require_admin)):
    """
    Adds a new player and initializes their stats table entry.
    """
    supabase = get_supabase_client()
    data = {
        "name": req.name.strip(),
        "team_id": req.team_id,
        "dob": str(req.dob) if req.dob else None,
        "batting_style": req.batting_style,
        "bowling_style": req.bowling_style,
        "role": req.role
    }
    res = supabase.table("players").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create player.")
    
    player = res.data[0]
    # Initialize career stats row
    try:
        supabase.table("player_stats").insert({
            "player_id": player["player_id"],
            "matches_played": 0,
            "runs": 0,
            "balls_faced": 0,
            "wickets": 0,
            "runs_conceded": 0,
            "overs_bowled": 0.0,
            "strike_rate": 0.0,
            "economy": 0.0
        }).execute()
    except Exception as e:
        print(f"Warning: could not initialize player_stats row: {e}")

    return player


@router.post("/venues", status_code=status.HTTP_201_CREATED)
def create_venue(req: VenueCreate, admin: dict = Depends(require_admin)):
    """
    Adds a cricket venue / stadium.
    """
    supabase = get_supabase_client()
    data = {
        "venue_name": req.venue_name.strip(),
        "city": req.city.strip(),
        "capacity": req.capacity
    }
    res = supabase.table("venues").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create venue.")
    return res.data[0]


@router.post("/matches", status_code=status.HTTP_201_CREATED)
def schedule_match(req: MatchCreate, admin: dict = Depends(require_admin)):
    """
    Schedules a match fixture with assigned scorer.
    """
    supabase = get_supabase_client()
    data = {
        "tournament_id": req.tournament_id,
        "team1_id": req.team1_id,
        "team2_id": req.team2_id,
        "venue_id": req.venue_id,
        "scorer_id": req.scorer_id,
        "match_date": req.match_date.isoformat(),
        "overs": req.overs or 20,
        "status": req.status or "scheduled"
    }
    res = supabase.table("matches").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to schedule match.")
    return res.data[0]


@router.get("/scorers")
def list_available_scorers(admin: dict = Depends(require_admin)):
    """
    Lists all registered users with role 'scorer' or 'admin' eligible for match assignment.
    """
    supabase = get_supabase_client()
    res = supabase.table("users").select("user_id, name, email, role").in_("role", ["scorer", "admin"]).execute()
    return res.data or []


@router.patch("/users/{user_id}/role")
def update_user_role(user_id: str, req: RoleUpdateRequest, admin: dict = Depends(require_admin)):
    """
    Promotes or updates a user's role (user, scorer, admin).
    """
    supabase = get_supabase_client()
    res = supabase.table("users").update({"role": req.role}).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found or update failed.")
    return {"message": f"User role updated to {req.role}", "user": res.data[0]}
