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

    # =============================================================
    #           CORRECTED STATIC ASSETS & FALLBACK LOGIC
    # =============================================================

    # ------------------ STATIC ASSETS & ROOT FILES ------------------
    # This mounts the entire 'dist' directory.
    # It will serve:
    # 1. index.html at '/' (via its own internal logic, since it's at the root of the StaticFiles dir)
    # 2. Files inside /assets (e.g., /assets/index-CGOTCCnk.js)
    # 3. Other root files (favicon.ico, vite.svg, etc.)
    if DIST_DIR.is_dir():
        app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="static")
        print(f"INFO: Mounted static files from {DIST_DIR}")
    else:
        print(f"WARNING: Frontend distribution directory not found at {DIST_DIR}")


    # ------------------ SPA FALLBACK (Catch-all) ------------------
    # The static files mount above handles the SPA index.html serving and all assets.
    # This explicit fallback is a *backup* to catch routes that were not handled
    # by the static mount (which already returns index.html for non-existent files)
    # and ensures API/docs routes return 404s.

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        # Explicitly return 404 for API/docs routes if they didn't match an actual route
        if full_path.startswith("api") or full_path in ["docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail=f"Not Found: {full_path}")
        
        # If the static mount at '/' above didn't return index.html (which it should have),
        # then serve it explicitly here as a final fallback.
        if INDEX_HTML.exists():
            return FileResponse(INDEX_HTML)
        
        raise HTTPException(status_code=404, detail=f"Not Found: Frontend build files missing.")

    # =============================================================
    #                  END CORRECTED LOGIC
    # =============================================================

    return app

app = create_app()