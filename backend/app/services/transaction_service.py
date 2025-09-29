from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime

def create_transaction(db: Session, tx: schemas.transaction.TransactionCreate) -> models.wallet.Transaction:
    new_tx = models.wallet.Transaction(
        wallet_id=tx.wallet_id,
        type=tx.type,
        amount=tx.amount,
        status=tx.status,
        reference=tx.reference,
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
