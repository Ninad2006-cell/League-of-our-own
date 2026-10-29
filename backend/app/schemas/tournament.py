from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum

class TournamentLevel(str, Enum):
    local = "local"
    club = "club"
    domestic = "domestic"
    international = "international"

class MatchFormat(str, Enum):
    T20 = "T20"
    ODI = "ODI"
    Test = "Test"
    Other = "Other"

class TournamentCreate(BaseModel):
    name: str
    level: TournamentLevel
    format: MatchFormat
    start_date: date
    end_date: date

class TournamentResponse(TournamentCreate):
    tournament_id: str
    created_by: Optional[str] = None
    created_at: Optional[str] = None
