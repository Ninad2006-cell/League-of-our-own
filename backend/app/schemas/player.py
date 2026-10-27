from pydantic import BaseModel
from typing import Optional
from datetime import date

class PlayerCreate(BaseModel):
    team_id: Optional[str] = None
    name: str
    dob: Optional[date] = None
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None
    role: Optional[str] = None

class PlayerResponse(PlayerCreate):
    player_id: str
    created_at: Optional[str] = None
