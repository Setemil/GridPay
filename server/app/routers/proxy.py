from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def proxy_root():
    return {"message": "Proxy router"}
