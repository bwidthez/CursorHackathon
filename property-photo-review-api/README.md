# Property Photo Review API

This folder is the **Property Photo Review** microservice for RentShield. It handles review creation, photo uploads, admin verdicts, and voucher issuance. Spec: [../specs/property-photo-review.md](../specs/property-photo-review.md).

Other backends (e.g. user management, main app) live in their own folders; this one is only for the photo-review flow.

---

## Run the API

From the **repo root**:

```bash
cd property-photo-review-api
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

- API base: **http://localhost:8000**
- OpenAPI docs: **http://localhost:8000/docs**

Env vars: `MONGODB_URI`, `DB_NAME` (default `rentshield`), `UPLOAD_DIR` (default `uploads` inside this folder).

---

## How other users / services call this API

**Base URL**  
Use wherever this service is deployed, e.g.:

- Local: `http://localhost:8000`
- Staging: `https://photo-review-api-staging.yourcompany.com`
- Production: `https://api.rentshield.example.com/photo-review` (if behind a gateway)

**Required headers on every request**

The API does not issue tokens. The **user management service** (or API gateway) must send:

| Header      | Description |
| ----------- | ----------- |
| `X-User-Id` | Current user’s id (e.g. MongoDB `_id` as 24-char hex). |
| `X-Role`    | One of: `admin`, `landlord`, `tenant`. |

Missing or invalid headers → **401**. Wrong role for an endpoint → **403**.

**Example: create a review (landlord)**

```bash
curl -X POST "http://localhost:8000/api/property-reviews" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 507f1f77bcf86cd799439011" \
  -H "X-Role: landlord" \
  -d '{"tenantId": "507f1f77bcf86cd799439012", "landlordNote": "Monthly check"}'
```

**Example: list reviews (tenant or landlord or admin)**

```bash
curl "http://localhost:8000/api/property-reviews?status=pending_admin_review" \
  -H "X-User-Id: 507f1f77bcf86cd799439011" \
  -H "X-Role: tenant"
```

**Example: upload landlord photos (multipart)**

```bash
curl -X POST "http://localhost:8000/api/property-reviews/REVIEW_ID/photos" \
  -H "X-User-Id: 507f1f77bcf86cd799439011" \
  -H "X-Role: landlord" \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg"
```

**Example: admin set verdict (thumbs up with voucher)**

```bash
curl -X POST "http://localhost:8000/api/property-reviews/REVIEW_ID/verdict" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 507f1f77bcf86cd799439013" \
  -H "X-Role: admin" \
  -d '{"verdict": "thumbs_up", "voucherType": "cinema_10"}'
```

**Example: list vouchers (tenant or admin)**

```bash
curl "http://localhost:8000/api/vouchers" \
  -H "X-User-Id: 507f1f77bcf86cd799439012" \
  -H "X-Role: tenant"
```

**From a frontend (e.g. JavaScript)**

Set the base URL from config (env), then send the same headers on every request. The user management layer should provide `userId` and `role` after login; the frontend (or BFF) adds them as `X-User-Id` and `X-Role` when calling this API.

```javascript
const BASE_URL = process.env.NEXT_PUBLIC_PHOTO_REVIEW_API_URL || 'http://localhost:8000';

async function listReviews(userId, role) {
  const res = await fetch(`${BASE_URL}/api/property-reviews`, {
    headers: {
      'X-User-Id': userId,
      'X-Role': role,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

---

## Endpoints summary

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/property-reviews` | landlord | Create review; body: `tenantId`, optional `landlordNote`. |
| POST | `/api/property-reviews/{id}/photos` | landlord | Upload landlord photos (multipart `files`). |
| POST | `/api/property-reviews/{id}/tenant-photos` | tenant | Upload tenant photos (multipart `files`). |
| GET | `/api/property-reviews` | landlord, tenant, admin | List (query: `tenantId`, `propertyId`, `status`). |
| GET | `/api/property-reviews/{id}` | landlord, tenant, admin | Get one review. |
| POST | `/api/property-reviews/{id}/verdict` | admin | Set `thumbs_up` or `thumbs_down`; optional `voucherType` (default `amazon_10`). |
| GET | `/api/vouchers` | tenant, admin | Tenant: own; admin: all. |
| GET | `/health` | - | Health check. |

Photo URLs in responses are paths like `/uploads/abc123.jpg`; resolve them against the same base URL (e.g. `http://localhost:8000/uploads/abc123.jpg`).
