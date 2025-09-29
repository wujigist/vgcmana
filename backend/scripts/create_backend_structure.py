import os
from pathlib import Path

base = Path(r"C:\Users\User\Desktop\mana\backend")

# ---------- Folder structure ----------
folders = [
    "app",
    "app/api",
    "app/core",
    "app/db/migrations",
    "app/models",
    "app/schemas",
    "app/services",
    "app/uploads",
]

# ---------- Files to create (with optional starter text) ----------
files = {
    ".env": "",
    "alembic.ini": "",
    "requirements.txt": "",
    "app/__init__.py": "",
    "app/main.py": "# FastAPI entrypoint\n\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/')\nasync def root():\n    return {'message': 'Fund Manager API running'}\n",
    # api
    "app/api/__init__.py": "",
    "app/api/auth.py": "",
    "app/api/users.py": "",
    "app/api/wallets.py": "",
    "app/api/investments.py": "",
    "app/api/admin.py": "",
    # core
    "app/core/__init__.py": "",
    "app/core/config.py": "",
    "app/core/security.py": "",
    "app/core/dependencies.py": "",
    # db
    "app/db/__init__.py": "",
    "app/db/base.py": "",
    "app/db/session.py": "",
    # models
    "app/models/__init__.py": "",
    "app/models/user.py": "",
    "app/models/wallet.py": "",
    "app/models/investment.py": "",
    "app/models/admin.py": "",
    # schemas
    "app/schemas/__init__.py": "",
    "app/schemas/user.py": "",
    "app/schemas/wallet.py": "",
    "app/schemas/investment.py": "",
    "app/schemas/transaction.py": "",
    # services
    "app/services/__init__.py": "",
    "app/services/user_service.py": "",
    "app/services/wallet_service.py": "",
    "app/services/investment_service.py": "",
    "app/services/transaction_service.py": "",
}

# ---------- Create folders ----------
for folder in folders:
    (base / folder).mkdir(parents=True, exist_ok=True)

# ---------- Create files ----------
for file_path, content in files.items():
    f = base / file_path
    if not f.exists():
        f.write_text(content, encoding="utf-8")

print("✅ Backend skeleton created successfully!")
