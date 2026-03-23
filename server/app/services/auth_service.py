from app.config.db import client, get_next_id
from app.config.settings import settings
from datetime import datetime, timedelta, timezone
import bcrypt
import httpx
from jose import jwt

db = client["GridPayDB"]
users_collection = db["users"]

async def register(data):
    existing = users_collection.find_one({"email": data.email})
    if existing:
        raise Exception("User already exists")

    if data.password != data.confirm_password:
        raise Exception("Passwords do not match")

    hashed_password = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user_id = get_next_id("users")

    with httpx.Client() as http:
        response = http.post(f"{settings.ENERGY_ENGINE_URL}/api/User/CreateUser", json={
            "id": user_id,
            "fullName": data.full_name,
            "email": data.email,
            "role": data.role,
        })
        response.raise_for_status()

    user = {
        "id": user_id,
        "email": data.email,
        "hashed_password": hashed_password,
        "phone_number": data.phone_number,
        "role": data.role,
        "full_name": data.full_name,
    }

    users_collection.insert_one(user)

    return {
        "id": user_id,
        "email": data.email
    }

async def login(data):
    user = users_collection.find_one({"email": data.email})
    if not user:
        raise Exception("User does not exist")

    if not bcrypt.checkpw(data.password.encode("utf-8"), user["hashed_password"].encode("utf-8")):
        raise Exception("Invalid password")

    payload = {
        "id": str(user["_id"]),
        "email": user["email"],
        "fullName": user["full_name"],
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRES_MINUTES)
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": payload["id"],
            "email": payload["email"],
            "full_name": payload["fullName"],
            "phone_number": user.get("phone_number")
        }
    }