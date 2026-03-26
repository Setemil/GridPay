import httpx
from app.config.settings import settings

BASE_URL = settings.ENERGY_ENGINE_URL

async def create_listing(seller_id: int, meter_id: int, price_per_kwh: float, location: str):
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{BASE_URL}/api/Listing/CreateEnergyListing/{seller_id}/{meter_id}", json={
            "pricePerKwh": price_per_kwh,
            "location": location
        })
        print(res.status_code, res.text)
        res.raise_for_status()
        return res.json()
    
async def delete_listing(listing_id: int, seller_id: int):
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{BASE_URL}/api/Listing/DeleteEnergyListing/{listing_id}/{seller_id}")
        res.raise_for_status()
        return res.json()
    
async def get_active_listing(location: str = None):
    params = {}
    if location: 
        params["location"] = location
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Listing/GetActiveEnergyListings", params=params)
        res.raise_for_status()
        return res.json()
    
async def get_all_listings(isActive: bool = None, location: str = None):
    params = {}
    if isActive is not None: 
        params["isActive"] = isActive
    if location:
        params["location"] = location
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Listing/GetAllEnergyListings", params=params)
        res.raise_for_status()
        return res.json()
    
async def get_available_locations():
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Listing/GetAvailableLocations")
        res.raise_for_status()
        return res.json()

async def get_listing_by_id(listing_id: int):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Listing/GetEnergyListingById/{listing_id}")
        res.raise_for_status()
        return res.json()

async def get_listing_by_seller_id(seller_id: int):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BASE_URL}/api/Listing/GetEnergyListingBySellerId/{seller_id}")
        res.raise_for_status()
        return res.json()
    
async def update_listing(listing_id: int, seller_id: int, price_per_kwh: float, location: str = None, available_kwh: float = None, is_active: bool = None):
    if listing_id is None or seller_id is None:
        raise ValueError("listing_id and seller_id are required")
    body = {}
    if location:
        body["location"] = location
    if available_kwh is not None:
        body["availableKwh"] = available_kwh
    if is_active is not None:
        body["isActive"] = is_active
    if price_per_kwh is not None:
        body["pricePerKwh"] = price_per_kwh
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{BASE_URL}/api/Listing/UpdateEnergyListing/{listing_id}/{seller_id}", json=body)
        res.raise_for_status()
        return res.json()
    
async def update_listing_active_status(listing_id: int, seller_id: int, is_active: bool):
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{BASE_URL}/api/Listing/UpdateListingByIsActive/{listing_id}/{seller_id}/{str(is_active).lower()}")
        res.raise_for_status()
        return res.json()