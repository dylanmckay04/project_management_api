from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Project
from app.schemas import ProjectCreate, ProjectRead, ProjectUpdate, ProjectReadDetailed
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new project
    
    - **name**: Project name
    - **description**: Project description (optional)
    """
    db_project = Project(
        name=project.name,
        description=project.description,
        owner_id=current_user.id
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return db_project


@router.get("/", response_model=List[ProjectRead])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """
    List all projects owned by the current user
    
    - **skip**: Number of projects to skip (for pagination)
    - **limit**: Maximum number of projects to return
    """
    projects = db.query(Project).filter(Project.owner_id == current_user.id).offset(skip).limit(limit).all()
    
    return projects


@router.get("/{project_id}", response_model=ProjectReadDetailed)
async def read_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific project with all of its tasks
    """
    project = db.query(Project).filter(Project.id == project_id).filter(Project.owner_id == current_user.id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project


@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a project
    """
    project = db.query(Project).filter(Project.id == project_id).filter(Project.owner_id == current_user.id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project_update.name:
        project.name = project_update.name
    
    if project_update.description:
        project.description = project_update.description
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a project (cascades to delete all tasks)
    """
    project = db.query(Project).filter(Project.id == project_id).filter(Project.owner_id == current_user.id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(project)
    db.commit()
