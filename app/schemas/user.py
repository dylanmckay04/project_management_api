from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    
    model_config = ConfigDict(from_attributes=True)


class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        """Validate password is at least 8 characters"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class LoginRequest(BaseModel):
    email: EmailStr
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