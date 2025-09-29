# backend/app/services/investment_service.py
from sqlalchemy.orm import Session
from app import models
from datetime import datetime, timedelta
from decimal import Decimal

def create_package(db: Session, **kwargs):
    pkg = models.investment.InvestmentPackage(**kwargs)
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return pkg

def list_active_packages(db: Session):
    return db.query(models.investment.InvestmentPackage).filter(models.investment.InvestmentPackage.is_active == True).all()

def create_user_investment(db: Session, user_id: int, package_id: int, amount: Decimal):
    pkg = db.query(models.investment.InvestmentPackage).filter(models.investment.InvestmentPackage.id == package_id, models.investment.InvestmentPackage.is_active == True).first()
    if not pkg:
        raise ValueError("Package not found or inactive")
    # basic validation
    if amount < pkg.min_amount:
        raise ValueError("Amount less than minimum")
    if pkg.max_amount and amount > pkg.max_amount:
        raise ValueError("Amount greater than package maximum")

    start = datetime.utcnow()
    end = start + timedelta(days=pkg.duration_days)
    inv = models.investment.UserInvestment(
        user_id=user_id,
        package_id=package_id,
        amount_invested=amount,
        start_date=start,
        end_date=end,
        status="active",
        total_earnings=Decimal(0)
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

def mature_investment(db: Session, investment_id: int):
    inv = db.query(models.investment.UserInvestment).filter(models.investment.UserInvestment.id == investment_id).first()
    if not inv:
        raise ValueError("Investment not found")
    inv.status = "matured"
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv
