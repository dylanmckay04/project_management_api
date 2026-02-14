from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    
    model_config = ConfigDict(from_attributes=True)


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserReadWithProjects(UserRead):
    projects: List["ProjectRead"] = []

# Avoid circular import
from .project import ProjectRead
UserReadWithProjects.model_rebuild()