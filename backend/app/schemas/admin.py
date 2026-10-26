from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime


class TournamentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    level: Literal["local", "club", "domestic", "international"] = "local"
    format: Literal["T20", "ODI", "Test", "Other"] = "T20"
    start_date: date
    end_date: date


class TeamCreate(BaseModel):
    team_name: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    coach_name: Optional[str] = None


class PlayerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    team_id: Optional[str] = None
    dob: Optional[date] = None
    batting_style: Optional[str] = "Right-hand bat"
    bowling_style: Optional[str] = "Right-arm medium"
    role: Optional[str] = "Batter"


class VenueCreate(BaseModel):
    venue_name: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    capacity: Optional[int] = 25000


class MatchCreate(BaseModel):
    tournament_id: str
    team1_id: str
    team2_id: str
    venue_id: Optional[str] = None
    scorer_id: Optional[str] = None
    match_date: datetime
    overs: Optional[int] = 20
    status: Optional[str] = "scheduled"
