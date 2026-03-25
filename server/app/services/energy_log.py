import httpx
from uuid import UUID
from app.config.settings import settings

BASE_URL = settings.ENERGY_ENGINE_URL

async def create_energy_log(transaction_id: UUID, delivered_kwh: float):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{BASE_URL}/api/EnergyLog/CreateEnergyLog/{transaction_id}",
            json={"deliveredKwh": delivered_kwh}
        )
        res.raise_for_status()
        return res.json()

async def get_all_energy_logs():
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/EnergyLog/GetAllEnergyLogs")
        res.raise_for_status()
        return res.json()

async def get_energy_log_by_id(id: UUID):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/EnergyLog/GetEnergyLogById/{id}")
        res.raise_for_status()
        return res.json()

async def get_energy_logs_by_transaction_id(transaction_id: UUID):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/EnergyLog/GetEnergyLogsByTransactionId/{transaction_id}")
        res.raise_for_status()
        return res.json()
