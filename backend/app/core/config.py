# backend/app/core/config.py
from pydantic import BaseSettings, validator
from typing import List, Optional
import os
import json

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEBUG: bool = True

    # Accept raw env string first, then parse to list
    BACKEND_CORS_ORIGINS: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins(self) -> List[str]:
        """
        Use this property throughout the app instead of settings.BACKEND_CORS_ORIGINS directly.
        Returns a list of origins. If DEBUG is True and no origins configured, returns ["*"].
        """
        raw = self.BACKEND_CORS_ORIGINS
        if not raw or str(raw).strip() == "":
            return ["*"] if self.DEBUG else []
        # If user provided a JSON array string, parse it
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, (list, tuple)):
                return [str(x).strip() for x in parsed if str(x).strip()]
        except Exception:
            # not JSON - treat as comma separated
            return [part.strip() for part in raw.split(",") if part.strip()]

        # fallback, ensure list type
        return [str(parsed)]

settings = Settings()
