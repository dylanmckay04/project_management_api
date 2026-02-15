from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import users_router, projects_router, tasks_router
from app.database import Base, engine
from app.core.config import validate_settings

validate_settings()

app = FastAPI(
    title="Project Management API",
    description="A professional project management API with user authentication",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers={"*"}
)

app.include_router(users_router)
app.include_router(projects_router)
app.include_router(tasks_router)


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Welcome to the Project Management API",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

