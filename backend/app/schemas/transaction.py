from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
from typing import Optional, Literal

class TransactionBase(BaseModel):
    type: Literal["deposit", "withdrawal", "purchase", "earning"]
    amount: Decimal
    status: Literal["pending", "approved", "rejected"]
    reference: Optional[str] = None
    note: Optional[str] = None

class TransactionCreate(TransactionBase):
    wallet_id: int

class Transaction(TransactionBase):
    id: int
    wallet_id: int
    created_at: datetime

    class Config:
        orm_mode = True
