# backend/scripts/create_admin.py
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.db.session import SessionLocal
from app.services.user_service import create_user

def run():
    db = SessionLocal()
    try:
        create_user(db, email="admin@yourcompany.com", password="StrongAdminPass123", role="admin")
        print("Admin created")
    except Exception as e:
        print("Error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    run()
