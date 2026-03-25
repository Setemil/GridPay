from pydantic import BaseModel
from typing import Optional


class PaymentInitRequest(BaseModel):
    amount: int  # in kobo (e.g. 10000 = ₦100)
    currency: str = "NGN"
    description: str
    customer_name: str
    customer_email: str
    customer_mobile: str
    redirect_url: str  # URL Interswitch redirects to after payment


class PaymentInitResponse(BaseModel):
    transaction_reference: str
    redirect_url: str
    amount: int
    currency: str


class PaymentVerifyResponse(BaseModel):
    transaction_reference: str
    amount: int
    currency: str
    status: str  # "00" = success
    response_description: str
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    payment_date: Optional[str] = None
