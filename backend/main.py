from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    uvicorn.run(app, host="0.0.0.0", port=8000)


