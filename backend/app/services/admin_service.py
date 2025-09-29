# backend/app/services/admin_service.py
from sqlalchemy.orm import Session
from app import models

def get_admin_controls(db: Session):
    ctrl = db.query(models.admin.AdminControl).first()
    if not ctrl:
        ctrl = models.admin.AdminControl()
        db.add(ctrl)
        db.commit()
        db.refresh(ctrl)
    return ctrl

def update_admin_controls(db: Session, **kwargs):
    ctrl = get_admin_controls(db)
    for k, v in kwargs.items():
        if hasattr(ctrl, k):
            setattr(ctrl, k, v)
    db.add(ctrl)
    db.commit()
    db.refresh(ctrl)
    return ctrl

# Function to update wallet status (active, frozen, disabled, etc.)
def update_user_wallet_status(db: Session, user_id: int, new_status: str):
    """Updates the status of a user's wallet."""
    wallet = db.query(models.wallet.Wallet).filter(
        models.wallet.Wallet.user_id == user_id
    ).first()
    
    if not wallet:
        raise ValueError("Wallet not found for this user.")

    # Simple validation for a set of statuses (adjust as needed)
    valid_statuses = ["active", "frozen", "disabled", "not_activated"]
    if new_status.lower() not in valid_statuses:
        raise ValueError(f"Invalid wallet status: {new_status}")
    
    wallet.status = new_status.lower()
    db.commit()
    db.refresh(wallet)
    return wallet

# Function to toggle individual wallet permissions
def toggle_wallet_permission(db: Session, user_id: int, permission: str, value: bool):
    """Toggles a specific wallet permission (deposit, withdrawal, purchase)."""
    wallet = db.query(models.wallet.Wallet).filter(
        models.wallet.Wallet.user_id == user_id
    ).first()

    if not wallet:
        raise ValueError("Wallet not found for this user.")
        
    if permission == "deposits":
        wallet.allow_deposits = value
    elif permission == "withdrawals":
        wallet.allow_withdrawals = value
    elif permission == "purchases":
        wallet.allow_purchases = value
    else:
        raise ValueError(f"Invalid wallet permission: {permission}")

    db.commit()
    db.refresh(wallet)
    return wallet
