from fastapi import APIRouter, Depends
from app.controllers import auth_controller
from app.middleware.auth import get_current_user
from app.schemas.user_schema import RegisterSchema, LoginSchema

router = APIRouter()

@router.post("/register")
async def register(data: RegisterSchema):
    return await auth_controller.register(data)

@router.post("/login")
async def login(data: LoginSchema):
    return await auth_controller.login(data)

@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user