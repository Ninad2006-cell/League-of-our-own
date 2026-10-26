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

# Track 2 Routers: Live Scoring & Real-Time Matches
from app.routers import scoring, matches
app.include_router(scoring.router, prefix="/api/scoring")
app.include_router(matches.router, prefix="/api/matches")

# Dedicated /ws/matches/{match_id} route alias for frontend WebSocket connection
@app.websocket("/ws/matches/{match_id}")
async def root_match_websocket(websocket: matches.WebSocket, match_id: str):
    await matches.match_realtime_websocket(websocket, match_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

