# backend/app/services/wallet_service.py
from sqlalchemy.orm import Session
from decimal import Decimal
from app import models
from datetime import datetime
from app.schemas import transaction as transaction_schema  # if using schema-based transaction creation

# -------------------- WALLET --------------------
def create_wallet_for_user(db: Session, user_id: int, currency: str = "USD"):
    wallet = models.wallet.Wallet(
        user_id=user_id,
        balance=Decimal(0),
        currency=currency,
        status="not_activated"
    )
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet

def get_wallet_by_user(db: Session, user_id: int):
    return db.query(models.wallet.Wallet).filter(
        models.wallet.Wallet.user_id == user_id
    ).first()

# -------------------- TRANSACTIONS --------------------
def create_transaction(db: Session, wallet_id: int, type: str, amount, reference=None, note=None, status="pending"):
    txn = models.wallet.Transaction(
        wallet_id=wallet_id,
        type=type,
        amount=amount,
        status=status,
        reference=reference,
        note=note,
        created_at=datetime.utcnow()
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn

# If using schema-based creation
def create_transaction_from_schema(db: Session, tx: transaction_schema.TransactionCreate):
    new_tx = models.wallet.Transaction(
        wallet_id=tx.wallet_id,
        type=tx.type,
        amount=tx.amount,
        status=tx.status,
        reference=tx.reference,
        note=tx.note,
        created_at=datetime.utcnow(),
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx

def list_transactions(db: Session, wallet_id: int):
    return db.query(models.wallet.Transaction).filter(
        models.wallet.Transaction.wallet_id == wallet_id
    ).order_by(models.wallet.Transaction.created_at.desc()).all()

def approve_transaction(db: Session, txn_id: int):
    txn = db.query(models.wallet.Transaction).filter(
        models.wallet.Transaction.id == txn_id
    ).first()
    if not txn:
        raise ValueError("Transaction not found")
    wallet = txn.wallet
    txn.status = "approved"
    if txn.type in ["deposit", "earning"]:
        wallet.balance += txn.amount
    elif txn.type == "withdrawal":
        wallet.balance -= txn.amount
    db.add(txn)
    db.add(wallet)
    db.commit()
    db.refresh(txn)
    return txn

def reject_transaction(db: Session, txn_id: int):
    txn = db.query(models.wallet.Transaction).filter(
        models.wallet.Transaction.id == txn_id
    ).first()
    if not txn:
        raise ValueError("Transaction not found")
    txn.status = "rejected"
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn
