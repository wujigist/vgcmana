# backend/app/schemas/wallet.py
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional, List
from datetime import datetime

class WalletOut(BaseModel):
    id: int
    user_id: int
    balance: Decimal
    currency: str
    status: str
    allow_deposits: bool
    allow_withdrawals: bool
    allow_purchases: bool
    created_at: datetime

    class Config:
        orm_mode = True

class TransactionCreate(BaseModel):
    type: str
    amount: Decimal
    reference: Optional[str] = None
    note: Optional[str] = None

class TransactionOut(BaseModel):
    id: int
    wallet_id: int
    type: str
    amount: Decimal
    status: str
    reference: Optional[str]
    note: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
