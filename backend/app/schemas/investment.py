# backend/app/schemas/investment.py
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from datetime import datetime

class InvestmentPackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    min_amount: Decimal
    max_amount: Optional[Decimal] = None
    daily_return: Decimal
    duration_days: int
    is_active: bool = True

class InvestmentPackageOut(InvestmentPackageCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class UserInvestmentCreate(BaseModel):
    package_id: int
    amount_invested: Decimal

class UserInvestmentOut(BaseModel):
    id: int
    user_id: int
    package_id: int
    amount_invested: Decimal
    start_date: datetime
    end_date: Optional[datetime]
    status: str
    total_earnings: Decimal
    
    # 🌟 NEW: Include the related package details
    package: InvestmentPackageOut # <- Add this line


    class Config:
        orm_mode = True

class UserInvestmentUpdate(BaseModel):
    amount_invested: Optional[Decimal] = None
    status: Optional[str] = None  # active, matured, cancelled
    end_date: Optional[datetime] = None
