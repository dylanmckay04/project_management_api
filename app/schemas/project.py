from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectRead(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectReadWithTasks(ProjectRead):
    tasks: List["TaskRead"] = []


class ProjectReadDetailed(ProjectRead):
    owner: "UserRead"
    tasks: List["TaskRead"] = []


# Avoid circular import
from .user import UserRead
from .task import TaskRead
ProjectReadWithTasks.model_rebuild()
ProjectReadDetailed.model_rebuild()