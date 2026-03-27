from pydantic import BaseModel


class RecordEarningRequest(BaseModel):
    seller_id: int
    transaction_id: str
    listing_id: int
    energy_cost_ngn: float


class BankDetailsRequest(BaseModel):
    bank_name: str
    account_number: str
    account_name: str


class PayoutRequestBody(BaseModel):
    amount: float
