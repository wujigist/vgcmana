# backend/app/core/config.py
import os
from pydantic import BaseSettings, AnyUrl, PostgresDsn, validator

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEBUG: bool = True
    BACKEND_CORS_ORIGINS: list = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
