# backend/app/models/investment.py
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class InvestmentPackage(Base):
    __tablename__ = "investment_packages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    min_amount = Column(Numeric(18,6), nullable=False)
    max_amount = Column(Numeric(18,6), nullable=True)
    daily_return = Column(Numeric(10,6), nullable=False)  # e.g., 0.01 for 1% daily
    duration_days = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_investments = relationship("UserInvestment", back_populates="package")

class UserInvestment(Base):
    __tablename__ = "user_investments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("investment_packages.id"), nullable=False)
    amount_invested = Column(Numeric(18,6), nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default="active")  # active, matured, cancelled
    total_earnings = Column(Numeric(18,6), default=0)

    user = relationship("User", back_populates="investments")
    package = relationship("InvestmentPackage", back_populates="user_investments")
