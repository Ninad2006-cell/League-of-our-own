from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, admin

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Cricket Data Management System (CDMS) REST API with Supabase & Role-Based Access Control",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Track 1: Auth & Admin routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication & Identity"])
app.include_router(admin.router, prefix="/api/admin", tags=["Administration"])

@app.get("/")
def read_root():
    return {
        "message": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
