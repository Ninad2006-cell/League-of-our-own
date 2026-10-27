import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import require_admin, UserResponse, MOCK_USERS_DB
from app.schemas.auth import UserRole, RoleUpdateRequest
from app.schemas.tournament import TournamentCreate, TournamentResponse
from app.schemas.team import TeamCreate, TeamResponse
from app.schemas.player import PlayerCreate, PlayerResponse
from app.schemas.match import VenueCreate, VenueResponse, MatchCreate, MatchResponse
from app.supabase_client import get_supabase_admin, get_supabase

router = APIRouter()

# In-memory storage stores for local development without live Supabase connection
MOCK_TOURNAMENTS = []
MOCK_TEAMS = []
MOCK_PLAYERS = []
MOCK_VENUES = []
MOCK_MATCHES = []

# ==================== TOURNAMENT MANAGEMENT ====================
@router.post("/tournaments", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED)
def create_tournament(
    payload: TournamentCreate,
    current_admin: UserResponse = Depends(require_admin)
):
    """Admin creates a new cricket tournament."""
    supabase = get_supabase_admin() or get_supabase()
    tournament_id = str(uuid.uuid4())
    
    if supabase:
        try:
            res = supabase.table("tournaments").insert({
                "tournament_id": tournament_id,
                "name": payload.name,
                "level": payload.level.value,
                "format": payload.format.value,
                "start_date": str(payload.start_date),
                "end_date": str(payload.end_date),
                "created_by": current_admin.user_id,
            }).execute()
            if res.data:
                return TournamentResponse(**res.data[0])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

    record = {
        "tournament_id": tournament_id,
        "name": payload.name,
        "level": payload.level,
        "format": payload.format,
        "start_date": payload.start_date,
        "end_date": payload.end_date,
        "created_by": current_admin.user_id,
    }
    MOCK_TOURNAMENTS.append(record)
    return TournamentResponse(**record)

# ==================== TEAM MANAGEMENT ====================
@router.post("/teams", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def register_team(
    payload: TeamCreate,
    current_admin: UserResponse = Depends(require_admin)
):
    """Admin registers a new team."""
    supabase = get_supabase_admin() or get_supabase()
    team_id = str(uuid.uuid4())
    
    if supabase:
        try:
            res = supabase.table("teams").insert({
                "team_id": team_id,
                "team_name": payload.team_name,
                "city": payload.city,
                "coach_name": payload.coach_name,
            }).execute()
            if res.data:
                return TeamResponse(**res.data[0])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

    record = {
        "team_id": team_id,
        "team_name": payload.team_name,
        "city": payload.city,
        "coach_name": payload.coach_name,
    }
    MOCK_TEAMS.append(record)
    return TeamResponse(**record)

# ==================== PLAYER MANAGEMENT ====================
@router.post("/players", response_model=PlayerResponse, status_code=status.HTTP_201_CREATED)
def register_player(
    payload: PlayerCreate,
    current_admin: UserResponse = Depends(require_admin)
):
    """Admin registers a player and assigns to team."""
    supabase = get_supabase_admin() or get_supabase()
    player_id = str(uuid.uuid4())
    
    if supabase:
        try:
            res = supabase.table("players").insert({
                "player_id": player_id,
                "team_id": payload.team_id,
                "name": payload.name,
                "dob": str(payload.dob) if payload.dob else None,
                "batting_style": payload.batting_style,
                "bowling_style": payload.bowling_style,
                "role": payload.role,
            }).execute()
            if res.data:
                return PlayerResponse(**res.data[0])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

    record = {
        "player_id": player_id,
        "team_id": payload.team_id,
        "name": payload.name,
        "dob": payload.dob,
        "batting_style": payload.batting_style,
        "bowling_style": payload.bowling_style,
        "role": payload.role,
    }
    MOCK_PLAYERS.append(record)
    return PlayerResponse(**record)

# ==================== VENUE MANAGEMENT ====================
@router.post("/venues", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
def add_venue(
    payload: VenueCreate,
    current_admin: UserResponse = Depends(require_admin)
):
    """Admin registers a stadium or venue."""
    supabase = get_supabase_admin() or get_supabase()
    venue_id = str(uuid.uuid4())
    
    if supabase:
        try:
            res = supabase.table("venues").insert({
                "venue_id": venue_id,
                "venue_name": payload.venue_name,
                "city": payload.city,
                "capacity": payload.capacity,
            }).execute()
            if res.data:
                return VenueResponse(**res.data[0])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

    record = {
        "venue_id": venue_id,
        "venue_name": payload.venue_name,
        "city": payload.city,
        "capacity": payload.capacity,
    }
    MOCK_VENUES.append(record)
    return VenueResponse(**record)

# ==================== MATCH SCHEDULING ====================
@router.post("/matches", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
def schedule_match(
    payload: MatchCreate,
    current_admin: UserResponse = Depends(require_admin)
):
    """Admin schedules fixture and assigns official scorer."""
    if payload.team1_id == payload.team2_id:
        raise HTTPException(status_code=400, detail="Team 1 and Team 2 must be distinct teams.")

    supabase = get_supabase_admin() or get_supabase()
    match_id = str(uuid.uuid4())
    
    if supabase:
        try:
            res = supabase.table("matches").insert({
                "match_id": match_id,
                "tournament_id": payload.tournament_id,
                "team1_id": payload.team1_id,
                "team2_id": payload.team2_id,
                "venue_id": payload.venue_id,
                "scorer_id": payload.scorer_id,
                "match_date": payload.match_date.isoformat(),
                "overs": payload.overs,
                "status": payload.status.value if payload.status else "scheduled",
            }).execute()
            if res.data:
                return MatchResponse(**res.data[0])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

    record = {
        "match_id": match_id,
        "tournament_id": payload.tournament_id,
        "team1_id": payload.team1_id,
        "team2_id": payload.team2_id,
        "venue_id": payload.venue_id,
        "scorer_id": payload.scorer_id,
        "match_date": payload.match_date,
        "overs": payload.overs,
        "status": payload.status,
    }
    MOCK_MATCHES.append(record)
    return MatchResponse(**record)

# ==================== SCORER & USER ROLES ====================
@router.get("/scorers", response_model=List[UserResponse])
def list_available_scorers(
    current_admin: UserResponse = Depends(require_admin)
):
    """Admin retrieves list of all users with role 'scorer' for match assignment."""
    supabase = get_supabase_admin() or get_supabase()
    if supabase:
        try:
            res = supabase.table("users").select("*").eq("role", "scorer").execute()
            if res.data:
                return [UserResponse(**u) for u in res.data]
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    scorers = [
        UserResponse(
            user_id=u["user_id"],
            name=u["name"],
            email=u["email"],
            role=u["role"],
        )
        for u in MOCK_USERS_DB.values()
        if u["role"] == UserRole.scorer
    ]
    return scorers

@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: str,
    payload: RoleUpdateRequest,
    current_admin: UserResponse = Depends(require_admin)
):
    """Admin updates or promotes a user's role ('user', 'scorer', 'admin')."""
    supabase = get_supabase_admin() or get_supabase()
    if supabase:
        try:
            res = supabase.table("users").update({"role": payload.role.value}).eq("user_id", user_id).execute()
            if res.data:
                return UserResponse(**res.data[0])
            raise HTTPException(status_code=404, detail="User not found.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    for email, u in MOCK_USERS_DB.items():
        if u["user_id"] == user_id:
            u["role"] = payload.role
            return UserResponse(
                user_id=u["user_id"],
                name=u["name"],
                email=u["email"],
                role=u["role"],
            )
    raise HTTPException(status_code=404, detail="User not found.")
