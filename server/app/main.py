from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.routers import api_router
from app.config.db import connect_db
import asyncio


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(connect_db)
    yield


app = FastAPI(title="GridPay API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health")
def health():
    return {"status": "Gridpay API is Active!"}