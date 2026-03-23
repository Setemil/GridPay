from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    JWT_SECRET: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_MINUTES: int = 60
    INTERSWITCH_CLIENT_ID: str = ""
    INTERSWITCH_SECRET_KEY: str = ""
    INTERSWITCH_BASE_URL: str = ""
    ENERGY_ENGINE_URL: str = ""
    CLIENT_URL: str = ""
    MONGO_URI: str = ""

    class Config:
        env_file = ".env"

settings = Settings()