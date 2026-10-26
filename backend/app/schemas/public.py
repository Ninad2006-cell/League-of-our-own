from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.stats import PointsTableEntry, PlayerCareerStats, MatchPerformance


class TournamentResponse(BaseModel):
    tournament_id: str
    name: str
    level: str
    format: str
    start_date: str
    end_date: str
    status: str
    teams_count: Optional[int] = 0
    matches_count: Optional[int] = 0


class TeamResponse(BaseModel):
    team_id: str
    team_name: str
    city: str
    coach_name: Optional[str] = None
    matches_played: int = 0
    won: int = 0
    lost: int = 0
    points: int = 0
    nrr: float = 0.000
    form: List[str] = Field(default_factory=list)


class PlayerSummary(BaseModel):
    player_id: str
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    name: str
    dob: Optional[str] = None
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None
    role: Optional[str] = None
    runs: int = 0
    wickets: int = 0
    matches: int = 0
    batting_average: float = 0.0
    strike_rate: float = 0.0


class PlayerDetailResponse(BaseModel):
    player_id: str
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    name: str
    dob: Optional[str] = None
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None
    role: Optional[str] = None
    stats: PlayerCareerStats
    recent_performances: List[MatchPerformance] = Field(default_factory=list)


class FixtureResponse(BaseModel):
    match_id: str
    tournament_name: str
    venue_name: str
    match_date: str
    status: str
    overs: int
    team1: Dict[str, Any]
    team2: Dict[str, Any]
    result_summary: Optional[str] = None
    team1_score: Optional[str] = None
    team2_score: Optional[str] = None
