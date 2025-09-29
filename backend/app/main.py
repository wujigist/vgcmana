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
# ROBUST PATH RESOLUTION (Corrected for Render Deployment)
#
# Assumes the project structure: [PROJECT_ROOT]/backend/app/main.py
# and the build output is at: [PROJECT_ROOT]/frontend/dist/
#
# 1. Start from the current file's directory: /.../backend/app
SERVER_APP_DIR = Path(__file__).resolve().parent

# 2. Go up two levels to the project root: /.../mana
PROJECT_ROOT = SERVER_APP_DIR.parent.parent 

# 3. Define the DIST path relative to the PROJECT_ROOT
DIST_DIR = PROJECT_ROOT / "frontend" / "dist"
INDEX_HTML = DIST_DIR / "index.html"
# -----------------------------------------------------


# --- DEBUG PATHS ---
# This will print the paths Uvicorn sees when it starts. Check your terminal output!
print(f"\n--- PATH DEBUG ---")
print(f"PROJECT_ROOT: {PROJECT_ROOT}")
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
    # This mounts the entire 'dist' directory at the root and enables SPA fallback.
    if DIST_DIR.is_dir():
        # The html=True argument makes StaticFiles check for a file, and if not found, 
        # serve index.html, which is the standard fix for React/SPA deep linking.
        app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="static")
        print(f"INFO: Mounted static files from {DIST_DIR}")
    else:
        # This will be printed if the path resolution fails or the frontend wasn't built.
        print(f"WARNING: Frontend distribution directory not found at {DIST_DIR}")


    # ------------------ API/DOCS FALLBACK (Guard) ------------------
    # This endpoint is only needed to explicitly return 404 for API/docs paths 
    # that did not match an existing route or file.
    @app.get("/{full_path:path}")
    async def api_guard_fallback(full_path: str):
        # The StaticFiles mount at '/' above should have handled all frontend routes.
        # This only catches non-API/non-docs routes if the StaticFiles mount failed 
        # (which shouldn't happen) or if we are explicitly accessing an API/docs route.
        if full_path.startswith("api") or full_path in ["docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404, detail=f"Not Found: {full_path}")
        
        # This is a final failsafe; the StaticFiles mount should prevent this block from being hit 
        # by serving index.html for all other paths.
        if INDEX_HTML.exists():
            return FileResponse(INDEX_HTML)

        raise HTTPException(status_code=404, detail=f"Not Found: Frontend build files missing.")

    # =============================================================
    #                  END CORRECTED LOGIC
    # =============================================================

    return app

app = create_app()