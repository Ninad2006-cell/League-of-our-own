from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


class PlayerInningStats(BaseModel):
    player_id: str
    name: str
    runs: int = 0
    balls: int = 0
    fours: int = 0
    sixes: int = 0
    strike_rate: float = 0.0
    is_striker: bool = False
    is_out: bool = False
    dismissal: Optional[str] = None


class BowlerInningStats(BaseModel):
    player_id: str
    name: str
    overs: float = 0.0
    maidens: int = 0
    runs: int = 0
    wickets: int = 0
    economy: float = 0.0


class BallEventLog(BaseModel):
    ball_id: str
    over_no: int
    ball_no: int
    display_over: str  # e.g., "16.2"
    runs_scored: int
    extras_type: str
    extras_runs: int
    is_wicket: bool
    wicket_type: str
    striker_name: str
    bowler_name: str
    commentary: str


class LiveMatchScorecard(BaseModel):
    match_id: str
    tournament_name: str
    venue_name: str
    status: str
    overs_limit: int
    team1: Dict[str, Any]
    team2: Dict[str, Any]
    current_innings_no: int
    batting_team: Dict[str, Any]
    bowling_team: Dict[str, Any]
    total_runs: int
    wickets: int
    overs_played: float
    target_runs: Optional[int] = None
    crr: float = 0.0
    rrr: Optional[float] = None
    striker: Optional[PlayerInningStats] = None
    non_striker: Optional[PlayerInningStats] = None
    current_bowler: Optional[BowlerInningStats] = None
    recent_balls: List[str] = Field(default_factory=list)
    recent_balls_log: List[BallEventLog] = Field(default_factory=list)
    last_wicket: Optional[str] = None
    result_summary: Optional[str] = None
