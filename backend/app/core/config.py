# app/core/config.py
from pydantic import BaseSettings, validator
from typing import List
import json

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEBUG: bool = True
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """
        Accepts:
         - a JSON array string: '["https://a.com","https://b.com"]'
         - a comma separated string: 'https://a.com,https://b.com'
         - a single url string: 'https://a.com'
         - an actual list already: ['https://a.com']
         - empty/None -> fallback to ["*"] (useful for DEBUG)
        """
        if isinstance(v, (list, tuple)):
            return list(v)
        if v is None or (isinstance(v, str) and v.strip() == ""):
            # keep default behavior: allow all in DEBUG, otherwise empty list
            # We'll return ["*"] here; main.py uses settings.DEBUG to decide final behavior
            return ["*"]
        if isinstance(v, str):
            v = v.strip()
            # try JSON first
            try:
                parsed = json.loads(v)
                if isinstance(parsed, (list, tuple)):
                    return [str(x) for x in parsed]
            except Exception:
                # not JSON — fall back to comma-separated list
                return [part.strip() for part in v.split(",") if part.strip()]
        raise ValueError("Invalid BACKEND_CORS_ORIGINS format")

settings = Settings()
