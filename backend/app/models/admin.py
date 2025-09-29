# backend/app/models/admin.py
from sqlalchemy import Column, Integer, Boolean, DateTime
from app.db.base import Base
from datetime import datetime

class AdminControl(Base):
    __tablename__ = "admin_controls"
    id = Column(Integer, primary_key=True, index=True)
    allow_deposits = Column(Boolean, default=True)
    allow_withdrawals = Column(Boolean, default=True)
    allow_purchases = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
