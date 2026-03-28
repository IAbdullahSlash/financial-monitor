from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "dev"
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    postgres_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/finmentor"
    redis_url: str = "redis://localhost:6379/0"

    encryption_key: str = "change-me-use-fernet-key"
    alpha_vantage_api_key: str = ""

    nav_file_path: str = "data_source/NAVAII.txt"
    mfapi_base_url: str = "https://api.mfapi.in/mf"

    ollama_enabled: bool = False
    ollama_model: str = "mistral"
    ollama_base_url: str = "http://localhost:11434/api/generate"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
