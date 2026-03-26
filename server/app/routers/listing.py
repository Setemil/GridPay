from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.services.listing import create_listing, delete_listing, get_active_listing, get_all_listings, get_available_locations, get_listing_by_id, get_listing_by_seller_id, update_listing, update_listing_active_status

router = APIRouter()

class UpdateListingDto(BaseModel):
    location: Optional[str] = None
    pricePerKwh: Optional[float] = None
    availableKwh: Optional[float] = None
    isActive: Optional[bool] = None

class CreateListingDto(BaseModel):
    meterId: int
    pricePerKwh: float
    location: Optional[str] = None

@router.get("/")
def payments_root():
    return {"message": "Payments router"}

@router.get("/getActiveListing")
async def get_active_listing_route(location: str = None):
    try:
        return await get_active_listing(location)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

@router.get("/getAllListings")
async def get_all_listings_route(isActive: bool = None, location: str = None):
    try:
        return await get_all_listings(isActive, location)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

@router.get("/getAvailableLocations")
async def get_available_locations_route():
    try:
        return await get_available_locations()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

@router.get("/getListingById/{listingId}")
async def get_listing_by_id_route(listingId: int):
    try:
        return await get_listing_by_id(listingId)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.get("/getListingBySellerId/{sellerId}")
async def get_listing_by_seller_id_route(sellerId: int):
    try:
        return await get_listing_by_seller_id(sellerId)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

@router.post("/createListing/{sellerId}")
async def create_listing_route(sellerId: int, body: CreateListingDto):
    if body.pricePerKwh > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Price per kWh cannot exceed ₦500.",
        )
    try:
        try:
            existing = await get_listing_by_seller_id(sellerId)
            existing_listings = existing.get("data") or []
            if any(l.get("meterId") == body.meterId for l in existing_listings):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This meter is already used in another listing.",
                )
        except HTTPException:
            raise
        except Exception:
            pass  # If the preflight check fails, proceed and let ASP.NET enforce the constraint
        return await create_listing(sellerId, body.meterId, body.pricePerKwh, body.location)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

@router.post("/deleteListing/{listingId}/{sellerId}")
async def delete_listing_route(listingId: int, sellerId: int):
    try:
        return await delete_listing(listingId, sellerId)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

@router.post("/updateListing/{listingId}/{sellerId}")
async def update_listing(listingId: int, sellerId: int, body: UpdateListingDto):
    try:
        return await update_listing(listingId, sellerId, body)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

@router.post("/updateListingActiveStatus/{listingId}/{sellerId}/{isActive}")
async def update_listing_active_status_route(listingId: int, sellerId: int, isActive: bool):
    try:
        return await update_listing_active_status(listingId, sellerId, isActive)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
