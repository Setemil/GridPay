from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.schemas.earnings import RecordEarningRequest, BankDetailsRequest, PayoutRequestBody
from app.services import earnings as earnings_svc

router = APIRouter()


@router.post("/record", status_code=201)
async def record_earning(body: RecordEarningRequest, current_user: dict = Depends(get_current_user)):
    earnings_svc.record_earning(
        seller_id=body.seller_id,
        transaction_id=body.transaction_id,
        listing_id=body.listing_id,
        energy_cost_ngn=body.energy_cost_ngn,
    )
    return {"message": "Earning recorded."}


@router.get("/balance")
async def get_balance(current_user: dict = Depends(get_current_user)):
    seller_id = int(current_user["id"])
    return earnings_svc.get_balance(seller_id)


@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    seller_id = int(current_user["id"])
    return earnings_svc.get_history(seller_id)


@router.get("/bank-details")
async def get_bank_details(current_user: dict = Depends(get_current_user)):
    details = earnings_svc.get_bank_details(str(current_user["id"]))
    return details or {}


@router.put("/bank-details", status_code=200)
async def save_bank_details(body: BankDetailsRequest, current_user: dict = Depends(get_current_user)):
    earnings_svc.save_bank_details(
        user_id=str(current_user["id"]),
        bank_name=body.bank_name,
        account_number=body.account_number,
        account_name=body.account_name,
    )
    return {"message": "Bank details saved."}


@router.post("/payout-request", status_code=201)
async def request_payout(body: PayoutRequestBody, current_user: dict = Depends(get_current_user)):
    seller_id = int(current_user["id"])
    balance = earnings_svc.get_balance(seller_id)
    if body.amount > balance["available"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested amount exceeds available balance.",
        )
    bank_details = earnings_svc.get_bank_details(str(current_user["id"]))
    if not bank_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please save your bank details before requesting a payout.",
        )
    earnings_svc.create_payout_request(
        user_id=str(current_user["id"]),
        amount=body.amount,
        bank_details=bank_details,
    )
    return {"message": "Payout request submitted. We'll process it within 3–5 business days."}
