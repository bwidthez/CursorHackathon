# Testing the User API

This guide shows multiple ways to test the FastAPI User API.

## Prerequisites

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure your `.env` file has the `MONGODB_URI` configured.

3. Start the FastAPI server:
```bash
python main.py
```
or
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

---

## Method 1: FastAPI Interactive Documentation (Easiest)

FastAPI automatically generates interactive API documentation:

1. **Swagger UI**: Open `http://localhost:8000/docs` in your browser
   - Interactive interface to test all endpoints
   - Click "Try it out" on any endpoint
   - Fill in the request body and click "Execute"

2. **ReDoc**: Open `http://localhost:8000/redoc` in your browser
   - Alternative documentation format
   - More readable but less interactive

---

## Method 2: Python Test Script

Run the provided test script:

```bash
# Install requests if not already installed
pip install requests

# Run the test script
python test_api.py
```

This will test all endpoints and show you example requests/responses.

---

## Method 3: Using curl (Command Line)

### Health Check
```bash
curl http://localhost:8000/health
```

### Create a User
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "tenant",
    "status": "active"
  }'
```

### List All Users
```bash
curl http://localhost:8000/api/users/
```

### List Users by Role
```bash
curl "http://localhost:8000/api/users/?role=landlord"
```

### List Users by Status
```bash
curl "http://localhost:8000/api/users/?status=active"
```

### Get User by ID
```bash
# Replace USER_ID with actual ID from create response
curl http://localhost:8000/api/users/USER_ID
```

### Get User by Email
```bash
curl http://localhost:8000/api/users/email/john@example.com
```

### Update User
```bash
curl -X PUT "http://localhost:8000/api/users/USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "status": "suspended"
  }'
```

### Update User Status
```bash
curl -X POST "http://localhost:8000/api/users/USER_ID/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:8000/api/users/USER_ID
```

---

## Method 4: Using Postman or Insomnia

1. Import the API endpoints:
   - Base URL: `http://localhost:8000`
   - Endpoints are under `/api/users/`

2. Example request for creating a user:
   - Method: `POST`
   - URL: `http://localhost:8000/api/users/`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "test123",
       "role": "tenant",
       "status": "active"
     }
     ```

---

## Method 5: Using Python requests (Interactive)

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Create a user
response = requests.post(
    f"{BASE_URL}/api/users/",
    json={
        "name": "Alice Tenant",
        "email": "alice@example.com",
        "password": "secure123",
        "role": "tenant"
    }
)
print(json.dumps(response.json(), indent=2))

# Get the user ID from response
user_id = response.json()["id"]

# List all users
response = requests.get(f"{BASE_URL}/api/users/")
print(json.dumps(response.json(), indent=2))

# Update the user
response = requests.put(
    f"{BASE_URL}/api/users/{user_id}",
    json={"name": "Alice Updated"}
)
print(json.dumps(response.json(), indent=2))
```

---

## Example Test Flow

1. **Create an admin user:**
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@rentshield.com","password":"admin123","role":"admin"}'
```

2. **Create a landlord:**
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{"name":"Landlord Smith","email":"landlord@rentshield.com","password":"landlord123","role":"landlord"}'
```

3. **Create a tenant:**
```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tenant Jones","email":"tenant@rentshield.com","password":"tenant123","role":"tenant"}'
```

4. **List all landlords:**
```bash
curl "http://localhost:8000/api/users/?role=landlord"
```

5. **Suspend a tenant:**
```bash
# First get the tenant ID, then:
curl -X POST "http://localhost:8000/api/users/TENANT_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"suspended"}'
```

---

## Expected Response Formats

### Create User (201 Created)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "tenant",
  "status": "active",
  "createdAt": "2026-02-12T20:00:00",
  "updatedAt": "2026-02-12T20:00:00"
}
```

### List Users (200 OK)
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "tenant",
      "status": "active"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

### Error Response (400/404/409)
```json
{
  "detail": "Error message here"
}
```

---

## Troubleshooting

- **Connection refused**: Make sure the server is running (`python main.py`)
- **MongoDB connection error**: Check your `MONGODB_URI` in `.env`
- **Invalid user ID**: Make sure you're using the correct MongoDB ObjectId format
- **Duplicate email**: Each email must be unique

---

## Valid Roles

- `admin`
- `landlord`
- `tenant`

## Valid Status Values

Common statuses:
- `active`
- `suspended`
- `inactive`

(You can use any string value for status)
