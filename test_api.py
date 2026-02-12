#!/usr/bin/env python3
"""
Simple script to test the User API endpoints
Run this after starting the FastAPI server
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def print_response(response: requests.Response, title: str):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print(f"{'='*60}\n")

def test_health_check():
    """Test health endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response(response, "Health Check")
    return response.status_code == 200

def test_create_user(name: str, email: str, password: str, role: str, status: str = "active") -> Dict[str, Any]:
    """Test creating a user"""
    data = {
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "status": status
    }
    response = requests.post(f"{BASE_URL}/api/users/", json=data)
    print_response(response, f"Create User: {name} ({role})")
    return response.json() if response.status_code == 201 else None

def test_list_users(role: str = None, status: str = None):
    """Test listing users"""
    params = {}
    if role:
        params["role"] = role
    if status:
        params["status"] = status
    
    response = requests.get(f"{BASE_URL}/api/users/", params=params)
    print_response(response, f"List Users (role={role}, status={status})")
    return response.json() if response.status_code == 200 else None

def test_get_user(user_id: str):
    """Test getting a user by ID"""
    response = requests.get(f"{BASE_URL}/api/users/{user_id}")
    print_response(response, f"Get User by ID: {user_id}")
    return response.json() if response.status_code == 200 else None

def test_get_user_by_email(email: str):
    """Test getting a user by email"""
    response = requests.get(f"{BASE_URL}/api/users/email/{email}")
    print_response(response, f"Get User by Email: {email}")
    return response.json() if response.status_code == 200 else None

def test_update_user(user_id: str, updates: Dict[str, Any]):
    """Test updating a user"""
    response = requests.put(f"{BASE_URL}/api/users/{user_id}", json=updates)
    print_response(response, f"Update User: {user_id}")
    return response.json() if response.status_code == 200 else None

def test_update_user_status(user_id: str, status: str):
    """Test updating user status"""
    data = {"status": status}
    response = requests.post(f"{BASE_URL}/api/users/{user_id}/status", json=data)
    print_response(response, f"Update User Status: {user_id} -> {status}")
    return response.json() if response.status_code == 200 else None

def test_delete_user(user_id: str):
    """Test deleting a user"""
    response = requests.delete(f"{BASE_URL}/api/users/{user_id}")
    print_response(response, f"Delete User: {user_id}")
    return response.status_code == 200

def main():
    """Run all tests"""
    print("🚀 Starting API Tests...")
    print(f"Testing API at: {BASE_URL}\n")
    
    # Test 1: Health check
    if not test_health_check():
        print("❌ Health check failed. Is the server running?")
        return
    
    # Test 2: Create users
    print("\n📝 Creating test users...")
    admin_user = test_create_user(
        name="Admin User",
        email="admin@test.com",
        password="admin123",
        role="admin"
    )
    
    landlord_user = test_create_user(
        name="John Landlord",
        email="landlord@test.com",
        password="landlord123",
        role="landlord"
    )
    
    tenant_user = test_create_user(
        name="Jane Tenant",
        email="tenant@test.com",
        password="tenant123",
        role="tenant"
    )
    
    # Test 3: List all users
    print("\n📋 Listing all users...")
    test_list_users()
    
    # Test 4: List users by role
    print("\n📋 Listing users by role...")
    test_list_users(role="landlord")
    test_list_users(role="tenant")
    
    # Test 5: Get user by ID
    if tenant_user and "id" in tenant_user:
        print("\n🔍 Getting user by ID...")
        test_get_user(tenant_user["id"])
    
    # Test 6: Get user by email
    print("\n🔍 Getting user by email...")
    test_get_user_by_email("landlord@test.com")
    
    # Test 7: Update user
    if landlord_user and "id" in landlord_user:
        print("\n✏️  Updating user...")
        test_update_user(landlord_user["id"], {
            "name": "John Landlord Updated",
            "status": "active"
        })
    
    # Test 8: Update user status
    if tenant_user and "id" in tenant_user:
        print("\n✏️  Updating user status...")
        test_update_user_status(tenant_user["id"], "suspended")
        test_update_user_status(tenant_user["id"], "active")
    
    # Test 9: List users by status
    print("\n📋 Listing users by status...")
    test_list_users(status="active")
    
    # Test 10: Error cases
    print("\n❌ Testing error cases...")
    
    # Try to create duplicate email
    print("\nTrying to create user with duplicate email...")
    response = requests.post(f"{BASE_URL}/api/users/", json={
        "name": "Duplicate",
        "email": "admin@test.com",
        "password": "pass123",
        "role": "tenant"
    })
    print_response(response, "Create User with Duplicate Email (should fail)")
    
    # Try to get non-existent user
    print("\nTrying to get non-existent user...")
    response = requests.get(f"{BASE_URL}/api/users/507f1f77bcf86cd799439011")
    print_response(response, "Get Non-existent User (should fail)")
    
    # Try invalid role
    print("\nTrying to create user with invalid role...")
    response = requests.post(f"{BASE_URL}/api/users/", json={
        "name": "Invalid Role",
        "email": "invalid@test.com",
        "password": "pass123",
        "role": "invalid_role"
    })
    print_response(response, "Create User with Invalid Role (should fail)")
    
    print("\n✅ Tests completed!")
    print("\n💡 Note: Created test users are still in the database.")
    print("   You can delete them manually or clean up the database.")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API.")
        print("   Make sure the FastAPI server is running:")
        print("   python main.py")
        print("   or")
        print("   uvicorn main:app --reload")
    except Exception as e:
        print(f"❌ Error: {e}")
