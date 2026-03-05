# 🎟️ Real-Time Ticket Booking API

> **A battle-tested, production-ready REST API** for high-concurrency ticket booking — with JWT auth, seat locking, and async background expiry workers.

---

## ⚡ System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT  (Web / Mobile / Postman)                   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │  HTTP Request
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXPRESS.JS SERVER  :5000                         │
│                                                                             │
│   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   Routes    │───▶│  Middleware  │───▶│  Controllers │                  │
│   │  /auth      │    │  JWT Verify  │    │  Auth        │                  │
│   │  /events    │    │  Error       │    │  Events      │                  │
│   │  /bookings  │    │  Handler     │    │  Bookings    │                  │
│   └─────────────┘    └──────────────┘    └──────┬───────┘                  │
│                                                  │                          │
│                                                  ▼                          │
│                                         ┌────────────────┐                 │
│                                         │    Services    │                 │
│                                         │  (Business     │                 │
│                                         │   Logic Layer) │                 │
│                                         └───────┬────────┘                 │
└─────────────────────────────────────────────────┼────────────────────────--┘
                                                  │
                    ┌─────────────────────────────┴──────────────────────┐
                    │                                                     │
                    ▼                                                     ▼
┌───────────────────────────────┐               ┌────────────────────────────┐
│         PRISMA ORM            │               │           REDIS             │
│                               │               │                            │
│  ┌─────────────────────────┐  │               │  ┌──────────────────────┐  │
│  │   PostgreSQL Database   │  │               │  │  Cache / Queue Layer │  │
│  │                         │  │               │  │                      │  │
│  │  ┌──────────────────┐   │  │               │  │  • Session Tokens    │  │
│  │  │  Users           │   │  │               │  │  • Rate Limiting     │  │
│  │  │  id, name, email │   │  │               │  │  • Fast Lookups      │  │
│  │  └──────────────────┘   │  │               │  └──────────────────────┘  │
│  │  ┌──────────────────┐   │  │               └────────────────────────────┘
│  │  │  Events          │   │  │
│  │  │  id, title, date │   │  │
│  │  │  totalSeats      │   │  │
│  │  └──────────────────┘   │  │
│  │  ┌──────────────────┐   │  │
│  │  │  Bookings        │   │  │
│  │  │  id, seatNumber  │   │  │
│  │  │  status, expiry  │   │  │
│  │  └──────────────────┘   │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

---

## 🔄 Booking Lifecycle

```
 User hits POST /bookings/:eventId
         │
         ▼
┌────────────────────┐
│  JWT Verified?     │──── NO ──▶  401 Unauthorized
└────────┬───────────┘
         │ YES
         ▼
┌────────────────────┐
│  Seat Available?   │──── NO ──▶  409 Conflict (Seat Taken)
└────────┬───────────┘
         │ YES
         ▼
┌──────────────────────────────┐
│  Create Booking              │
│  status   = PENDING          │
│  expiresAt = now() + 5 mins  │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                    TIMER STARTS ⏳                        │
│                                                         │
│   t = 0 ──────────────────────────────────── t = 5 min  │
│   [PENDING]                                 [EXPIRED?]  │
│                                                         │
│         User confirms?                                  │
│              │                                          │
│         ┌────┴────┐                                     │
│         │   YES   │                                     │
│         ▼         │                                     │
│   [CONFIRMED] ✅  │                                     │
│                   ▼                                     │
│             Cron Job fires                              │
│             → status = EXPIRED ❌                       │
│             → Seat freed for others                     │
└─────────────────────────────────────────────────────────┘
```

---

## ⏰ Background Cron Job Flow

```
  Every 60 seconds...
         │
         ▼
  node-cron triggers bookingExpiry.job.ts
         │
         ▼
  ┌──────────────────────────────────────────┐
  │  SELECT * FROM Bookings                  │
  │  WHERE status = 'PENDING'                │
  │  AND expiresAt < NOW()                   │
  └──────────────────┬───────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
     Found?                  Not Found?
          │                     │
          ▼                     ▼
  UPDATE status            Sleep until
  SET 'EXPIRED'            next tick ⏾
  Seat unlocked 🔓
```

---

## 🛣️ API Reference

### Auth — `/auth`

| Method | Endpoint         | Description              | Auth |
|--------|------------------|--------------------------|------|
| `POST` | `/auth/register` | Register a new user      | ❌   |
| `POST` | `/auth/login`    | Login → receive JWT      | ❌   |

