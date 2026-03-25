from uuid import UUID
from fastapi import HTTPException
from app.services.energy_log import (
    create_energy_log as _create,
    get_all_energy_logs as _get_all,
    get_energy_log_by_id as _get_by_id,
    get_energy_logs_by_transaction_id as _get_by_txn,
)


async def create_energy_log(transactionId: UUID, deliveredKwh: float):
    try:
        return await _create(transactionId, deliveredKwh)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


async def get_energy_log():
    try:
        return await _get_all()
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


async def get_energy_by_id(id: UUID):
    try:
        return await _get_by_id(id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


async def get_energy_logs_by_transaction_id(transactionId: UUID):
    try:
        return await _get_by_txn(transactionId)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
