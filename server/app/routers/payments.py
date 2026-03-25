from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.middleware.auth import get_current_user
from app.schemas.payments import PaymentInitRequest, PaymentInitResponse, PaymentVerifyResponse
from app.services import interswitch

router = APIRouter()


@router.post("/initiate", response_model=PaymentInitResponse)
async def initiate_payment(
    body: PaymentInitRequest,
    current_user: dict = Depends(get_current_user),
):
    """Initiate a payment — returns a redirect URL for the user to complete payment."""
    try:
        result = await interswitch.initiate_payment(
            amount=body.amount,
            currency=body.currency,
            description=body.description,
            customer_name=body.customer_name,
            customer_email=body.customer_email,
            customer_mobile=body.customer_mobile,
            redirect_url=body.redirect_url,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.get("/verify/{transaction_ref}", response_model=PaymentVerifyResponse)
async def verify_payment(
    transaction_ref: str,
    current_user: dict = Depends(get_current_user),
):
    """Verify payment status after the user is redirected back from Interswitch."""
    try:
        result = await interswitch.verify_payment(transaction_ref)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.post("/webhook")
async def payment_webhook(request: Request):
    """
    Interswitch webhook for async payment status updates.
    Configure this URL in your Interswitch dashboard.
    Endpoint: POST /api/payments/webhook
    """
    payload = await request.json()
    # TODO: validate the webhook signature from Interswitch
    # then update the relevant transaction record in your database
    return {"status": "received"}
