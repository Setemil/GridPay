from datetime import datetime, timezone
from app.config.db import client


def _db():
    return client["GridPayDB"]


def record_earning(seller_id: int, transaction_id: str, listing_id: int, energy_cost_ngn: float):
    db = _db()
    # Idempotent — one record per transaction
    if db["earnings"].find_one({"transactionId": transaction_id}):
        return
    db["earnings"].insert_one({
        "sellerId": seller_id,
        "transactionId": transaction_id,
        "listingId": listing_id,
        "energyCostNGN": energy_cost_ngn,
        "paid": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })


def get_balance(seller_id: int) -> dict:
    db = _db()
    records = list(db["earnings"].find({"sellerId": seller_id}))
    total = sum(r["energyCostNGN"] for r in records)
    paid = sum(r["energyCostNGN"] for r in records if r.get("paid"))
    return {
        "total_earned": round(total, 2),
        "paid_out": round(paid, 2),
        "available": round(total - paid, 2),
    }


def get_history(seller_id: int) -> list:
    db = _db()
    records = list(db["earnings"].find({"sellerId": seller_id}).sort("createdAt", -1))
    for r in records:
        r.pop("_id", None)
    return records


def save_bank_details(user_id: str, bank_name: str, account_number: str, account_name: str):
    db = _db()
    db["bank_details"].replace_one(
        {"userId": user_id},
        {
            "userId": user_id,
            "bankName": bank_name,
            "accountNumber": account_number,
            "accountName": account_name,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        },
        upsert=True,
    )


def get_bank_details(user_id: str) -> dict | None:
    db = _db()
    details = db["bank_details"].find_one({"userId": user_id})
    if details:
        details.pop("_id", None)
    return details


def create_payout_request(user_id: str, amount: float, bank_details: dict):
    db = _db()
    db["payout_requests"].insert_one({
        "userId": user_id,
        "amount": amount,
        "bankDetails": bank_details,
        "status": "pending",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })
