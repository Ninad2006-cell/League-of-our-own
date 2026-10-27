from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class VenueCreate(BaseModel):
    venue_name: str
    city: str
    capacity: Optional[int] = None

class VenueResponse(VenueCreate):
    venue_id: str

class MatchStatus(str, Enum):
    scheduled = "scheduled"
    upcoming = "upcoming"
    live = "live"
    suspended = "suspended"
    completed = "completed"
    abandoned = "abandoned"

class MatchCreate(BaseModel):
    tournament_id: str
    team1_id: str
    team2_id: str
    venue_id: Optional[str] = None
    scorer_id: Optional[str] = None
    match_date: datetime
    overs: int = 20
    status: Optional[MatchStatus] = MatchStatus.scheduled

class MatchResponse(MatchCreate):
    match_id: str
    toss_winner_id: Optional[str] = None
    toss_decision: Optional[str] = None
    winner_id: Optional[str] = None
    result_summary: Optional[str] = None
    created_at: Optional[str] = None
