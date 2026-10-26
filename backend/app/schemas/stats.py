from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PointsTableEntry(BaseModel):
    tournament_id: str
    team_id: str
    team_name: str
    team_city: Optional[str] = None
    played: int = 0
    won: int = 0
    lost: int = 0
    tied: int = 0
    nr: int = 0
    points: int = 0
    nrr: float = 0.000
    form: List[str] = Field(default_factory=list, description="Recent match results e.g. ['W', 'W', 'L']")


class PlayerCareerStats(BaseModel):
    player_id: str
    matches_played: int = 0
    runs: int = 0
    balls_faced: int = 0
    batting_average: float = 0.0
    strike_rate: float = 0.0
    fifties: int = 0
    hundreds: int = 0
    wickets: int = 0
    runs_conceded: int = 0
    overs_bowled: float = 0.0
    economy: float = 0.0


class MatchPerformance(BaseModel):
    match_id: str
    match_date: Optional[str] = None
    opponent: str
    runs: int = 0
    balls: int = 0
    wickets: int = 0
    runs_conceded: int = 0
    overs_bowled: float = 0.0
