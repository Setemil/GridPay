# GridPay Server

GridPay is a peer-to-peer solar energy trading platform. Users can link their solar panels to a smart meter, track surplus energy generation, and list it for sale. Buyers can purchase kilowatt-hours directly from sellers at seller-defined prices.

---

## Architecture

```
┌─────────────────────┐
│   React (TypeScript) │  Frontend
│       Client         │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│   FastAPI (Python)  │  Middleware
│   Kilo API — :8000  │──────────────────────┐
└──────────┬──────────┘                       │
           │ HTTP proxy                        │ OAuth2 + HMAC-SHA512
           ▼                                   ▼
┌─────────────────────┐             ┌─────────────────────┐
│  ASP.NET (C#)       │             │    Interswitch       │
│  Energy Engine      │             │  Payment Gateway     │
│  Kilo Backend       │             └─────────────────────┘
└──────────┬──────────┘
           │ EF Core
           ▼
┌─────────────────────┐
│      SQL Server      │
└─────────────────────┘

FastAPI also connects to:
┌─────────────────────┐
│   MongoDB Atlas      │  User accounts & credentials
└─────────────────────┘
```

**Request flow:**
1. The frontend communicates exclusively with the FastAPI middleware.
2. FastAPI handles authentication (JWT via MongoDB) and payments (Interswitch).
3. All energy trading operations (listings, transactions, meters, energy logs) are proxied by FastAPI to the ASP.NET Energy Engine.

---

## ASP.NET Energy Engine

> **Written by Jesse Young**

**Location:** `server/kiloBackend/`
**Framework:** .NET 8.0
**Database:** SQL Server via Entity Framework Core 8
**Logging:** NLog
**API Docs:** Swagger UI (development only, at `/swagger`)

### Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Entity Framework Core | 8.0.0 | ORM / SQL Server |
| NLog | 6.1.2 | File-based logging |
| Swashbuckle | 6.6.2 | Swagger/OpenAPI docs |
| DotNetEnv | 3.1.1 | `.env` file support |

### Data Models

| Model | Key Fields |
|-------|-----------|
| **User** | ExternalId (PK, non-generated), FullName, Email, Role (User/Admin) |
| **Meter** | Id, DeviceId (unique), SellerId, TotalGeneratedKwh, ConsumedKwh, IsActive |
| **Listing** | Id, SellerId, MeterId, PricePerKwh, Location, IsActive, IsDeleted |
| **Transaction** | Id (Guid), BuyerId, SellerId, RequestedKwh, DeliveredKwh, TotalAmount, PlatformFee, PaymentReference, Status |
| **EnergyLog** | Id (Guid), TransactionId, DeliveredKwh, Timestamp |

**Transaction Status lifecycle:**
```
PendingPayment → Paid → EnergyLocked → Delivering → Completed
                                                   → Failed
                                                   → Refunded
```

**Platform fee:** 1% of total transaction amount.
**Available energy:** `TotalGeneratedKwh − ConsumedKwh` per meter.

### Background Services

- **SurplusBackgroundService** — Runs every 60 seconds. Simulates meter readings by time of day (Morning / Afternoon / Evening / Night), updating `TotalGeneratedKwh` and `ConsumedKwh` for all active meters.
- **EnergyDeliveryService** — Triggered when a transaction enters `EnergyLocked` status. Runs every 10 seconds, randomly delivering 0–3 kWh per interval, creating `EnergyLog` entries until `RequestedKwh` is fulfilled, then marks the transaction `Completed`.

### API Endpoints

All responses use a standard `ApiResponse` wrapper: `{ statusCode, message, data }`.

#### User — `/api/User`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/CreateUser` | Register a user in the Energy Engine (called internally by FastAPI on registration) |
| GET | `/GetAllUsers` | List all users |
| GET | `/GetUserByEmail/{email}` | Look up user by email |
| GET | `/GetUserByExternalId/{externalId}` | Look up user by their MongoDB-assigned ID |

**CreateUser body:**
```json
{ "id": 1, "fullName": "Jane Doe", "email": "jane@example.com", "role": "User" }
```

---

#### Meter — `/api/Meter`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/GetAllMeters` | List all meters |
| GET | `/GetAllMetersBysellerId?sellerId={id}` | List meters owned by a seller |
| GET | `/GetMeterByDeviceId?deviceId={id}` | Look up meter by hardware device ID |
| GET | `/GetMeterById/{id}` | Look up meter by database ID |
| POST | `/CreateMeter` | Register a meter and seed with simulated energy data |

**CreateMeter body:**
```json
{ "deviceId": "DEVICE-ABC123" }
```

---

