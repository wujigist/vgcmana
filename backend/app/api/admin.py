from fastapi import APIRouter, Depends, HTTPException, Body, status 
from sqlalchemy.orm import Session, joinedload
from app.core.dependencies import get_current_admin
from app.db.session import get_db
from app.services import wallet_service, admin_service
from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from app.schemas.user import UserOut
from app.schemas.wallet import WalletOut
from app import models
from app.schemas.transaction import Transaction
from app.schemas.investment import InvestmentPackageCreate, InvestmentPackageOut, UserInvestmentOut, UserInvestmentUpdate
from app.models import investment as investment_models

router = APIRouter(tags=["admin"])
TransactionOut = Transaction


class WalletStatusUpdate(BaseModel):
    status: str

# ---------------- Admin Users (Modified to include wallet data) ----------------
@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), admin_user=Depends(get_current_admin)):
    # Load users, and join the profile AND wallet data
    users = db.query(models.user.User).options(
        joinedload(models.user.User.profile),
        joinedload(models.user.User.wallet) 
    ).all()
    
    user_list = []
    for user in users:
        # Convert to a dict/Pydantic object first
        user_data = UserOut.from_orm(user).dict()
        
        # Manually extract profile info (from existing list_users logic)
        profile = user.profile
        user_data.update({
            'full_name': profile.full_name if profile else None,
            'phone_number': profile.phone_number if profile else None,
            # ... include other profile fields if needed in UserOut ...
        })
        
        # Add wallet details (NEW)
        if user.wallet:
            user_data['wallet_status'] = user.wallet.status
            user_data['allow_deposits'] = user.wallet.allow_deposits
            user_data['allow_withdrawals'] = user.wallet.allow_withdrawals
            # ✅ FIX: Ensure allow_purchases is included when wallet exists
            user_data['allow_purchases'] = user.wallet.allow_purchases 
        else:
            user_data['wallet_status'] = 'wallet_missing'
            user_data['allow_deposits'] = False
            user_data['allow_withdrawals'] = False
            # ✅ FIX: Ensure allow_purchases is defined even if wallet is missing
            user_data['allow_purchases'] = False 

        user_list.append(user_data)
        
    return user_list

# -------------------- NEW: ADMIN WALLET STATUS --------------------

@router.put("/users/{user_id}/wallet/status", response_model=WalletOut)
def update_user_account_status(
    user_id: int, 
    payload: WalletStatusUpdate, 
    admin_user=Depends(get_current_admin), 
    db: Session = Depends(get_db)
):
    try:
        updated_wallet = admin_service.update_user_wallet_status(db, user_id, payload.status)
        return updated_wallet
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update wallet status.")

# -------------------- NEW: ADMIN WALLET PERMISSION TOGGLE --------------------

