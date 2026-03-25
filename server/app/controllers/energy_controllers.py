from uuid import UUID


async def create_energy_log(transactionId: UUID, deliveredKwh: float):
    return {"status": "created"}


async def get_energy_log():
    return {"status": "gotten"}


async def get_energy_by_id(id: int):
    return {"status": "presented"}


async def get_energy_logs_by_transaction_id(transactionId: UUID):
    return {"status": "presented"}
