from uuid import UUID
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import transaction as transaction_service

router = APIRouter()


class CreateTransactionDto(BaseModel):
    requestedKwh: float


@router.get("/")
async def transaction_root():
    return {"message": "Transaction router"}


@router.get("/getAllTransactions")
async def get_all_transactions(status: Optional[str] = None):
    try:
        return await transaction_service.get_all_transactions(status)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/getTransactionById/{transactionId}")
async def get_transaction_by_id(transactionId: UUID):
    try:
        return await transaction_service.get_transaction_by_id(transactionId)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/getTransactionByBuyerId/{buyerId}")
async def get_transaction_by_buyer_id(buyerId: int):
    try:
        return await transaction_service.get_transaction_by_buyer_id(buyerId)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/getTransactionBySellerId/{sellerId}")
async def get_transaction_by_seller_id(sellerId: int):
    try:
        return await transaction_service.get_transaction_by_seller_id(sellerId)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/getTransactionByUserId/{userId}")
async def get_transaction_by_user_id(userId: int):
    try:
        return await transaction_service.get_transaction_by_user_id(userId)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/getTransactionByPaymentReference/{paymentReference}")
async def get_transaction_by_payment_reference(paymentReference: str):
    try:
        return await transaction_service.get_transaction_by_payment_reference(paymentReference)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/getRequestedKwh/{transactionId}")
async def get_requested_kwh(transactionId: UUID):
    try:
        return await transaction_service.get_requested_kwh(transactionId)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/createTransaction/{sellerId}/{buyerId}/{listingId}")
async def create_transaction(sellerId: int, buyerId: int, listingId: int, body: CreateTransactionDto):
    try:
        return await transaction_service.create_transaction(sellerId, buyerId, listingId, body.requestedKwh)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/confirmPayment/{listingId}/{transactionId}/{paymentReference}")
async def confirm_payment(listingId: int, transactionId: UUID, paymentReference: str):
    try:
        return await transaction_service.confirm_payment(listingId, transactionId, paymentReference)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/updateDeliveredKwh/{transactionId}/{deliveredKwh}")
async def update_delivered_kwh(transactionId: UUID, deliveredKwh: float):
    try:
        return await transaction_service.update_delivered_kwh(transactionId, deliveredKwh)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
