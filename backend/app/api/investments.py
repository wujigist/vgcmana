# backend/app/api/investments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.schemas.investment import InvestmentPackageCreate, InvestmentPackageOut, UserInvestmentCreate, UserInvestmentOut
from app.services import investment_service, wallet_service, admin_service
from app import models

router = APIRouter()

@router.get("/packages", response_model=List[InvestmentPackageOut])
def list_packages(db: Session = Depends(get_db)):
    return investment_service.list_active_packages(db)

@router.post("/packages", response_model=InvestmentPackageOut)
def create_package(payload: InvestmentPackageCreate, admin_user=Depends(get_current_admin), db: Session = Depends(get_db)):
    pkg = investment_service.create_package(db, **payload.dict())
    return pkg

@router.post("/me/invest", response_model=UserInvestmentOut)
def create_user_investment(payload: UserInvestmentCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = wallet_service.get_wallet_by_user(db, current_user.id)
    if not wallet:
        raise HTTPException(404, "Wallet not found")
    # simple balance check; real app should put txn/pending approval flow
    if wallet.balance < payload.amount_invested:
        raise HTTPException(400, "Insufficient balance to invest")
    inv = investment_service.create_user_investment(db, current_user.id, payload.package_id, payload.amount_invested)
    # deduct immediately; for demo simply subtract
    wallet.balance = wallet.balance - payload.amount_invested
    db.add(wallet)
    db.commit()
    return inv

@router.get("/me/investments", response_model=List[UserInvestmentOut])
def list_my_investments(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    investments = db.query(models.investment.UserInvestment).filter(models.investment.UserInvestment.user_id == current_user.id).all()
    return investments
