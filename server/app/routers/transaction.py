from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def payments_root():
    return {"message": "Payments router"}
