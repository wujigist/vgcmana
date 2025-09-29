from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm

from app.core.dependencies import get_db
from app.services import user_service, wallet_service
from app.schemas.user import UserCreate, Token # UserCreate now includes 'profile'
from app.core.security import create_access_token, verify_password
from app.core.config import settings

router = APIRouter(tags=["auth"]) # Added tags for better OpenAPI documentation


@router.post("/register", response_model=dict)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with email, password, and profile data.
    Creates both the User and the associated UserProfile records.
    """
    try:
        # ✅ FIX: Pass the optional profile data to the service layer
        user = user_service.create_user(
            db, 
            payload.email, 
            payload.password, 
            profile_data=payload.profile # Pass the profile object
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Create empty wallet (profile is now created in user_service.create_user)
    wallet_service.create_wallet_for_user(db, user.id)
    
    return {"msg": "user_created", "user_id": user.id}


@router.post("/token", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login user using OAuth2 password form.
    Expects form fields: username (email) & password.
    Returns access_token including user role.
    """
    # OAuth2PasswordRequestForm uses `username` for email
    user = user_service.get_user_by_email(db, form_data.username)
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=str(user.id),
        expires_delta=access_token_expires,
        role=user.role  # include role in token
    )
    
    return {"access_token": token, "token_type": "bearer"}
