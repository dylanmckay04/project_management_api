from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Project Management API"
    
    database_url: str = "sqlite:///./test.db"
    
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    password_min_length: int = 8
    
    model_config = ConfigDict(env_file=".env")


@lru_cache()
def get_settings():
    return Settings()