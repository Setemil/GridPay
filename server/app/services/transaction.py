import httpx
from uuid import UUID
from fastapi import HTTPException
from app.config.settings import settings

BASE_URL = settings.ENERGY_ENGINE_URL


def _raise_for_status(res: httpx.Response):
    """Propagate backend errors with their original message and status code."""
    if res.is_error:
        try:
            detail = res.json().get("message") or res.text
        except Exception:
            detail = res.text
        raise HTTPException(status_code=res.status_code, detail=detail)


async def create_transaction(seller_id: int, buyer_id: int, listing_id: int, requested_kwh: float):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{BASE_URL}/api/Transaction/CreateTransaction/{seller_id}/{buyer_id}/{listing_id}",
            json={"requestedKwh": requested_kwh}
        )
        _raise_for_status(res)
        return res.json()

async def confirm_payment(listing_id: int, transaction_id: UUID, payment_reference: str):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{BASE_URL}/api/Transaction/ConfirmPayment/{listing_id}/{transaction_id}/{payment_reference}"
        )
        _raise_for_status(res)
        return res.json()

async def update_delivered_kwh(transaction_id: UUID, delivered_kwh: float):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{BASE_URL}/api/Transaction/UpdateTransactionDeliveredKwh/{transaction_id}/{delivered_kwh}"
        )
        _raise_for_status(res)
        return res.json()

async def get_all_transactions(status: str = None):
    params = {}
    if status:
        params["status"] = status
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Transaction/GetAllTransactions", params=params)
        _raise_for_status(res)
        return res.json()

async def get_transaction_by_id(transaction_id: UUID):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Transaction/GetTransactionById/{transaction_id}")
        _raise_for_status(res)
        return res.json()

async def get_transaction_by_buyer_id(buyer_id: int):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Transaction/GetTransactionByBuyerId/{buyer_id}")
        _raise_for_status(res)
        return res.json()

async def get_transaction_by_seller_id(seller_id: int):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Transaction/GetTransactionBySellerId/{seller_id}")
        _raise_for_status(res)
        return res.json()

async def get_transaction_by_user_id(user_id: int):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Transaction/GetTransactionByUserId/{user_id}")
        _raise_for_status(res)
        return res.json()

async def get_transaction_by_payment_reference(payment_reference: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{BASE_URL}/api/Transaction/GetTransactionByPaymentReference/{payment_reference}"
        )
        _raise_for_status(res)
        return res.json()

async def get_requested_kwh(transaction_id: UUID):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{BASE_URL}/api/Transaction/GetRequestedKwhInTransactionById/{transaction_id}"
        )
        _raise_for_status(res)
        return res.json()
