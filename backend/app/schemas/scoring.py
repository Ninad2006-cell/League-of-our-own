from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class ExtrasType(str, Enum):
    NONE = "none"
    WIDE = "wide"
    NO_BALL = "no_ball"
    BYE = "bye"
    LEG_BYE = "leg_bye"


class WicketType(str, Enum):
    NONE = "none"
    BOWLED = "bowled"
    CAUGHT = "caught"
    LBW = "lbw"
    RUN_OUT = "run_out"
    STUMPED = "stumped"
    HIT_WICKET = "hit_wicket"


class StartMatchRequest(BaseModel):
    toss_winner_id: str = Field(..., description="UUID of the team winning the toss")
    toss_decision: str = Field(..., description="'bat' or 'bowl'")
    team1_playing_xi: Optional[List[str]] = Field(default=None, description="List of 11 player UUIDs for Team 1")
    team2_playing_xi: Optional[List[str]] = Field(default=None, description="List of 11 player UUIDs for Team 2")
    striker_id: str = Field(..., description="UUID of opening batsman on strike")
    non_striker_id: str = Field(..., description="UUID of opening non-striker batsman")
    bowler_id: str = Field(..., description="UUID of opening bowler")
    overs: int = Field(default=20, description="Total match overs (default 20)")


class RecordBallRequest(BaseModel):
    striker_id: str = Field(..., description="Current batsman on strike")
    non_striker_id: str = Field(..., description="Current non-striker batsman")
    bowler_id: str = Field(..., description="Current bowler")
    runs_scored: int = Field(default=0, ge=0, le=7, description="Runs scored off the bat or extras runs")
    extras_type: ExtrasType = Field(default=ExtrasType.NONE, description="Type of extra delivery")
    extras_runs: int = Field(default=0, ge=0, description="Additional penalty runs (e.g., 1 for wide/no-ball)")
    is_wicket: bool = Field(default=False, description="True if a wicket fell on this ball")
    wicket_type: WicketType = Field(default=WicketType.NONE, description="Method of dismissal")
    dismissed_player_id: Optional[str] = Field(default=None, description="UUID of player dismissed")
    next_batsman_id: Optional[str] = Field(default=None, description="UUID of incoming batsman if wicket fell")


class EndInningsRequest(BaseModel):
    target_runs: Optional[int] = Field(default=None, description="Explicit target runs for the second innings")


class CompleteMatchRequest(BaseModel):
    winner_id: Optional[str] = Field(default=None, description="UUID of winning team or None for tie/abandoned")
    result_summary: str = Field(..., description="E.g., 'Rangers won by 14 runs'")
