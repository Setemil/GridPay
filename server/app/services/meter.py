import httpx
from app.config.settings import settings

BASE_URL = settings.ENERGY_ENGINE_URL


async def get_all_meters_by_seller_id(seller_id: int):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{BASE_URL}/api/Meter/GetAllMetersBysellerId",
            params={"sellerId": seller_id},
        )
        res.raise_for_status()
        return res.json()


async def create_meter(seller_id: int, device_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{BASE_URL}/api/Meter/CreateMeter",
            params={"sellerId": seller_id},
            json={"deviceId": device_id},
        )
        res.raise_for_status()
        return res.json()


async def get_meter_by_id(meter_id: int):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Meter/GetMeterById/{meter_id}")
        res.raise_for_status()
        return res.json()


async def get_all_meters():
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Meter/GetAllMeters")
        res.raise_for_status()
        return res.json()
