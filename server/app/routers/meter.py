from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import meter as meter_service

router = APIRouter()


class CreateMeterDto(BaseModel):
    deviceId: str


@router.get("/getAllMetersBySellerId/{sellerId}")
async def get_meters_by_seller(sellerId: int):
    try:
        return await meter_service.get_all_meters_by_seller_id(sellerId)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/createMeter/{sellerId}")
async def create_meter(sellerId: int, body: CreateMeterDto):
    try:
        return await meter_service.create_meter(sellerId, body.deviceId)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/getMeterById/{meterId}")
async def get_meter_by_id(meterId: int):
    try:
        return await meter_service.get_meter_by_id(meterId)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/getAllMeters")
async def get_all_meters():
    try:
        return await meter_service.get_all_meters()
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