@router.put("/users/{user_id}/wallet/{permission}/toggle")
def toggle_user_wallet_permission(
    user_id: int, 
    permission: str, # 'deposits', 'withdrawals', 'purchases'
    action: str, # 'enable' or 'disable'
    admin_user=Depends(get_current_admin), 
    db: Session = Depends(get_db)
):
    if action.lower() not in ["enable", "disable"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be 'enable' or 'disable'")
    
    value = action.lower() == "enable"

    try:
        updated_wallet = admin_service.toggle_wallet_permission(db, user_id, permission, value)
        return {"message": f"{permission} successfully {action}d for user {user_id}", "wallet_status": updated_wallet}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ---------------- Admin Wallets ----------------
class WalletAdminOut(WalletOut):
    username: Optional[str] = None
    full_name: Optional[str] = None

    class Config:
        orm_mode = True

@router.get("/wallets", response_model=List[WalletAdminOut])
def list_wallets(db: Session = Depends(get_db), admin_user=Depends(get_current_admin)):
    wallets = (
        db.query(models.wallet.Wallet)
        .options(joinedload(models.wallet.Wallet.user).joinedload(models.user.User.profile))
        .all()
    )

    result = []
    for w in wallets:
        username = w.user.profile.username if w.user and w.user.profile and hasattr(w.user.profile, "username") else None
        full_name = w.user.profile.full_name if w.user and w.user.profile else None
        if w.user and not username:
            username = w.user.email

        result.append(
            WalletAdminOut(
                id=w.id,
                user_id=w.user_id,
                username=username,
                full_name=full_name,
                balance=w.balance,
                currency=w.currency,
                status=w.status,
                allow_deposits=w.allow_deposits,
                allow_withdrawals=w.allow_withdrawals,
                allow_purchases=w.allow_purchases,
                created_at=w.created_at,
            )
        )
    return result

# ---------------- Admin Per-User Wallet Controls ----------------
class WalletControlUpdate(BaseModel):
    allow_deposits: Optional[bool] = None
    allow_withdrawals: Optional[bool] = None
    allow_purchases: Optional[bool] = None

@router.put("/wallets/{wallet_id}/controls", response_model=WalletOut)
def update_wallet_controls(
    wallet_id: int,
    payload: WalletControlUpdate,
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    wallet = db.query(models.wallet.Wallet).filter(models.wallet.Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(404, "Wallet not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(wallet, field, value)

    db.commit()
    db.refresh(wallet)
    return wallet


# ---------------- Transactions ----------------
class TransactionAdminCreate(BaseModel):
    user_id: int
    type: str  # deposit, withdrawal, earning
    amount: Decimal
    reference: Optional[str] = None
    note: Optional[str] = None

@router.get("/transactions", response_model=List[TransactionOut])
def list_all_transactions(db: Session = Depends(get_db), admin_user=Depends(get_current_admin)):
    transactions = db.query(models.wallet.Transaction)\
        .order_by(models.wallet.Transaction.created_at.desc()).all()
    return transactions

@router.post("/transactions", response_model=TransactionOut)
def create_admin_transaction(
    payload: TransactionAdminCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_admin)
):
    wallet = db.query(wallet_service.models.wallet.Wallet).filter(
        wallet_service.models.wallet.Wallet.user_id == payload.user_id
    ).first()
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    # Ensure amount is Decimal
    amount = Decimal(payload.amount)

    txn = wallet_service.create_transaction(
        db=db,
        wallet_id=wallet.id,
        type=payload.type,
        amount=amount,
        reference=payload.reference,
        note=payload.note,
    )

    # Auto-approve deposits/earnings for admin actions
    if payload.type in ["deposit", "earning", "withdrawal"]:
        wallet_service.approve_transaction(db, txn.id)

    return txn



# ✅ Approve a transaction
@router.post("/transactions/{txn_id}/approve", response_model=TransactionOut)
def approve_transaction(txn_id: int, db: Session = Depends(get_db), admin_user=Depends(get_current_admin)):
    try:
        txn = wallet_service.approve_transaction(db, txn_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    return txn

# ✅ Reject a transaction
@router.post("/transactions/{txn_id}/reject", response_model=TransactionOut)
def reject_transaction(txn_id: int, db: Session = Depends(get_db), admin_user=Depends(get_current_admin)):
    try:
        txn = wallet_service.reject_transaction(db, txn_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    return txn

# ✅ Pend a transaction
@router.post("/transactions/{txn_id}/pend", response_model=TransactionOut)
def pend_transaction(txn_id: int, db: Session = Depends(get_db), admin_user=Depends(get_current_admin)):
    txn = db.query(wallet_service.models.wallet.Transaction).filter(
        wallet_service.models.wallet.Transaction.id == txn_id
    ).first()
    if not txn:
        raise HTTPException(404, "Transaction not found")
    txn.status = "pending"
    db.commit()
    db.refresh(txn)
    return txn


@router.get("/investments", response_model=List[UserInvestmentOut])
def list_all_user_investments(db: Session = Depends(get_db), admin_user=Depends(get_current_admin)):
    investments = db.query(models.investment.UserInvestment).all()
    return investments


# ------------------ Admin: List all investment packages ------------------
@router.get("/investment-packages", response_model=List[InvestmentPackageOut])
def list_investment_packages(
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_admin)
):
    packages = db.query(investment_models.InvestmentPackage).all()
    return packages


# ------------------ Admin: Create a new investment package ------------------
@router.post("/investment-packages", response_model=InvestmentPackageOut)
def create_investment_package(
    payload: InvestmentPackageCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_admin)
):
    package = investment_models.InvestmentPackage(
        name=payload.name,
        description=payload.description,
        min_amount=payload.min_amount,
        max_amount=payload.max_amount,
        daily_return=payload.daily_return,
        duration_days=payload.duration_days,
        is_active=payload.is_active
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    return package

@router.put("/investments/{investment_id}", response_model=UserInvestmentOut)
def update_user_investment(
    investment_id: int,
    payload: UserInvestmentUpdate,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_admin)
):
    investment = db.query(investment_models.UserInvestment).filter(
        investment_models.UserInvestment.id == investment_id
    ).first()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(investment, field, value)

    db.commit()
    db.refresh(investment)
    return investment


class InvestmentPackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    daily_return: Optional[Decimal] = None
    duration_days: Optional[int] = None
    is_active: Optional[bool] = None

@router.put("/investment-packages/{package_id}", response_model=InvestmentPackageOut)
def update_investment_package(
    package_id: int,
    payload: InvestmentPackageUpdate,
    db: Session = Depends(get_db),
    admin_user=Depends(get_current_admin)
):
    package = db.query(investment_models.InvestmentPackage).filter(
        investment_models.InvestmentPackage.id == package_id
    ).first()

    if not package:
        raise HTTPException(404, detail="Investment package not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(package, field, value)

    db.commit()
    db.refresh(package)
    return package
