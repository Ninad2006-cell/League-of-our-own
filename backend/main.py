import sys
from pathlib import Path

# Automatically include local venv packages if executed outside virtualenv
_venv_site = Path(__file__).resolve().parent / "venv" / "Lib" / "site-packages"
if _venv_site.exists() and str(_venv_site) not in sys.path:
    sys.path.insert(0, str(_venv_site))

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import time
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Automatically load environment variables from backend/env or backend/.env
_backend_dir = Path(__file__).resolve().parent
if (_backend_dir / ".env").exists():
    load_dotenv(dotenv_path=_backend_dir / ".env")
elif (_backend_dir / "env").exists():
    load_dotenv(dotenv_path=_backend_dir / "env")
else:
    load_dotenv()

# Real-Life Cricket Live Scoring Cache & Quota Safeguard System
# Free tier grants 100 API hits per day. Caching prevents quota depletion.
SAMPLE_FILE = _backend_dir / "sample_cricket_data.json"
CRICKET_API_KEY_FALLBACK = "f5775aef-f666-46e8-b3f7-20057593b870"
CRICKET_CACHE_TTL = 300  # 5 minutes in seconds

_cricket_cache = {
    "data": None,
    "timestamp": 0.0,
    "source": "empty"
}

def _categorize_cricket_matches(matches):
    live_matches = []
    recent_matches = []
    upcoming_matches = []

    for m in matches:
        ms = str(m.get("ms", "")).lower()
        status = str(m.get("status", "")).lower()
        ended = m.get("matchEnded", False)
        started = m.get("matchStarted", False)

        # 1. Live: ms == "live" or status indicators like "stumps", "day ", "in progress" (and matchEnded is false)
        if (ms == "live" or "stumps" in status or "day " in status or "in progress" in status or (started and not ended)) and not ended and "won" not in status:
            live_matches.append(m)
        # 2. Recent: ms == "result", matchEnded == true, or status includes "won", "tied", "drawn"
        elif ms == "result" or ended or "won" in status or "tied" in status or "drawn" in status:
            recent_matches.append(m)
        # 3. Upcoming: scheduled fixtures that have not yet started
        else:
            upcoming_matches.append(m)

    return live_matches, recent_matches, upcoming_matches

def _load_sample_cricket_data():
    if SAMPLE_FILE.exists():
        try:
            with open(SAMPLE_FILE, "r", encoding="utf-8") as f:
                parsed = json.load(f)
                return parsed.get("data", [])
        except Exception:
            return []
    return []

app = FastAPI(
    title="League Of Our Own API",
    description="API for managing league cricket data, live scoring, and administration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "League Of Our Own API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/live-scores")
def get_real_world_live_scores(
    mode: str = Query("live", description="Data source mode: 'live' or 'sample'"),
    force_refresh: bool = Query(False, description="Bypass cache and force fresh request to CricketData.org")
):
    """
    Returns real-world cricket live scores, recent results, and upcoming fixtures from CricketData.org.
    Safeguarded by a 5-minute backend in-memory cache and local sample data fallback to conserve the 100 hits/day quota.
    """
    global _cricket_cache
    now = time.time()

    # Mode 1: Explicit Sample Mode (0 external API hits)
    if mode == "sample":
        matches = _load_sample_cricket_data()
        live, recent, upcoming = _categorize_cricket_matches(matches)
        return {
            "status": "success",
            "source": "sample",
            "mode": "sample",
            "cache_age_seconds": 0,
            "api_hits_used": 0,
            "total": len(matches),
            "live": live,
            "recent": recent,
            "upcoming": upcoming,
            "data": matches
        }

    # Mode 2: In-Memory Cache Hit (< 300 seconds & force_refresh is False)
    cache_age = int(now - _cricket_cache["timestamp"])
    if not force_refresh and _cricket_cache["data"] is not None and cache_age < CRICKET_CACHE_TTL:
        matches = _cricket_cache["data"]
        live, recent, upcoming = _categorize_cricket_matches(matches)
        return {
            "status": "success",
            "source": "cache",
            "mode": "live",
            "cache_age_seconds": cache_age,
            "api_hits_used": 0,
            "total": len(matches),
            "live": live,
            "recent": recent,
            "upcoming": upcoming,
            "data": matches
        }

    # Mode 3: Cache Expired or force_refresh=True -> Call CricketData.org API (1 hit)
    api_key = os.getenv("CRICKET_API_KEY") or CRICKET_API_KEY_FALLBACK
    url = f"https://api.cricapi.com/v1/cricScore?apikey={api_key}"
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            body = resp.read().decode("utf-8")
            api_resp = json.loads(body)

        if api_resp.get("status") == "success" and "data" in api_resp:
            matches = api_resp.get("data", [])
            _cricket_cache["data"] = matches
            _cricket_cache["timestamp"] = now
            _cricket_cache["source"] = "live"

            # Update sample snapshot for offline fallback
            try:
                with open(SAMPLE_FILE, "w", encoding="utf-8") as f:
                    json.dump(api_resp, f, indent=2)
            except Exception:
                pass

            live, recent, upcoming = _categorize_cricket_matches(matches)
            return {
                "status": "success",
                "source": "live",
                "mode": "live",
                "cache_age_seconds": 0,
                "api_hits_used": 1,
                "total": len(matches),
                "live": live,
                "recent": recent,
                "upcoming": upcoming,
                "data": matches
            }
        else:
            raise ValueError(f"API returned non-success status: {api_resp.get('status')}")

    except Exception as e:
        # Fallback: Serve cached data if present, or sample JSON file
        matches = _cricket_cache["data"] or _load_sample_cricket_data()
        live, recent, upcoming = _categorize_cricket_matches(matches)
        return {
            "status": "success",
            "source": "fallback",
            "mode": "live",
            "cache_age_seconds": cache_age if _cricket_cache["timestamp"] > 0 else 0,
            "api_hits_used": 0,
            "fallback_notice": f"Serving cached/sample cricket data: {str(e)}",
            "total": len(matches),
            "live": live,
            "recent": recent,
            "upcoming": upcoming,
            "data": matches
        }

# Track 1 Routers: Auth & Admin
from app.routers import auth, admin
app.include_router(auth.router, prefix="/api/auth")
app.include_router(admin.router, prefix="/api/admin")

# Track 2 Routers: Live Scoring & Real-Time Matches
from app.routers import scoring, matches
app.include_router(scoring.router, prefix="/api/scoring")
app.include_router(matches.router, prefix="/api/matches")

# Dedicated /ws/matches/{match_id} route alias for frontend WebSocket connection
@app.websocket("/ws/matches/{match_id}")
async def root_match_websocket(websocket: matches.WebSocket, match_id: str):
    await matches.match_realtime_websocket(websocket, match_id)

# Track 3 Routers: Tournaments, Standings, Teams & Players Public API
from app.routers import tournaments, teams, players
app.include_router(tournaments.router, prefix="/api/tournaments")
app.include_router(teams.router, prefix="/api/teams")
app.include_router(players.router, prefix="/api/players")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
