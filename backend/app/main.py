# app/main.py (simplified)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.api import auth, users, wallets, investments, admin as admin_router

def create_app() -> FastAPI:
    app = FastAPI(title="Fund Manager API")
    Base.metadata.create_all(bind=engine)

    allow_origins = ["*"] if settings.DEBUG else settings.cors_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/users", tags=["users"])
    app.include_router(wallets.router, prefix="/api/wallets", tags=["wallets"])
    app.include_router(investments.router, prefix="/api/investments", tags=["investments"])
    app.include_router(admin_router.router, prefix="/api/admin", tags=["admin"])

    return app

app = create_app()
