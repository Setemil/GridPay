from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from app.middleware.auth import get_current_user
from app.schemas.payments import PaymentInitRequest, PaymentInitResponse, PaymentVerifyResponse
from app.services import interswitch
from app.config.settings import settings

router = APIRouter()


@router.post("/initiate", response_model=PaymentInitResponse)
async def initiate_payment(
    body: PaymentInitRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await interswitch.initiate_payment(
            amount=body.amount,
            customer_email=body.customer_email,
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.get("/verify/{transaction_ref}", response_model=PaymentVerifyResponse)
async def verify_payment(
    transaction_ref: str,
    amount: int = Query(...),
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await interswitch.verify_payment(transaction_ref, amount)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.post("/redirect")
async def payment_redirect(request: Request):
    """
    Interswitch POSTs back to this endpoint after payment (form POST with txnref in body).
    We extract the txnref and redirect the browser to the frontend callback page.
    """
    form = await request.form()
    txnref = form.get("txnref") or form.get("transactionRef")
    if txnref:
        return RedirectResponse(
            url=f"{settings.CLIENT_URL}/payment/callback?txnref={txnref}",
            status_code=302,
        )
    return RedirectResponse(
        url=f"{settings.CLIENT_URL}/payment/callback?error=missing_ref",
        status_code=302,
    )


@router.post("/webhook")
async def payment_webhook(request: Request):
    try:
        payload = await request.json()
    except Exception:
        return {"status": "error", "detail": "Invalid JSON payload"}

    transaction_ref = (
        payload.get("txnref")
        or payload.get("transactionRef")
        or payload.get("TransactionRef")
    )
    amount = payload.get("amount") or payload.get("Amount")

    if not transaction_ref or not amount:
        return {"status": "ignored", "detail": "Missing transaction reference or amount"}

    try:
        result = await interswitch.verify_payment(transaction_ref, int(amount))
    except Exception as e:
        return {"status": "verification_failed", "detail": str(e)}

    if result.get("status") == "00":
        return {"status": "confirmed", "transactionRef": transaction_ref}

    return {"status": "payment_not_successful", "transactionRef": transaction_ref}