```jsonc
// POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// POST /auth/login  →  Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

---

### Events — `/events`

| Method | Endpoint   | Description              | Auth |
|--------|------------|--------------------------|------|
| `GET`  | `/events`  | List events (paginated)  | ❌   |
| `POST` | `/events`  | Create a new event       | ❌   |

```jsonc
// POST /events
{
  "title": "Rock Concert 2026",
  "description": "Live music night",
  "location": "Stadium Arena",
  "eventDate": "2026-04-01T18:00:00.000Z",
  "price": 50.00,
  "totalSeats": 100
}

// GET /events?page=1&limit=10
```

---

### Bookings — `/bookings`

| Method | Endpoint                       | Description              | Auth |
|--------|--------------------------------|--------------------------|------|
| `POST` | `/bookings/:eventId`           | Reserve a seat (5 min)   | ✅   |
| `POST` | `/bookings/:bookingId/confirm` | Confirm the booking      | ✅   |

```jsonc
// POST /bookings/:eventId
// Header: Authorization: Bearer <token>
{
  "seatNumber": 42
}
```

---

### Health Checks

| Method | Endpoint    | Description            |
|--------|-------------|------------------------|
| `GET`  | `/health`   | API status check       |
| `GET`  | `/db-check` | Database connectivity  |

---

## 🛠️ Tech Stack

| Layer        | Technology   | Purpose                            |
|--------------|--------------|------------------------------------|
| Runtime      | Node.js      | JavaScript execution environment   |
| Language     | TypeScript   | Type safety and DX                 |
| Framework    | Express.js   | HTTP server and routing            |
| ORM          | Prisma       | Type-safe database access          |
| Database     | PostgreSQL   | Persistent relational storage      |
| Cache        | Redis        | In-memory caching and queuing      |
| Scheduler    | node-cron    | Background booking expiry jobs     |
| Auth         | JWT + bcrypt | Secure token auth + password hash  |

---

## 📁 Project Structure

```
ticket-booking-api/
│
├── prisma/
│   ├── migrations/              # Auto-generated migration history
│   └── schema.prisma            # Source of truth for DB schema
│
├── src/
│   ├── config/
│   │   ├── db.ts                # Prisma client singleton
│   │   └── redis.ts             # Redis connection setup
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts   # Register / Login handlers
│   │   ├── event.controller.ts  # Event CRUD handlers
│   │   └── booking.controller.ts# Seat booking handlers
│   │
│   ├── jobs/
│   │   └── bookingExpiry.job.ts # Cron: expire stale PENDING bookings
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   └── error.middleware.ts  # Global error handler
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   └── booking.routes.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts      # Business logic: auth
│   │   ├── event.service.ts     # Business logic: events
│   │   └── booking.service.ts   # Business logic: booking + locking
│   │
│   ├── types/
│   │   └── express.d.ts         # Augmented Express Request type
│   │
│   └── server.ts                # App entrypoint — wires everything together
│
├── .env                         # Secret config (never commit!)
├── package.json
└── tsconfig.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js `v16+`
- PostgreSQL (running locally or remote)
- Redis (running on `localhost:6379`)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/ticket_booking?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev
```

### 4. Start Development Server

```bash
npm run dev
```

> Server starts at `http://localhost:5000` with hot-reloading via `ts-node-dev`.

---

## 🔐 Concurrency & Safety

```
Two users attempt to book Seat #42 simultaneously:

  User A ──────────────────────────────▶ INSERT Booking (seatNumber=42)  ✅ SUCCESS
  User B ──────────────────────────────▶ INSERT Booking (seatNumber=42)  ❌ UNIQUE CONSTRAINT VIOLATION
                                                                              │
                                                                              ▼
                                                                       409 Conflict returned
                                                                       "Seat already booked"
```

PostgreSQL's **unique constraint on `(eventId, seatNumber)`** acts as the last line of defense — no two bookings can ever reference the same seat in the same event, even under race conditions.

---

## ⏳ Background Expiry Worker

Located at `src/jobs/bookingExpiry.job.ts` — runs **every 60 seconds**:

1. Queries all `PENDING` bookings where `expiresAt < NOW()`
2. Batch-updates their status to `EXPIRED`
3. Freed seats become instantly available for new bookings

This prevents phantom seat locks from abandoned sessions clogging the system.

---

> Built with TypeScript · Prisma · PostgreSQL · Redis · node-cron