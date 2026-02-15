from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserRead, UserUpdate, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from datetime import timedelta

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    
    - **email**: User's email (must be unique)
    - **full_name**: User's full name
    - **password**: User's password (minimum 8 characters)
    """
    exisiting_user = db.query(User).filter(User.email == user.email).first()
    if exisiting_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    
    hashed_password = hash_password(user.password)
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=dict)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password
    
    Returns an access token to use in subsequent requests
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserRead.model_validate(user)
    }


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's information
    """
    return current_user


@router.get("/{user_id}", response_model=UserRead)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get a specific user by ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current user's information
    """
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    
    if user_update.password:
        current_user.password_hash = hash_password(user_update.password)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deactivate the current user (soft deletion)
    """
    current_user.is_active = False
    db.add(current_user)
    db.commit()
