from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, List, Optional, Any
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
import hashlib
import secrets

from database import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

# Helper function to convert ObjectId to string
def serialize_user(user: Dict) -> Dict:
    """Convert MongoDB document to JSON-serializable dict"""
    if user and "_id" in user:
        user["id"] = str(user["_id"])
        del user["_id"]
    return user

# Helper function to hash password
def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    try:
        salt, stored_hash = password_hash.split(":", 1)
        computed_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return computed_hash == stored_hash
    except ValueError:
        return False

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(user_data: Dict[str, Any], db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Create a new user
    
    Expected body:
    {
        "name": str,
        "email": str,
        "password": str,
        "role": "admin" | "landlord" | "tenant",
        "status": str (optional, defaults to "active")
    }
    """
    # Validate required fields
    required_fields = ["name", "email", "password", "role"]
    for field in required_fields:
        if field not in user_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Validate role
    valid_roles = ["admin", "landlord", "tenant"]
    if user_data["role"] not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data["email"]})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )
    
    # Create user document
    user_doc = {
        "name": user_data["name"],
        "email": user_data["email"],
        "passwordHash": hash_password(user_data["password"]),
        "role": user_data["role"],
        "status": user_data.get("status", "active"),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    # Return user without password hash
    user_response = serialize_user(user_doc)
    del user_response["passwordHash"]
    
    return user_response

@router.get("/")
async def list_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    List all users with optional filtering by role and status
    """
    query = {}
    if role:
        query["role"] = role
    if status:
        query["status"] = status
    
    cursor = db.users.find(query).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    # Remove password hashes and serialize
    result = []
    for user in users:
        user_dict = serialize_user(user)
        if "passwordHash" in user_dict:
            del user_dict["passwordHash"]
        result.append(user_dict)
    
    total = await db.users.count_documents(query)
    
    return {
        "users": result,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{user_id}")
async def get_user(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Get a specific user by ID
    """
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    user = await db.users.find_one({"_id": object_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_dict = serialize_user(user)
    if "passwordHash" in user_dict:
        del user_dict["passwordHash"]
    
    return user_dict

@router.put("/{user_id}")
async def update_user(
    user_id: str,
    user_data: Dict[str, Any],
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update a user
    
    Expected body (all fields optional):
    {
        "name": str,
        "email": str,
        "password": str,
        "role": "admin" | "landlord" | "tenant",
        "status": str
    }
    """
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    user = await db.users.find_one({"_id": object_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Build update document
    update_doc = {"updatedAt": datetime.utcnow()}
    
    if "name" in user_data:
        update_doc["name"] = user_data["name"]
    if "email" in user_data:
        # Check if email is already taken by another user
        existing = await db.users.find_one({
            "email": user_data["email"],
            "_id": {"$ne": object_id}
        })
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use by another user"
            )
        update_doc["email"] = user_data["email"]
    if "password" in user_data:
        update_doc["passwordHash"] = hash_password(user_data["password"])
    if "role" in user_data:
        valid_roles = ["admin", "landlord", "tenant"]
        if user_data["role"] not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
        update_doc["role"] = user_data["role"]
    if "status" in user_data:
        update_doc["status"] = user_data["status"]
    
    await db.users.update_one({"_id": object_id}, {"$set": update_doc})
    
    # Return updated user
    updated_user = await db.users.find_one({"_id": object_id})
    user_dict = serialize_user(updated_user)
    if "passwordHash" in user_dict:
        del user_dict["passwordHash"]
    
    return user_dict

@router.delete("/{user_id}")
async def delete_user(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Delete a user by ID
    """
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    result = await db.users.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted successfully", "id": user_id}

@router.get("/email/{email}")
async def get_user_by_email(email: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Get a user by email address
    """
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_dict = serialize_user(user)
    if "passwordHash" in user_dict:
        del user_dict["passwordHash"]
    
    return user_dict

@router.post("/{user_id}/status")
async def update_user_status(
    user_id: str,
    status_data: Dict[str, str],
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update user status (e.g., suspend/activate)
    
    Expected body:
    {
        "status": "active" | "suspended" | "inactive"
    }
    """
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    if "status" not in status_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'status' field"
        )
    
    result = await db.users.update_one(
        {"_id": object_id},
        {"$set": {"status": status_data["status"], "updatedAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    updated_user = await db.users.find_one({"_id": object_id})
    user_dict = serialize_user(updated_user)
    if "passwordHash" in user_dict:
        del user_dict["passwordHash"]
    
    return user_dict
