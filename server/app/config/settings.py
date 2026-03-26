from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    JWT_SECRET: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_MINUTES: int = 60
    INTERSWITCH_MERCHANT_CODE: str = ""
    INTERSWITCH_PAY_ITEM_ID: str = ""
    INTERSWITCH_WEBPAY_URL: str = "https://newwebpay.qa.interswitchng.com/collections/w/pay"
    INTERSWITCH_VERIFY_URL: str = "https://qa.interswitchng.com/collections/api/v1/gettransaction.json"
    ENERGY_ENGINE_URL: str = ""
    CLIENT_URL: str = ""
    MONGO_URI: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
