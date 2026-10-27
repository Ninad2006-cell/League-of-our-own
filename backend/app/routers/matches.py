from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query
from typing import Optional, List
from app.services.scoring_service import scoring_service
from app.services.connection_manager import manager
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from supabase_client import get_supabase_client

router = APIRouter(tags=["Matches & Live Streaming"])


@router.get("")
def list_matches(status: Optional[str] = Query(None, description="Filter by status: scheduled, upcoming, live, completed")):
    """
    Returns list of matches/fixtures with team, venue, tournament details and result summaries.
    """
    supabase = get_supabase_client()
    query = supabase.table("matches").select("*, team1:teams!team1_id(*), team2:teams!team2_id(*), venue:venues(*), tournament:tournaments(*)")
    if status:
        query = query.eq("status", status)
    matches = query.order("match_date", desc=True).execute().data or []

    # Batch-fetch innings to provide team scores
    match_ids = [m["match_id"] for m in matches]
    innings_by_match = {}
    if match_ids:
        all_innings = (
            supabase.table("innings")
            .select("match_id, batting_team_id, total_runs, wickets, overs_played, innings_no")
            .in_("match_id", match_ids)
            .order("innings_no")
            .execute()
            .data or []
        )
        for inn in all_innings:
            mid = inn["match_id"]
            if mid not in innings_by_match:
                innings_by_match[mid] = []
            innings_by_match[mid].append(inn)

    for m in matches:
        mid = m["match_id"]
        inns = innings_by_match.get(mid, [])
        t1_score = None
        t2_score = None
        for inn in inns:
            score_str = f"{inn['total_runs']}/{inn['wickets']} ({inn['overs_played']} ov)"
            if inn["batting_team_id"] == m.get("team1_id"):
                t1_score = score_str
            else:
                t2_score = score_str
        m["team1_score"] = t1_score
        m["team2_score"] = t2_score

        # Populate result_summary if absent
        if not m.get("result_summary"):
            winner_id = m.get("winner_id")
            m_status = (m.get("status") or "").lower()
            if winner_id:
                t1 = m.get("team1") or {}
                t2 = m.get("team2") or {}
                if winner_id == t1.get("team_id"):
                    m["result_summary"] = f"{t1.get('team_name', 'Team 1')} won"
                elif winner_id == t2.get("team_id"):
                    m["result_summary"] = f"{t2.get('team_name', 'Team 2')} won"
            elif m_status == "live":
                m["result_summary"] = "Match in progress"
            elif m_status == "completed":
                m["result_summary"] = "Match completed"

    return matches



@router.get("/{match_id}")
def get_match_details(match_id: str):
    """
    Returns match metadata.
    """
    try:
        return scoring_service.get_match(match_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{match_id}/live")
async def get_live_match_scorecard(match_id: str):
    """
    Returns the compiled live scorecard for the match:
    - Match header & toss information
    - Active inning totals (runs, wickets, overs, CRR, RRR)
    - Active batsmen on crease & active bowler figures
    - Ribbon history & detailed ball event log
    """
    try:
        return await scoring_service.compile_live_scorecard(match_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch live scorecard: {str(e)}")


@router.get("/{match_id}/commentary")
def get_ball_by_ball_commentary(match_id: str):
    """
    Returns the complete ball-by-ball commentary feed for the match.
    """
    supabase = get_supabase_client()
    innings = (
        supabase.table("innings")
        .select("innings_id, innings_no")
        .eq("match_id", match_id)
        .order("innings_no")
        .execute()
        .data
        or []
    )
    if not innings:
        return []

    inning_ids = [i["innings_id"] for i in innings]
    balls = (
        supabase.table("ball_events")
        .select("*, striker:striker_id(name), bowler:bowler_id(name)")
        .in_("innings_id", inning_ids)
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )

    commentary = []
    for b in balls:
        striker = b.get("striker", {}).get("name", "Batsman") if b.get("striker") else "Batsman"
        bowler = b.get("bowler", {}).get("name", "Bowler") if b.get("bowler") else "Bowler"
        text = f"{bowler} to {striker}: {b.get('runs_scored', 0)} run(s)"
        if b.get("is_wicket"):
            text = f"WICKET! {striker} dismissed ({b.get('wicket_type')}) b {bowler}."
        elif b.get("extras_type") != "none":
            text = f"EXTRA ({b.get('extras_type')}) - {b.get('extras_runs')} run(s) awarded."

        commentary.append({
            "ball_id": b["ball_id"],
            "over": f"{b['over_no']}.{b['ball_no']}",
            "text": text,
            "runs": b.get("runs_scored", 0),
            "extras": b.get("extras_runs", 0),
            "is_wicket": b.get("is_wicket", False),
            "created_at": b.get("created_at")
        })

    return commentary


@router.websocket("/ws/{match_id}")
async def match_realtime_websocket(websocket: WebSocket, match_id: str):
    """
    Sub-2-second live streaming WebSocket endpoint.
    Broadcasts real-time events:
    - BALL_RECORDED
    - BALL_UNDONE
    - INNINGS_ENDED
    - MATCH_COMPLETED
    """
    await manager.connect(match_id, websocket)
    try:
        # Send initial scorecard on connection
        try:
            initial_score = await scoring_service.compile_live_scorecard(match_id)
            await websocket.send_json({"event": "CONNECTED", "scorecard": initial_score})
        except Exception:
            pass

        # Keep connection open and listen for any client messages/pings
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(match_id, websocket)
    except Exception:
        manager.disconnect(match_id, websocket)
