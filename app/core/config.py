from pydantic_settings import BaseSettings
from pydantic import SecretStr, AnyUrl, ConfigDict
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    app_name: str = "Project Management API"
    debug: bool = False
    log_level: str = "info"
    allowed_hosts: list[str] = []

    # Database
    database_url: AnyUrl = "sqlite:///./test.db"

    # Security
    secret_key: SecretStr = SecretStr("your-super-secret-key-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Password policy
    password_min_length: int = 8

    # Allow extra environment variables (e.g. VITE_ vars from the frontend)
    model_config = ConfigDict(env_file=".env", extra="ignore")

    @property
    def is_production(self) -> bool:
        try:
            return not str(self.database_url).startswith("sqlite")
        except Exception:
            return True


@lru_cache()
def get_settings() -> Settings:
    return Settings()

def validate_settings() -> List[str]:
    """Validates environment settings and returns list of CORS origins"""
    settings = get_settings()
    
    if settings.is_production:
        secret_value = settings.secret_key.get_secret_value()
        if "your-super-secret-key" in secret_value or "change-in-production" in secret_value:
            raise ValueError(
                "Production detected but using SQLite. Set DATABASE_URL to a production database."
            )
        origins = ["https://pulsepm.vercel.app"]
    else:
        origins = ["*"]
    
    return origins

