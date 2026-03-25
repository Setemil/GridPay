import hashlib
import hmac
import uuid
import time
import base64
import httpx
from app.config.settings import settings

# Cache the token in memory to avoid fetching it on every request
_token_cache: dict = {"access_token": None, "expires_at": 0}


def _build_basic_auth() -> str:
    credentials = f"{settings.INTERSWITCH_CLIENT_ID}:{settings.INTERSWITCH_SECRET_KEY}"
    return base64.b64encode(credentials.encode()).decode()


def _build_signature(http_method: str, resource_url: str, body_hash: str = "") -> tuple[str, str, str]:
    """
    Returns (signature, nonce, timestamp) for the Authorization header.

    Interswitch signature string:
      ClientId + Timestamp + Nonce + HttpMethod + ResourceUrl + BodyHash
    """
    nonce = str(uuid.uuid4())
    timestamp = str(int(time.time()))
    signature_string = (
        settings.INTERSWITCH_CLIENT_ID
        + timestamp
        + nonce
        + http_method.upper()
        + resource_url
        + body_hash
    )
    signature = hmac.new(
        settings.INTERSWITCH_SECRET_KEY.encode(),
        signature_string.encode(),
        hashlib.sha512,
    ).hexdigest()
    return signature, nonce, timestamp


def _hash_body(body: str) -> str:
    return hashlib.sha512(body.encode()).hexdigest()


async def get_access_token() -> str:
    """Fetch and cache a Passport OAuth token."""
    if _token_cache["access_token"] and time.time() < _token_cache["expires_at"]:
        return _token_cache["access_token"]

    url = f"{settings.INTERSWITCH_BASE_URL}/passport/oauth/token"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers={
                "Authorization": f"Basic {_build_basic_auth()}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={"grant_type": "client_credentials"},
        )
        response.raise_for_status()
        data = response.json()

    _token_cache["access_token"] = data["access_token"]
    # Refresh 60 seconds before actual expiry
    _token_cache["expires_at"] = time.time() + data.get("expires_in", 3600) - 60
    return _token_cache["access_token"]


async def initiate_payment(
    amount: int,
    currency: str,
    description: str,
    customer_name: str,
    customer_email: str,
    customer_mobile: str,
    redirect_url: str,
) -> dict:
    """
    Initiate a payment transaction. Returns transaction_reference and redirect_url.
    Amount is in kobo (smallest currency unit).
    """
    transaction_ref = f"KILO-{uuid.uuid4().hex[:12].upper()}"
    resource_path = "/api/v3/purchases"
    full_url = f"{settings.INTERSWITCH_BASE_URL}{resource_path}"

    payload = {
        "customerId": customer_email,
        "amount": str(amount),
        "currency": currency,
        "description": description,
        "transactionRef": transaction_ref,
        "redirectUrl": redirect_url,
        "customer": {
            "name": customer_name,
            "email": customer_email,
            "mobile": customer_mobile,
        },
    }

    import json
    body_str = json.dumps(payload)
    body_hash = _hash_body(body_str)
    signature, nonce, timestamp = _build_signature("POST", resource_path, body_hash)

    token = await get_access_token()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            full_url,
            headers={
                "Authorization": f"Bearer {token}",
                "Signature": f"clientid={settings.INTERSWITCH_CLIENT_ID},nonce={nonce},timestamp={timestamp},signaturehash={signature}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            content=body_str,
        )
        response.raise_for_status()
        data = response.json()

    return {
        "transaction_reference": transaction_ref,
        "redirect_url": data.get("redirectUrl") or f"{settings.INTERSWITCH_BASE_URL}/webpay?transactionreference={transaction_ref}",
        "amount": amount,
        "currency": currency,
    }


async def verify_payment(transaction_ref: str) -> dict:
    """Verify the status of a payment by its transaction reference."""
    resource_path = f"/api/v3/purchases/{transaction_ref}"
    full_url = f"{settings.INTERSWITCH_BASE_URL}{resource_path}"

    signature, nonce, timestamp = _build_signature("GET", resource_path)
    token = await get_access_token()

    async with httpx.AsyncClient() as client:
        response = await client.get(
            full_url,
            headers={
                "Authorization": f"Bearer {token}",
                "Signature": f"clientid={settings.INTERSWITCH_CLIENT_ID},nonce={nonce},timestamp={timestamp},signaturehash={signature}",
                "Accept": "application/json",
            },
        )
        response.raise_for_status()
        data = response.json()

    return {
        "transaction_reference": transaction_ref,
        "amount": data.get("amount"),
        "currency": data.get("currency"),
        "status": data.get("responseCode", ""),
        "response_description": data.get("responseDescription", ""),
        "customer_name": data.get("customer", {}).get("name"),
        "customer_email": data.get("customer", {}).get("email"),
        "payment_date": data.get("transactionDate"),
    }
