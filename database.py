from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os

# Global database connection
_client: Optional[AsyncIOMotorClient] = None
_database = None

async def get_db():
    """Get database connection"""
    global _client, _database
    
    if _client is None:
        mongodb_uri = os.getenv("MONGODB_URI")
        if not mongodb_uri:
            raise ValueError("MONGODB_URI environment variable is not set")
        
        _client = AsyncIOMotorClient(mongodb_uri)
        # Extract database name from URI or use default
        db_name = mongodb_uri.split("/")[-1].split("?")[0] or "rentshield"
        _database = _client[db_name]
    
    return _database

async def close_db():
    """Close database connection"""
    global _client
    if _client:
        _client.close()
        _client = None
