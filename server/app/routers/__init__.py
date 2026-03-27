from fastapi import APIRouter
from app.routers import auth, payments, proxy, energy_log, listing, transaction, meter, earnings

router = APIRouter()

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(earnings.router, prefix="/earnings", tags=["Earnings"])
api_router.include_router(proxy.router, prefix="/proxy", tags=["Proxy"])
api_router.include_router(energy_log.router, prefix="/EnergyLog", tags=["EnergyLog"])
api_router.include_router(listing.router, prefix="/Listing", tags=["Listing"])
api_router.include_router(transaction.router, prefix="/Transaction", tags=["Transaction"])
api_router.include_router(meter.router, prefix="/Meter", tags=["Meter"])
