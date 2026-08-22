"""SLAngel — Auth API Routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, Officer
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.auth.auth import (
    hash_password, verify_password, create_access_token, require_auth
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user/officer account."""
    # Check for existing username
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )

    # Check for existing email
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role,
    )
    db.add(user)
    db.flush()

    # Create associated officer record
    officer = Officer(
        user_id=user.id,
        name=user.full_name,
        employee_id=f"EMP-{user.id:04d}",
        department="General",
        role=user.role,
    )
    db.add(officer)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token(data={"sub": user.username, "role": user.role})

    return Token(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with username and password."""
    user = db.query(User).filter(User.username == credentials.username).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    token = create_access_token(data={"sub": user.username, "role": user.role})

    return Token(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(require_auth)):
    """Get the current authenticated user's information."""
    return UserResponse.model_validate(current_user)
