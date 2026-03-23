import uuid
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum

class UserRole(str, Enum):
    admin = "Admin"
    user = "User"

class User(BaseModel):
    id: str = Field(default_factory=uuid.UUID, alias="_id")
    full_name: str = Field(...)
    role: UserRole = Field(...)
    email: str = Field(...)
    hashed_password: str = Field(...)
    phone_number: str = Field(...)

    class Config:
        allow_population_by_field_name = True
        #Example for swagger docs
        schema_extra = {
            "example": {
                "_id": "066de609-b04a-4b30-b460",
                "full_name": "John Doe",
                "role": "buyer",
                "email": "john.doe@example.com",
                "hashed_password": "hashed",
                "phone_number": "+12323456789",
            }
        }

class UpdateUser(BaseModel):
    full_name: Optional[str]
    email: Optional[str]
    role: Optional[UserRole]
    hashed_password: Optional[str]
    phone_number: Optional[str]

    class Config:
        schema_extra = {
            "example": {
                "full_name": "John Doe",
                "email": "john.doe@example.com",
                "role": "admin",
                "hashed_password": "hashed",
                "phone_number": "+12323456789"
            }
        }
