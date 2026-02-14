from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models import TaskStatus, TaskPriority

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class TaskCreate(TaskBase):
    project_id: int
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskRead(TaskBase):
    id: int
    project_id: int
    assigned_to: Optional[int] = None
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TaskReadDetailed(TaskRead):
    assigned_user: Optional["UserRead"] = None


# Avoid circular import
from .user import UserRead
TaskReadDetailed.model_rebuild()