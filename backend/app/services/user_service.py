from typing import Optional
from sqlalchemy.orm import Session
from app import models
from app.core.security import hash_password
from app.schemas.user import UserProfileCreate # Import the new schema

def create_user(db: Session, email: str, password: str, profile_data: Optional[UserProfileCreate] = None, role: str = "user"):
    """
    Creates a User and optionally their UserProfile in one operation.
    """
    existing = db.query(models.user.User).filter(models.user.User.email == email).first()
    if existing:
        raise ValueError("User with that email already exists")
        
    # 1. Create the core User object
    user = models.user.User(
        email=email,
        password_hash=hash_password(password),
        role=role
    )
    db.add(user)
    
    # Commit the user to get the ID for the profile (using flush is cleaner than committing)
    db.flush() 
    
    # 2. ✅ FIX: Create the UserProfile object using the provided data
    # Create the profile even if profile_data is None, as required by the DB structure
    new_profile_data = {}
    if profile_data:
        # Filter out None values to ensure we only update what was provided
        # 🌟 V1 FIX: Changed .model_dump() to .dict() 🌟
        new_profile_data = profile_data.dict(exclude_none=True) 

    # Create the profile linking it to the new user ID
    profile = models.wallet.UserProfile(
        user_id=user.id,
        **new_profile_data # Apply full_name and phone_number if they exist
    )
    db.add(profile)
    
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str):
    return db.query(models.user.User).filter(models.user.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.user.User).filter(models.user.User.id == user_id).first()
