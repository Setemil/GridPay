from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from app.config.settings import settings

client = MongoClient(
    settings.MONGO_URI,
    server_api=ServerApi('1'),
    tls=True,
    tlsAllowInvalidCertificates=True,
)

def connect_db():
    try:
        client.admin.command('ping')
        print("Database Connected")
    except Exception as e:
        print(e)

def get_next_id(collection_name: str) -> int:
    db = client["GridPayDB"]
    result = db["counters"].find_one_and_update(
        {"_id": collection_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return result["seq"]