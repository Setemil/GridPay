from pydantic import BaseModel, EmailStr
from app.models.user_model import UserRole

class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    phone_number: str
    role: UserRole = UserRole.user
    confirm_password: str
    full_name: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str