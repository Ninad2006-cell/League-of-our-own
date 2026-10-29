from pydantic import BaseModel
from typing import Optional

class TeamCreate(BaseModel):
    team_name: str
    city: str
    coach_name: Optional[str] = None

class TeamResponse(TeamCreate):
    team_id: str
    created_at: Optional[str] = None
