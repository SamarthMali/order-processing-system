# E-commerce Order Processing System

A production-grade backend for an e-commerce order processing system built with **NestJS**, **Prisma ORM**, and **SQLite**. The system supports customer order placement, order lifecycle tracking, role-based access control, and automated background processing.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Background Job (Cron)](#background-job-cron)
- [Audit Logging](#audit-logging)
- [Rate Limiting](#rate-limiting)
- [Standardized Response Format](#standardized-response-format)
- [Input Validation](#input-validation)
- [Setup & Running](#setup--running)
- [Testing](#testing)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | NestJS 11 (TypeScript) | Modular backend framework |
| ORM | Prisma | Type-safe database access, migrations, schema-first design |
| Database | SQLite | zero-config relational database |
| Auth | @nestjs/jwt + bcrypt | JWT token generation/verification, password hashing |
| Validation | class-validator + class-transformer | DTO-based input validation with decorators |
| Scheduling | @nestjs/schedule (cron) | Background job for auto-promoting PENDING orders |
| Rate Limiting | @nestjs/throttler | Global + per-route request throttling |
| API Docs | @nestjs/swagger | Auto-generated OpenAPI documentation |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (HTTP)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   main.ts   │  Global pipes, interceptors, filters
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │      AppModule          │
              │  ┌────────────────────┐ │
              │  │  ThrottlerModule   │ │  Rate limiting (60 req/min global)
              │  │  ScheduleModule    │ │  Cron job scheduling
              │  │  ThrottlerGuard    │ │  APP_GUARD (applied globally)
              │  └────────────────────┘ │
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐     ┌──────▼──────┐   ┌─────▼──────┐
    │AuthModule│    │OrdersModule │   │ProductsModule│
    │         │     │             │   │             │
    │ Guards: │     │ Service     │   │ Service     │
    │ AuthGuard│    │ CronJob     │   │ Controller  │
    │ RolesGuard│   │ AuditService│   └─────────────┘
    │ JWT      │    │ Controller  │
    └────┬─────┘    └──────┬──────┘
         │                 │
    ┌────▼─────┐    ┌──────▼──────┐
    │UsersModule│    │PrismaModule │
    │          │    │             │
    │ Service  │    │ PrismaService│──── SQLite (dev.db)
    │ Controller│   └─────────────┘
    └──────────┘
```

**Request lifecycle:**

1. HTTP request arrives
2. `ThrottlerGuard` checks rate limits
3. `AuthGuard` validates JWT (skipped for `@Public()` routes)
4. `RolesGuard` checks user role against `@Roles()` decorator
5. `ValidationPipe` validates request body/query against DTO
6. Controller delegates to Service
7. Service interacts with Prisma (database)
8. `ResponseInterceptor` wraps response in `{ status, message, data }`
9. If error: `GlobalExceptionFilter` catches and formats error response


## Database Design

### Entity Relationship Diagram

```
┌──────────────┐       ┌───────────────┐       ┌──────────────┐
│     User     │       │     Order     │       │   Product    │
├──────────────┤       ├───────────────┤       ├──────────────┤
│ id       PK  │◄──┐   │ id        PK  │   ┌──►│ id       PK  │
│ email  UQ    │   │   │ status       │   │   │ name         │
│ password     │   ├───│ userId FK│   │   │   | description  │
│ name         │   │   │ createdAt    │   │   │ price        │
│ role         │   │   │ updatedAt    │   │   │ stock        │
│ createdAt    │   │   └───────┬───────┘   │   │ createdAt    │
│ updatedAt    │   │           │           │   │ updatedAt    │
└──────────────┘   │   ┌───────▼───────┐   │   └──────────────┘
                   │   │   OrderItem   │   │
                   │   ├───────────────┤   │
                   │   │ id        PK  │   │
                   │   │ quantity      │   │
                   │   │ price         │   │
                   │   │ orderId   FK  │───┘
                   │   │ productId FK  │───┘
                   │   └───────────────┘
                   │
                   │   ┌───────────────────┐
                   │   │  OrderAuditLog    │
                   │   ├───────────────────┤
                   │   │ id            PK  │
                   │   │ orderId       FK  │──► Order
                   ├───│ modifiedBy    FK  │
                       │ action            │
                       │ oldStatus         │
                       │ newStatus         │
                       │ performedByRole   │
                       │ note              │
                       │ createdAt         │
                       └───────────────────┘
```

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user (returns JWT) |
| POST | `/auth/login` | Public | Login (returns JWT) |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/profile` | Any authenticated user | Get own profile with recent orders |
| GET | `/users` | ADMIN only | List all users (paginated) |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List all products (paginated) |
| GET | `/products/:id` | Public | Get product by ID |
| POST | `/products` | ADMIN only | Create product |
| PATCH | `/products/:id` | ADMIN only | Update product |
| DELETE | `/products/:id` | ADMIN only | Delete product |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Any authenticated user | Create order with multiple items |
| GET | `/orders` | Authenticated | List orders (Admin: all, Customer: own only). Supports `?status=` filter |
| GET | `/orders/:id` | Authenticated | Get order by ID (ownership enforced) |
| PATCH | `/orders/:id/status` | ADMIN only | Update order status (strict state machine) |
| PATCH | `/orders/:id/cancel` | Authenticated | Cancel order (only if PENDING, ownership enforced) |
| GET | `/orders/:id/audit-log` | ADMIN only | Get audit trail for specific order |
| GET | `/orders/audit-logs/all` | ADMIN only | List all audit logs. Supports `?orderId=` and `?action=` filters |

### Utility

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Health check |
| GET | `/api` | Public | Swagger UI |
| GET | `/api-json` | Public | OpenAPI JSON spec |

All list endpoints support pagination via `?page=1&limit=10` query parameters.

---

### Guard Chain

Two guards are registered globally in `AuthModule` as `APP_GUARD`:

1. **AuthGuard** — Runs first on every request. Extracts the JWT from `Authorization: Bearer <token>`, verifies it with `JwtService`, and attaches the decoded payload to `request.user`. Routes decorated with `@Public()` skip this guard entirely.

2. **RolesGuard** — Runs after AuthGuard. Reads the `@Roles()` metadata from the route handler. If no roles are specified, access is granted. Otherwise, it checks that `request.user.role` matches one of the required roles.

### JWT Payload Structure

```json
{
  "sub": 1,
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1711324800,
  "exp": 1711411200
}
```

The token expires in 24 hours (configurable via `AuthModule`).

---

## Order Lifecycle
Orders follow a strict, linear state machine. No state can be skipped, and transitions cannot go backward.

```
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │
              ┌────────────┤
              │            │
              ▼            ▼
      ┌──────────────┐   ┌──────────────┐
      │  CANCELLED   │   │  PROCESSING  │
      └──────────────┘   └──────┬───────┘
                                │
                                ▼
                        ┌──────────────┐
                        │   SHIPPED    │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  DELIVERED   │
                        └──────────────┘
```

### Transition Rules

| From | To | Who | Notes |
|---|---|---|---|
| PENDING | PROCESSING | Admin or Cron Job | Manual or automatic (every 5 min) |
| PENDING | CANCELLED | Customer (own) or Admin (any) | Only from PENDING |
| PROCESSING | SHIPPED | Admin only | Manual transition |
| SHIPPED | DELIVERED | Admin only | Terminal state |

### Order Creation Flow

1. Validate all product IDs exist
2. Check stock availability for each item
3. Execute within a **database transaction**:
   - Decrement stock for each product (`stock: { decrement: quantity }`)
   - Create order with nested order items (price snapshot from product)
4. Log `ORDER_CREATED` audit event

---

## Background Job (Cron)

A scheduled job runs every 5 minutes to automatically promote all `PENDING` orders to `PROCESSING`:

```typescript
// src/orders/orders.cron.ts
@Cron(CronExpression.EVERY_5_MINUTES)
async handlePendingOrders() {
  const count = await this.ordersService.promotePendingToProcessing();
}
```

**How it works:**

1. Queries all orders with `status = PENDING`
2. Batch-updates them to `PROCESSING` via `updateMany`
3. Creates `CRON_STATUS_UPDATE` audit log entries for each affected order
4. Logs the count to the server console

The cron is registered via `@nestjs/schedule`'s `ScheduleModule.forRoot()` in the root `AppModule`.

---

## Audit Logging

Every mutation on an order generates an immutable audit log entry in the `OrderAuditLog` table.

### Tracked Events

| Action | Trigger | Performer |
|---|---|---|
| `ORDER_CREATED` | Customer places an order | CUSTOMER |
| `STATUS_UPDATED` | Admin manually changes status | ADMIN |
| `ORDER_CANCELLED` | Customer/Admin cancels order | CUSTOMER or ADMIN |
| `CRON_STATUS_UPDATE` | Background job promotes PENDING | SYSTEM |

### Audit Log Entry Structure

```json
{
  "id": 1,
  "orderId": 5,
  "action": "STATUS_UPDATED",
  "oldStatus": "PENDING",
  "newStatus": "PROCESSING",
  "performedById": 1,
  "performedByRole": "ADMIN",
  "note": null,
  "createdAt": "2026-03-24T18:30:00.000Z"
}
```

### API Access

- `GET /orders/:id/audit-log` — Paginated audit trail for a specific order (Admin only)
- `GET /orders/audit-logs/all` — All audit logs with optional filters for `orderId` and `action` (Admin only)

---

## Rate Limiting

Rate limiting is implemented using `@nestjs/throttler` to prevent abuse.

### Configuration

| Scope | Limit | Time Window | Applied To |
|---|---|---|---|
| Global | 60 requests | 60 seconds | All endpoints |
| Auth routes | 10 requests | 60 seconds | `/auth/login`, `/auth/register` |

## Standardized Response Format

Every API response follows a uniform envelope structure, implemented via global interceptor and exception filter.

### Success Response

```json
{
  "status": 200,
  "message": "Success",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": 404,
  "message": "Order #999 not found",
  "data": []
}
```

### Implementation

- **`ResponseInterceptor`** (global) — Wraps all successful controller returns into `{ status, message, data }`
- **`GlobalExceptionFilter`** (global) — Catches all exceptions (HttpException or unknown) and formats them consistently. Validation errors from `class-validator` are joined into a single message string.

---

## Input Validation

All incoming request bodies and query parameters are validated using `class-validator` decorators on DTOs.

### Global ValidationPipe Configuration

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Strip unknown properties
  forbidNonWhitelisted: true,   // Reject requests with unknown properties
  transform: true,              // Auto-transform query strings to typed values
}));
```

## Setup & Running

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd order-processing

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-key-change-in-production"
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start with hot-reload (development) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Start compiled production build |
| `npx prisma studio` | Open database GUI in browser |
| `npx prisma migrate dev` | Apply pending migrations |
| `npx prisma generate` | Regenerate Prisma client types |

### Accessing the Application

- **API Server**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Swagger JSON**: http://localhost:3000/api-json
- **Prisma Studio**: http://localhost:5555 (after running `npx prisma studio`)

---

## Testing

Two bash test scripts are included that validate every feature through HTTP requests.

### Quick Run

```bash
# Make sure the server is running first
npm run start:dev

# Run the assignment-focused test suite (recommended for demo)
bash test-assignment.sh

# Run the full API test suite
bash test-api.sh
```

### Test Coverage

**`test-assignment.sh`** — 68 tests organized by assignment requirements:

| Section | Tests | What it validates |
|---|---|---|
| JWT Auth & Registration | 10 | Register, login, duplicate rejection, validation, wrong password |
| Product Catalog (RBAC) | 7 | Admin CRUD, customer blocked, public read |
| **Core 1: Create Order** | 6 | Multi-item order, validation (empty, bad product, unauth) |
| **Core 2: Retrieve Order** | 4 | Fetch by ID, ownership isolation, admin access, 404 |
| **Core 3: Update Status** | 8 | Full lifecycle, skip/backward blocked, admin-only |
| **Core 4: List Orders** | 5 | Admin/customer scoping, status filter |
| **Core 5: Cancel Order** | 5 | PENDING-only, ownership, double-cancel, admin override |
| User Management | 4 | Profile, listing, RBAC |
| Audit Logging | 7 | Lifecycle trail, cancel event, filters, RBAC |
| Pagination | 6 | Meta fields, page 2, limit validation |
| Rate Limiting | 2 | 429 enforcement, X-RateLimit headers |
| Response Format | 2 | Envelope structure on success/error |
| Swagger | 1 | OpenAPI spec accessible |
| Product Lifecycle | 4 | Create, update, delete, 404 after delete |

---

## API Documentation (Swagger)

Interactive API documentation is auto-generated from controller decorators and DTOs.

- **Swagger UI**: http://localhost:3000/api
- All endpoints are documented with request/response schemas
- JWT authentication can be tested directly via the "Authorize" button
- DTOs are reflected as request body schemas

---

## Design Decisions & Trade-offs

### Why NestJS?

NestJS provides a mature, opinionated architecture with built-in support for dependency injection, modular organization, and a rich ecosystem of official packages (JWT, scheduling, throttling, Swagger). This aligns well with enterprise-grade backend requirements.

### Why Prisma + SQLite?

- **Prisma** provides type-safe database access, automatic migration management, and a schema-first approach that serves as living documentation.
- **SQLite** was chosen for zero-config deployment — no external database server needed. The architecture is database-agnostic; switching to PostgreSQL requires only changing the `provider` in `schema.prisma` and the connection string.
- **Prisma** with the `@prisma/adapter-better-sqlite3` driver adapter was used for native SQLite support.
---

### What Was Done Extra (Beyond Assignment)

The assignment required only basic order CRUD. The following were implemented as additional features:

- JWT authentication with bcrypt password hashing
- Role-Based Access Control (ADMIN / CUSTOMER) with custom decorators
- Product catalog with full CRUD and stock management
- User management with profiles
- Order audit logging with immutable trail
- Server-side pagination on all list endpoints
- Rate limiting (global + per-route)
- Standardized response envelope `{ status, message, data }`
- Input validation with detailed error messages
- Swagger/OpenAPI auto-generated documentation

---