#### Listing — `/api/Listing`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/CreateEnergyListing/{sellerId}/{meterId}` | Create an energy listing |
| POST | `/UpdateEnergyListing/{Id}/{sellerId}` | Update listing price, location, or status |
| POST | `/UpdateListingByIsActive/{Id}/{sellerId}/{isActive}` | Toggle listing on/off |
| POST | `/DeleteEnergyListing/{id}/{sellerId}` | Soft-delete a listing |
| GET | `/GetActiveEnergyListings?location={loc}` | Browse active listings (optional location filter) |
| GET | `/GetAllEnergyListings?isActive={bool}&location={loc}` | List all listings with optional filters |
| GET | `/GetAvailableLocations` | Get all distinct listing locations |
| GET | `/GetEnergyListingById/{id}` | Get a single listing |
| GET | `/GetEnergyListingBySellerId?sellerId={id}` | Get all listings by a seller |

**CreateEnergyListing body:**
```json
{ "pricePerKwh": 85.50, "location": "Lagos" }
```

---

#### Transaction — `/api/Transaction`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/CreateTransaction/{sellerId}/{buyerId}/{listingId}` | Initiate a purchase; returns transaction with payment reference |
| POST | `/ConfirmPayment/{listingId}/{transactionId}/{paymentReference}` | Mark payment confirmed; locks energy for delivery |
| POST | `/UpdateTransactionDeliveredKwh/{transactionId}/{deliveredKwh}` | Update energy delivered so far (used by delivery service) |
| GET | `/GetAllTransactions?status={status}` | List all transactions (optional status filter) |
| GET | `/GetTransactionById/{Id}` | Get a single transaction |
| GET | `/GetTransactionByBuyerId/{buyerId}` | Get all transactions where user is buyer |
| GET | `/GetTransactionBySellerId/{sellerId}` | Get all transactions where user is seller |
| GET | `/GetTransactionByUserId/{userId}` | Get all transactions for a user (buyer or seller) |
| GET | `/GetTransactionByPaymentReference/{paymentReference}` | Look up transaction by payment reference |
| GET | `/GetRequestedKwhInTransactionById/{transactionId}` | Get the kWh quantity requested in a transaction |

**CreateTransaction body:**
```json
{ "requestedKwh": 10.0 }
```

---

#### EnergyLog — `/api/EnergyLog`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/CreateEnergyLog/{transactionId}` | Record a kWh delivery event and trigger delivery service |
| GET | `/GetAllEnergyLogs` | List all energy log entries |
| GET | `/GetEnergyLogById/{Id}` | Get a single log entry |
| GET | `/GetEnergyLogsByTransactionId/{transactionId}` | Get all delivery logs for a transaction |

**CreateEnergyLog body:**
```json
{ "deliveredKwh": 2.5 }
```

---

### Setup — ASP.NET Energy Engine

**Prerequisites:** .NET 8 SDK, SQL Server

1. Navigate to the backend directory:
   ```bash
   cd server/kiloBackend
   ```

2. Create a `.env` file (loaded by DotNetEnv):
   ```
   ConnectionStrings__DefaultConnection=Server=localhost;Database=GridPayDB;User Id=sa;Password=yourpassword;TrustServerCertificate=True;
   ```
   Alternatively, set `ConnectionStrings:DefaultConnection` in `appsettings.json`.

3. Apply database migrations:
   ```bash
   dotnet ef database update
   ```

4. Run the server:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5262` (or the port shown in the console).
   Swagger UI: `http://localhost:5262/swagger`

---

## FastAPI Middleware

> **Written by Setemi Loye**

**Location:** `server/app/`
**Framework:** FastAPI 0.135+
**Database:** MongoDB Atlas (user accounts)
**Authentication:** JWT (HS256, 60-minute tokens)
**Payment Provider:** Interswitch (v3 API)

### Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.135.1 | Web framework |
| uvicorn | 0.41.0 | ASGI server |
| pymongo | 4.16.0 | MongoDB driver |
| httpx | 0.28.1 | Async HTTP client (proxy calls to Energy Engine) |
| python-jose | 3.5.0 | JWT generation & validation |
| bcrypt | 5.0.0 | Password hashing |
| pydantic | 2.12.5 | Request/response validation |
| slowapi | 0.1.9 | Rate limiting |

### Authentication Flow

```
POST /api/auth/register
  → Validate email uniqueness (MongoDB)
  → Hash password (bcrypt)
  → Get next sequential ID (MongoDB counter)
  → Sync user to Energy Engine (POST /api/User/CreateUser)
  → Store user in MongoDB
  → Return { id, email }

POST /api/auth/login
  → Find user by email (MongoDB)
  → Verify password (bcrypt)
  → Issue JWT token (60 min expiry)
  → Return { access_token, token_type, user }

Protected routes: Authorization: Bearer <token>
```

### Payment Flow

