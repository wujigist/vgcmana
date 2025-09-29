from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.db.session import get_db
# 🌟 FIX: Import the new UserProfileOut from schemas
from app.schemas.user import UserOut, UserProfileOut 
from app import models
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["users"])

# --- Schemas for profile update ---
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[str] = None
    nationality: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

# ❌ REMOVED the redundant UserProfileOut definition here, as it's now in schemas/user.py

# --- Get current user ---
@router.get("/me", response_model=UserOut)
def read_current_user(current_user=Depends(get_current_user)):
    # When current_user (a SQLAlchemy User model instance) is passed to UserOut,
    # Pydantic's orm_mode automatically loads:
    # 1. User fields (id, email, role, etc.)
    # 2. The nested 'profile' field via the relationship, which will be formatted
    #    by the new UserProfileOut schema.
    return current_user

# --- Get current user's profile (still useful for direct profile access) ---
@router.get("/me/profile", response_model=UserProfileOut)
def get_my_profile(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    # This endpoint still returns JUST the profile data
    profile = db.query(models.wallet.UserProfile).filter(
        models.wallet.UserProfile.user_id == current_user.id
    ).first()
    if not profile:
        # Auto-create empty profile if missing
        profile = models.wallet.UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

# --- Update current user's profile ---
@router.put("/me/profile", response_model=UserProfileOut)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(models.wallet.UserProfile).filter(
        models.wallet.UserProfile.user_id == current_user.id
    ).first()
    if not profile:
        profile = models.wallet.UserProfile(user_id=current_user.id)
        db.add(profile)
    # Update only provided fields
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile

# --- Get user by ID ---
@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    # This will now return the User and its nested Profile
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user