from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Project, Task
from app.schemas import TaskCreate, TaskRead, TaskUpdate, TaskReadDetailed
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task in a project
    
    - **title**: Task title
    - **description**: Task description (optional)
    - **project_id**: ID of the project this task belongs to
    - **assigned_to**: User ID to be assigned to this task
    - **priority**: Priority level (low, medium, high)
    - **due_date**: Due date (optional)
    """ 
    project = db.query(Project).filter(Project.id == task.project_id).filter(Project.owner_id == current_user.id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if task.assigned_to:
        assigned_user = db.query(User).filter(User.id == task.assigned_to).first()
        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )
    
    db_task = Task(
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        assigned_to=task.assigned_to,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task


@router.get("/", response_model=List[TaskRead])
async def list_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    project_id: int = None,
    task_status: str = None,
    skip: int = 0,
    limit: int = 10
):
    """
    List tasks with filtering
    
    - **project_id**: Filter by project ID
    - **task_status**: Filter by status (todo, in_progress, completed)
    - **skip**: Number of taks to skip (for pagination)
    - **limit**: Maximum number of tasks to return
    """
    from app.models.task import TaskStatus
    
    if task_status:
        valid_statuses = [s.value for s in TaskStatus]
        if task_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
    
    query = db.query(Task).join(Project).filter(Project.owner_id == current_user.id)
    
    if project_id:
        query = query.filter(Task.project_id == project_id)
    
    if task_status:
        query = query.filter(Task.status == task_status)
    
    tasks = query.offset(skip).limit(limit).all()
    
    return tasks


@router.get("/{task_id}", response_model=TaskReadDetailed)
async def read_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific task with assigned user details
    """
    task = db.query(Task).join(Project).filter(Project.owner_id == current_user.id).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a task
    """
    task = db.query(Task).join(Project).filter(Project.owner_id == current_user.id).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    
    if task_update.title:
        task.title = task_update.title
    
    if task_update.description is not None:
        task.description = task_update.description
    
    if task_update.status:
        task.status = task_update.status
    
    if task_update.priority:
        task.priority = task_update.priority
    
    if task_update.assigned_to is not None:
        if task_update.assigned_to:
            assigned_user = db.query(User).filter(User.id == current_user.id).first()
            if not assigned_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assigned user not found"
                )
        task.assigned_to = task_update.assigned_to

    if task_update.due_date is not None:
        task.due_date = task_update.due_date
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a task
    """
    task = db.query(Task).join(Project).filter(Project.owner_id == current_user.id).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()

