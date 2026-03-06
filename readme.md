# Scalable Event Ticket Booking System

A production-style backend system for event ticket booking built using **Node.js, Express, PostgreSQL, and Redis**.  
The system is designed to handle **high-concurrency seat booking scenarios** using **distributed locking, caching, and database constraints**.

---

# 🚀 Features

- Event creation and listing APIs
- Seat booking with concurrency control
- Redis distributed locking to prevent race conditions
- PostgreSQL composite constraints to avoid duplicate bookings
- Booking confirmation workflow
- Automatic booking expiration using background jobs
- Redis caching for high-performance event queries
- API rate limiting for abuse prevention
- JWT authentication and secure password hashing
- Dockerized deployment with PostgreSQL and Redis
- Cloud deployment on AWS EC2

---

# 🏗 System Architecture

```
User
 ↓
Load Balancer
 ↓
Node.js API Server
 ↓
Redis (Caching + Distributed Locks)
 ↓
PostgreSQL Database
 ↓
Background Workers (Cron Jobs)
```

---

# ⚡ Key Backend Concepts Implemented

### Concurrency Control

Prevented double booking using:

- Redis distributed locks (`SETNX`)
- PostgreSQL composite unique constraint `(eventId, seatNumber)`

### Caching Layer

Redis is used to cache frequently accessed event data to reduce database load.

### Booking Expiry Worker

Background job automatically expires pending bookings after timeout.

### API Security

Implemented:

- JWT Authentication
- Bcrypt password hashing
- API rate limiting

---

# 🛠 Tech Stack

| Technology | Usage |
|--------|--------|
Node.js | Backend runtime |
Express.js | REST API framework |
PostgreSQL | Primary database |
Redis | Caching and distributed locking |
Prisma ORM | Database ORM |
Docker | Containerized deployment |
AWS EC2 | Cloud hosting |

---

# 📡 API Endpoints

### Authentication

```
POST /auth/register
POST /auth/login
```

### Events

```
GET /events
GET /events?location=mumbai
GET /events?price=500
```

### Booking

```
POST /bookings/:eventId
POST /bookings/:bookingId/confirm
```

---

# 🔒 Booking Flow

```
User selects seat
 ↓
Redis lock seat
 ↓
Validate seat availability
 ↓
Create booking (PENDING)
 ↓
User confirms booking
 ↓
Booking status → CONFIRMED
```

Expired bookings automatically release seats.

---

# 🐳 Docker Setup

Run the entire system with:

```
docker-compose up --build
```

Services started:

- Backend API
- PostgreSQL database
- Redis cache

---

# ☁ AWS Deployment

Application deployed on **AWS EC2** using Docker containers.

Deployment flow:

```
GitHub → EC2 Instance → Docker Compose → Live API
```

---

# 📈 Scalability Considerations

System designed for high traffic using:

- Redis caching
- Distributed locking
- Database indexing
- Rate limiting
- Background workers

---

# 🎯 Future Improvements

- Payment integration
- Message queue for booking processing
- Horizontal scaling using Kubernetes
- Event analytics dashboard

---

# 👨‍💻 Author

Backend Developer Project showcasing **high-concurrency system design and scalable API architecture**.