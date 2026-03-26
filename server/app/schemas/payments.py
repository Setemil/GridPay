from pydantic import BaseModel
from typing import Optional


class PaymentInitRequest(BaseModel):
    amount: int  # in kobo (e.g. 10000 = ₦100)
    customer_email: str


class PaymentInitResponse(BaseModel):
    merchant_code: str
    pay_item_id: str
    txn_ref: str
    amount: int
    currency: str
    cust_email: str
    webpay_url: str


class PaymentVerifyResponse(BaseModel):
    transaction_reference: str
    amount: Optional[int] = None
    currency: str
    status: str  # "00" = success
    response_description: str
    payment_date: Optional[str] = None
