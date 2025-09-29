from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

from app.api import auth, users, wallets, investments, admin as admin_router

# -----------------------------------------------------
# ROBUST PATH RESOLUTION (Mana Root is 3 levels up from main.py)
# __file__ is in mana/backend/app/main.py
# .parent.parent.parent resolves to the 'mana' root folder.
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DIST_DIR = ROOT_DIR / "frontend" / "dist"
INDEX_HTML = DIST_DIR / "index.html"
# -----------------------------------------------------


# --- DEBUG PATHS ---
# This will print the paths Uvicorn sees when it starts. Check your terminal output!
print(f"\n--- PATH DEBUG ---")
print(f"ROOT_DIR: {ROOT_DIR}")
print(f"DIST_DIR: {DIST_DIR}")
print(f"INDEX_HTML exists: {INDEX_HTML.exists()}")
print(f"------------------\n")
# -------------------


def create_app() -> FastAPI:
    app = FastAPI(title="Fund Manager API")

    # Create DB tables
    Base.metadata.create_all(bind=engine)

    # ------------------ CORS ------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.DEBUG else [settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ------------------ API Routes ------------------
    # All API routes now under /api prefix
    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/users", tags=["users"])
    app.include_router(wallets.router, prefix="/api/wallets", tags=["wallets"])
    app.include_router(investments.router, prefix="/api/investments", tags=["investments"])
    app.include_router(admin_router.router, prefix="/api/admin", tags=["admin"])

    # ------------------ Static Assets ------------------
    # Mount assets directory for CSS, JS, etc.
    if (DIST_DIR / "assets").is_dir():
         app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")
    else:
         print(f"WARNING: Assets directory not found at {DIST_DIR / 'assets'}")


    # ------------------ SPA Fallback (Catch-all) ------------------
    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        # Don't interfere with API routes or internal FastAPI docs routes
        if full_path.startswith("api") or full_path in ["docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail="Not found")
        
        # Serve index.html for all other paths (SPA routing)
        if INDEX_HTML.exists():
            return FileResponse(INDEX_HTML)
        
        # Fallback if the file is missing (e.g., frontend not built)
        raise HTTPException(status_code=404, detail=f"Not Found: Frontend index.html missing at {INDEX_HTML}")

    return app

app = create_app()