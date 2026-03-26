import uuid
import httpx
from app.config.settings import settings


async def initiate_payment(amount: int, customer_email: str) -> dict:
    txn_ref = f"KILO-{uuid.uuid4().hex[:12].upper()}"
    return {
        "merchant_code": settings.INTERSWITCH_MERCHANT_CODE,
        "pay_item_id": settings.INTERSWITCH_PAY_ITEM_ID,
        "txn_ref": txn_ref,
        "amount": amount,
        "currency": "566",
        "cust_email": customer_email,
        "webpay_url": settings.INTERSWITCH_WEBPAY_URL,
    }


async def verify_payment(transaction_ref: str, amount: int) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            settings.INTERSWITCH_VERIFY_URL,
            params={
                "merchantcode": settings.INTERSWITCH_MERCHANT_CODE,
                "transactionreference": transaction_ref,
                "amount": amount,
            },
        )
        response.raise_for_status()
        data = response.json()

    return {
        "transaction_reference": transaction_ref,
        "amount": data.get("Amount"),
        "currency": "NGN",
        "status": data.get("ResponseCode", ""),
        "response_description": data.get("ResponseDescription", ""),
        "payment_date": data.get("TransactionDate"),
    }
