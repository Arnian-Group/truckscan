from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://truckscan:password@db:5432/truckscan"
    SECRET_KEY: str = "changeme"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    UPLOADS_DIR: str = "/app/uploads"

    class Config:
        env_file = ".env"


settings = Settings()
