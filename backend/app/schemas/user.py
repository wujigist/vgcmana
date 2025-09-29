from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# NEW: Schema for the profile data sent during registration
class UserProfileCreate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    # dob: Optional[str] = None
    # nationality: Optional[str] = None

# 🌟 NEW: Schema for the profile data output 🌟
# This maps directly to the SQLAlchemy UserProfile model
class UserProfileOut(BaseModel):
    full_name: Optional[str] = None
    dob: Optional[str] = None
    nationality: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

    class Config:
        # This is essential for Pydantic to read from the SQLAlchemy model
        orm_mode = True 


class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    profile: Optional[UserProfileCreate] = None 

class UserOut(UserBase):
    id: int
    role: str
    verification_level: int
    created_at: datetime

    # ❌ REMOVED: Individual profile fields (full_name, dob, etc.)
    # ✅ FIX: Replace individual fields with the nested UserProfileOut schema
    profile: Optional[UserProfileOut] = None 

    # ✅ NEW: Wallet Status and Permissions for Admin Page (No change here)
    wallet_status: Optional[str] = None
    allow_deposits: Optional[bool] = None
    allow_withdrawals: Optional[bool] = None

    class Config:
        orm_mode = True # This tells Pydantic to read the `profile` relationship

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    id: Optional[int] = None