from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.schemas.scoring import (
    StartMatchRequest,
    RecordBallRequest,
    EndInningsRequest,
    CompleteMatchRequest,
)
from app.services.scoring_service import scoring_service

router = APIRouter(tags=["Scoring"])


# Optional/Mockable Scorer Dependency (Decoupled from Track 1 Auth)
async def require_scorer_access():
    # Ready for Track 1 auth integration: can inspect Header or JWT, default allowed in dev
    return {"user_id": "system_scorer", "role": "scorer"}


@router.post("/matches/{match_id}/start")
async def start_match_scoring(
    match_id: str,
    payload: StartMatchRequest,
    user: dict = Depends(require_scorer_access)
):
    """
    Initializes match scoring by recording the toss winner, toss decision, 
    and setting up the 1st innings with opening batsmen and bowler.
    """
    try:
        return await scoring_service.start_match(match_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start match: {str(e)}")


@router.post("/matches/{match_id}/ball")
async def record_delivery(
    match_id: str,
    payload: RecordBallRequest,
    user: dict = Depends(require_scorer_access)
):
    """
    Logs a single ball event:
    - Handles legal vs. extra deliveries (wide, no-ball, bye, leg-bye)
    - Records runs, wickets, and dismissals
    - Calculates strike rotation and over completions
    - Broadcasts the live update to all WebSocket viewers
    """
    try:
        return await scoring_service.record_ball(match_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record delivery: {str(e)}")


@router.post("/matches/{match_id}/undo")
async def undo_delivery(
    match_id: str,
    user: dict = Depends(require_scorer_access)
):
    """
    Reverses the most recent delivery in the active inning and restores 
    the previous over/ball state.
    """
    try:
        return await scoring_service.undo_last_ball(match_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to undo delivery: {str(e)}")


@router.post("/matches/{match_id}/end-innings")
async def end_match_innings(
    match_id: str,
    payload: Optional[EndInningsRequest] = None,
    user: dict = Depends(require_scorer_access)
):
    """
    Locks the current inning and initializes the second innings with target runs.
    """
    try:
        target = payload.target_runs if payload else None
        return await scoring_service.end_innings(match_id, target_runs=target)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to end innings: {str(e)}")


@router.post("/matches/{match_id}/complete")
async def complete_match_scoring(
    match_id: str,
    payload: CompleteMatchRequest,
    user: dict = Depends(require_scorer_access)
):
    """
    Concludes the match, declares the final winner and summary, and closes all innings.
    """
    try:
        return await scoring_service.complete_match(
            match_id,
            winner_id=payload.winner_id,
            result_summary=payload.result_summary
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete match: {str(e)}")
