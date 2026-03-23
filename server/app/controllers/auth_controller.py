from fastapi import HTTPException
from app.services import auth_service

async def register(data):
    try:
        user = await auth_service.register(data)
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def login(data):
    try: 
        user = await auth_service.login(data)
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))