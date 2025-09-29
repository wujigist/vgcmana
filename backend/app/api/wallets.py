from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.dependencies import get_current_user, get_current_admin
from app.db.session import get_db
from app.services import wallet_service, admin_service
from app.schemas.wallet import WalletOut, TransactionCreate, TransactionOut
from app import models

router = APIRouter()

# -------------------- USER WALLET --------------------
@router.get("/me", response_model=WalletOut)
def get_my_wallet(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = (
        db.query(models.wallet.Wallet)
        .options(joinedload(models.wallet.Wallet.user).joinedload(models.user.User.profile))
        .filter(models.wallet.Wallet.user_id == current_user.id)
        .first()
    )
    if not wallet:
        raise HTTPException(404, "Wallet not found")

    return wallet

# ✅ List user's transactions
@router.get("/me/transactions", response_model=List[TransactionOut])
def get_my_transactions(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = wallet_service.get_wallet_by_user(db, current_user.id)
    if not wallet:
        raise HTTPException(404, "Wallet not found")
    return wallet_service.list_transactions(db, wallet.id)

# Create a transaction
@router.post("/me/transactions", response_model=TransactionOut)
def create_transaction_for_me(
    payload: TransactionCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = wallet_service.get_wallet_by_user(db, current_user.id)
    if not wallet:
        raise HTTPException(404, "Wallet not found")

    # ✅ Check per-wallet permissions
    if payload.type == "deposit" and not wallet.allow_deposits:
        raise HTTPException(403, "Deposits are disabled for your account")
    if payload.type == "withdrawal" and not wallet.allow_withdrawals:
        raise HTTPException(403, "Withdrawals are disabled for your account")
    if payload.type == "purchase" and not wallet.allow_purchases:
        raise HTTPException(403, "Purchases are disabled for your account")

    txn = wallet_service.create_transaction(
        db,
        wallet_id=wallet.id,
        type=payload.type,
        amount=payload.amount,
        reference=payload.reference,
        note=payload.note
    )
    return txn

# -------------------- ADMIN TRANSACTIONS --------------------
@router.post("/admin/transactions/{txn_id}/approve")
def admin_approve_transaction(txn_id: int, admin_user=Depends(get_current_admin), db: Session = Depends(get_db)):
    try:
        txn = wallet_service.approve_transaction(db, txn_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    return {"msg": "approved", "transaction_id": txn.id}

@router.post("/admin/transactions/{txn_id}/reject")
def admin_reject_transaction(txn_id: int, admin_user=Depends(get_current_admin), db: Session = Depends(get_db)):
    try:
        txn = wallet_service.reject_transaction(db, txn_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    return {"msg": "rejected", "transaction_id": txn.id}