```
POST /api/payments/initiate
  → Acquire Interswitch OAuth2 token (cached)
  → Generate transaction reference: KILO-{12-char hex}
  → Sign request with HMAC-SHA512
  → POST to Interswitch /api/v3/purchases
  → Return { transaction_reference, redirect_url, amount, currency }

  [User completes payment on Interswitch page]
  [User is redirected back to CLIENT_URL with transaction reference]

GET /api/payments/verify/{transaction_ref}
  → Verify payment status with Interswitch
  → Return { status, amount, customer details }

POST /api/Transaction/confirmPayment/{listingId}/{transactionId}/{paymentReference}
  → Proxy to Energy Engine ConfirmPayment
  → Locks energy for delivery, starts EnergyDeliveryService

POST /api/payments/webhook  (configured in Interswitch dashboard)
  → Receives async payment notification from Interswitch
  → Verifies payment status
  → Returns 200 (prevents Interswitch retries)
  → Note: Frontend must separately call confirmPayment to complete energy lock
```

### API Endpoints

All routes are prefixed with `/api`.

#### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Login and receive JWT token |
| GET | `/me` | Yes | Get current user profile |

**Register body:**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "confirm_password": "secret123",
  "full_name": "Jane Doe",
  "phone_number": "08012345678",
  "role": "User"
}
```

**Login response:**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": { "id": 1, "email": "user@example.com", "full_name": "Jane Doe", "phone_number": "08012345678" }
}
```

---

#### Payments — `/api/payments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/initiate` | Yes | Initiate an Interswitch payment |
| GET | `/verify/{transaction_ref}` | Yes | Verify payment status |
| POST | `/webhook` | No | Interswitch async payment webhook |

**Initiate body:**
```json
{
  "amount": 100000,
  "currency": "NGN",
  "description": "Purchase 10 kWh from listing #5",
  "customer_name": "Jane Doe",
  "customer_email": "jane@example.com",
  "customer_mobile": "08012345678",
  "redirect_url": "https://yourapp.com/payment/callback"
}
```
> Amount is in kobo. `100000` = ₦1,000.00

---

#### Listing — `/api/Listing`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/getActiveListing?location={loc}` | Browse active listings |
| GET | `/getAllListings?isActive={bool}&location={loc}` | List all listings with filters |
| GET | `/getAvailableLocations` | Get all listing locations |
| GET | `/getListingById/{listingId}` | Get a single listing |
| GET | `/getListingBySellerId/{sellerId}` | Get listings by seller |
| POST | `/createListing/{sellerId}` | Create a new listing |
| POST | `/deleteListing/{listingId}/{sellerId}` | Delete a listing |
| POST | `/updateListing/{listingId}/{sellerId}` | Update listing details |
| POST | `/updateListingActiveStatus/{listingId}/{sellerId}/{isActive}` | Toggle listing on/off |

---

#### Transaction — `/api/Transaction`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/getAllTransactions?status={status}` | List all transactions |
| GET | `/getTransactionById/{transactionId}` | Get a transaction by ID |
| GET | `/getTransactionByBuyerId/{buyerId}` | Get buyer's transactions |
| GET | `/getTransactionBySellerId/{sellerId}` | Get seller's transactions |
| GET | `/getTransactionByUserId/{userId}` | Get all transactions for a user |
| GET | `/getTransactionByPaymentReference/{paymentReference}` | Look up by payment reference |
| GET | `/getRequestedKwh/{transactionId}` | Get requested kWh for a transaction |
| POST | `/createTransaction/{sellerId}/{buyerId}/{listingId}` | Create a transaction |
| POST | `/confirmPayment/{listingId}/{transactionId}/{paymentReference}` | Confirm payment, start delivery |
| POST | `/updateDeliveredKwh/{transactionId}/{deliveredKwh}` | Update delivered kWh |

---

#### EnergyLog — `/api/EnergyLog`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all energy logs |
| POST | `/CreateEnergyLog/{transactionId}` | Record a delivery event |
| GET | `/GetEnergyLogById/{Id}` | Get a single log entry |
| GET | `/GetEnergyLogsByTransactionId/{transactionId}` | Get logs for a transaction |

---

#### Health Check

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Returns `{ "status": "Kilo API is Active!" }` |

---

### Setup — FastAPI

**Prerequisites:** Python 3.11+, MongoDB Atlas account

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate      # macOS/Linux
   venv\Scripts\activate         # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file:
   ```env
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-change-in-production
   JWT_ALGORITHM=HS256
   JWT_EXPIRES_MINUTES=60
   ENERGY_ENGINE_URL=http://localhost:5262
   INTERSWITCH_CLIENT_ID=your-client-id
   INTERSWITCH_SECRET_KEY=your-secret-key
   INTERSWITCH_BASE_URL=https://sandbox.interswitchng.com
   CLIENT_URL=http://localhost:5173
   PORT=8000
   ```

5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.
   Interactive docs: `http://localhost:8000/docs`

---

## Running Both Services

Both services must be running for the platform to function:

```bash
# Terminal 1 — ASP.NET Energy Engine
cd server/kiloBackend
dotnet run

# Terminal 2 — FastAPI Middleware
cd server
source venv/bin/activate
uvicorn app.main:app --reload
```

Set `ENERGY_ENGINE_URL` in the FastAPI `.env` to match the URL shown when `dotnet run` starts (default: `http://localhost:5262`).
