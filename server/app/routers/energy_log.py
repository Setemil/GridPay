from uuid import UUID
from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.energy_controllers import (
    get_energy_by_id,
    get_energy_log,
    get_energy_logs_by_transaction_id,
    create_energy_log,
)

router = APIRouter()

class CreateEnergyLogDto(BaseModel):
    deliveredKwh: float

@router.get("/")
async def get_all_energy_logs():
    return await get_energy_log()


@router.post("/CreateEnergyLog/{transactionId}")
async def create_energy_log_route(transactionId: UUID, body: CreateEnergyLogDto):
    return await create_energy_log(transactionId, body.deliveredKwh)


@router.get("/GetEnergyLogById/{Id}")
async def get_energy_log_by_id(Id: int):
    return await get_energy_by_id(Id)


@router.get("/GetEnergyLogsByTransactionId/{transactionId}")
async def get_energy_logs_by_transaction_id_route(transactionId: UUID):
    return await get_energy_logs_by_transaction_id(transactionId)
