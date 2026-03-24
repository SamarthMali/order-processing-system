# E-Commerce Order Processing System

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Database Design](#4-database-design)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Endpoints](#6-api-endpoints)
7. [Order Lifecycle & Status Machine](#7-order-lifecycle--status-machine)
8. [Audit Logging](#8-audit-logging)
9. [Background Jobs](#9-background-jobs)
10. [Standardized Response Format](#10-standardized-response-format)
11. [Validation Strategy](#11-validation-strategy)
12. [Project Structure](#12-project-structure)
13. [Setup & Running](#13-setup--running)
14. [Testing](#14-testing)
15. [Design Decisions & Trade-offs](#15-design-decisions--trade-offs)

---

## 1. Overview

A production-ready backend system for an e-commerce order processing platform. Customers can browse products, place orders with multiple items, and track their order status. Admins manage products, oversee all orders, and control the order lifecycle. Every order state change is recorded in an immutable audit log for traceability.

### Key Capabilities

- JWT-based authentication with role-based access control (ADMIN / CUSTOMER)
- Full product catalog management (CRUD)
- Multi-item order placement with real-time stock validation and atomic inventory decrement
- Strict order status state machine: PENDING -> PROCESSING -> SHIPPED -> DELIVERED
- Order cancellation with ownership enforcement
- Immutable audit trail for every order event
- Automated background job (cron) to promote stale PENDING orders
- Standardized API response envelope across all endpoints
- Interactive API documentation via Swagger

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | NestJS 11 (TypeScript) | Modular architecture, dependency injection, decorator-based routing, first-class TypeScript support |
| **ORM** | Prisma 7 | Type-safe database access, declarative schema, automatic migrations, excellent DX |
| **Database** | SQLite (via better-sqlite3) | Zero-config file-based DB, ideal for development and take-home assignments; easily swappable to PostgreSQL/MySQL in production |
| **Auth** | @nestjs/jwt + bcrypt | Industry-standard JWT tokens for stateless auth; bcrypt with salt rounds for secure password hashing |
| **Validation** | class-validator + class-transformer | Declarative DTO validation with decorators; automatic request body transformation |
| **Scheduling** | @nestjs/schedule (cron) | Declarative cron jobs integrated into the NestJS lifecycle |
| **API Docs** | @nestjs/swagger | Auto-generated OpenAPI spec from decorators; interactive Swagger UI |

---

## 3. Architecture

### High-Level Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │                   Client                     │
                    │          (Postman / Frontend / curl)          │
                    └──────────────────┬───────────────────────────┘
                                       │ HTTP/REST
                    ┌──────────────────▼───────────────────────────┐
                    │              NestJS Application               │
                    │                                               │
                    │  ┌─────────────────────────────────────────┐  │
                    │  │         Global Middleware Layer          │  │
                    │  │  ValidationPipe │ ResponseInterceptor    │  │
                    │  │  GlobalExceptionFilter │ AuthGuard       │  │
                    │  │  RolesGuard                              │  │
                    │  └─────────────────────────────────────────┘  │
                    │                                               │
                    │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
                    │  │   Auth   │ │  Users   │ │   Products   │  │
                    │  │  Module  │ │  Module  │ │    Module    │  │
                    │  └──────────┘ └──────────┘ └──────────────┘  │
                    │                                               │
                    │  ┌────────────────────────────────────────┐   │
                    │  │            Orders Module               │   │
                    │  │  Controller │ Service │ AuditService   │   │
                    │  │  CronJob                               │   │
                    │  └────────────────────────────────────────┘   │
                    │                                               │
                    │  ┌────────────────────────────────────────┐   │
                    │  │          Prisma Module (Global)        │   │
                    │  │       PrismaService → PrismaClient     │   │
                    │  └──────────────────┬─────────────────────┘   │
                    └─────────────────────┼────────────────────────┘
                                          │
                    ┌─────────────────────▼────────────────────────┐
                    │              SQLite Database                  │
                    │   User │ Product │ Order │ OrderItem         │
                    │   OrderAuditLog                              │
                    └──────────────────────────────────────────────┘
```

### Request Lifecycle

```
  Request
    │
    ▼
  ValidationPipe          ← Validates & transforms DTO
    │
    ▼
  AuthGuard (Global)      ← Extracts & verifies JWT (skipped for @Public routes)
    │
    ▼
  RolesGuard (Global)     ← Checks user role against @Roles() metadata
    │
    ▼
  Controller              ← Route handler, extracts params
    │
    ▼
  Service                 ← Business logic, DB operations via Prisma
    │
    ▼
  ResponseInterceptor     ← Wraps result in { status, message, data }
    │
    ▼
  Response (JSON)
```

On errors at any stage, the `GlobalExceptionFilter` catches the exception and returns the standardized `{ status, message, data: [] }` envelope.

### Module Dependency Graph

```
  AppModule
    ├── PrismaModule (Global) ─── Exported to all modules
    ├── ScheduleModule.forRoot()
    ├── AuthModule
    │     ├── imports: UsersModule, JwtModule (Global)
    │     ├── provides: AuthGuard (APP_GUARD), RolesGuard (APP_GUARD)
    │     └── exports: AuthService
    ├── UsersModule
    │     └── exports: UsersService
    ├── ProductsModule
    └── OrdersModule
          └── provides: OrdersService, OrderAuditService, OrdersCron
```

---

## 4. Database Design

### Entity-Relationship Diagram

```
  ┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
  │     User     │       │      Order       │       │   Product    │
  ├──────────────┤       ├──────────────────┤       ├──────────────┤
  │ id       PK  │◄──┐   │ id          PK   │   ┌──►│ id       PK  │
  │ email   UNQ  │   │   │ status      ENUM │   │   │ name         │
  │ password     │   │   │ customerId  FK ──┼───┘   │ description  │
  │ name         │   │   │ createdAt        │       │ price        │
  │ role    ENUM │   │   │ updatedAt        │       │ stock        │
  │ createdAt    │   │   └────────┬─────────┘       │ createdAt    │
  │ updatedAt    │   │            │ 1:N              │ updatedAt    │
  └──────────────┘   │   ┌───────▼─────────┐        └──────────────┘
         │           │   │   OrderItem     │               │
         │           │   ├─────────────────┤               │
         │           │   │ id          PK  │               │
         │           │   │ quantity        │               │
         │           │   │ price (snapshot)│               │
         │           │   │ orderId    FK ──┼── Order       │
         │           │   │ productId  FK ──┼───────────────┘
         │           │   └─────────────────┘
         │           │
         │  1:N      │  1:N
         │           │
  ┌──────▼───────────▼──────┐
  │    OrderAuditLog        │
  ├─────────────────────────┤
  │ id              PK      │
  │ orderId         FK ── Order
  │ action          STRING  │  (ORDER_CREATED, STATUS_UPDATED,
  │ oldStatus       STRING? │   ORDER_CANCELLED, CRON_STATUS_UPDATE)
  │ newStatus       STRING  │
  │ performedById   FK? ── User (null for SYSTEM/cron)
  │ performedByRole STRING? │  (ADMIN, CUSTOMER, SYSTEM)
  │ note            STRING? │
  │ createdAt       DATETIME│
  └─────────────────────────┘
```

### Models

#### User
Stores authenticated users with hashed passwords. The `role` enum (`ADMIN` | `CUSTOMER`) drives RBAC across the API.

#### Product
Catalog items with real-time `stock` tracking. Stock is atomically decremented within a database transaction when orders are placed.

#### Order
Represents a customer's purchase. The `status` field follows a strict state machine (see Section 7). The `customerId` FK ties every order to its owner for ownership-based access control.

#### OrderItem
Join table between Order and Product. The `price` field is a **snapshot** of the product price at the time of purchase, ensuring historical accuracy even if the product price later changes.

#### OrderAuditLog
Immutable append-only log of every order lifecycle event. The nullable `performedById` field accommodates system-initiated events (cron jobs) where no human actor exists.

### Indexes

Strategic indexes are placed for query performance:

| Table | Indexed Columns | Reason |
|-------|----------------|--------|
| User | `email` | Login lookups |
| User | `role` | Admin user listing |
| Product | `name` | Product search |
| Order | `customerId` | "My orders" queries |
| Order | `status` | Status filter + cron batch update |
| OrderItem | `orderId` | Order detail loading |
| OrderItem | `productId` | Product usage lookups |
| OrderAuditLog | `orderId` | Per-order audit trail |
| OrderAuditLog | `action` | Filter by event type |
| OrderAuditLog | `createdAt` | Chronological sorting |

---

## 5. Authentication & Authorization

### Authentication Flow

```
  ┌──────────┐    POST /auth/register    ┌─────────────┐
  │  Client  │ ─────────────────────────►│ AuthService  │
  │          │    { email, password,      │             │
  │          │      name }                │  ┌─────────┤
  │          │                            │  │ bcrypt  │ ← Hash password (10 rounds)
  │          │                            │  │ hash()  │
  │          │                            │  └─────────┤
  │          │◄───────────────────────────│  Return    │
  │          │    { user, access_token }  │  JWT token │
  └──────────┘                            └─────────────┘

  ┌──────────┐    POST /auth/login        ┌─────────────┐
  │  Client  │ ─────────────────────────►│ AuthService  │
  │          │    { email, password }      │             │
  │          │                            │  ┌─────────┤
  │          │                            │  │ bcrypt  │ ← Compare password
  │          │                            │  │compare()│
  │          │                            │  └─────────┤
  │          │◄───────────────────────────│  Return    │
  │          │    { access_token }        │  JWT token │
  └──────────┘                            └─────────────┘
```

### JWT Token Payload

```json
{
  "sub": 1,
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1711324800,
  "exp": 1711411200
}
```

Tokens expire after 24 hours. The `sub` (subject) field is the user ID, and `role` is embedded directly in the token to avoid an extra database lookup on every request.

### Authorization: Two-Layer Guard System

**Layer 1 — AuthGuard (Global)**
- Runs on every request unless the route is decorated with `@Public()`
- Extracts the Bearer token from the `Authorization` header
- Verifies the JWT signature and expiry via `JwtService.verifyAsync()`
- Attaches the decoded payload to `request.user`

**Layer 2 — RolesGuard (Global)**
- Reads `@Roles(Role.ADMIN)` metadata from the route handler via `Reflector`
- If no roles are specified, the route is open to any authenticated user
- If roles are specified, checks `request.user.role` against the required roles
- Returns 403 Forbidden if the role doesn't match

### Access Control Matrix

| Resource | ADMIN | CUSTOMER | Public |
|----------|-------|----------|--------|
| Register / Login | - | - | Yes |
| List all users | Yes | No (403) | No (401) |
| View own profile | Yes | Yes | No (401) |
| Create product | Yes | No (403) | No (401) |
| Update/Delete product | Yes | No (403) | No (401) |
| View products | Yes | Yes | Yes |
| Create order | Yes | Yes | No (401) |
| View own orders | Yes | Yes (own only) | No (401) |
| View any order | Yes | No (403) | No (401) |
| Update order status | Yes | No (403) | No (401) |
| Cancel own order | Yes (any) | Yes (own PENDING) | No (401) |
| View audit logs | Yes | No (403) | No (401) |

---

## 6. API Endpoints

### Auth (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register a new customer account |
| POST | `/auth/login` | Public | Login and receive JWT token |

### Users (`/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | Bearer | Get current user's profile with recent orders |
| GET | `/users` | Admin | List all registered users |

### Products (`/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | Public | List all products |
| GET | `/products/:id` | Public | Get product details by ID |
| POST | `/products` | Admin | Create a new product |
| PATCH | `/products/:id` | Admin | Update a product |
| DELETE | `/products/:id` | Admin | Delete a product |

### Orders (`/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | Bearer | Place an order with multiple items |
| GET | `/orders` | Bearer | List orders (Admin: all, Customer: own only) |
| GET | `/orders/:id` | Bearer | Get order details (ownership enforced) |
| PATCH | `/orders/:id/status` | Admin | Update order status (strict transitions) |
| PATCH | `/orders/:id/cancel` | Bearer | Cancel a PENDING order (ownership enforced) |
| GET | `/orders/:id/audit-log` | Admin | Get audit trail for a specific order |
| GET | `/orders/audit-logs/all` | Admin | List all audit logs (filterable by orderId, action) |

### Swagger UI

Interactive API documentation is available at `http://localhost:3000/api` with "Try it out" functionality and JWT Bearer auth support.

---

## 7. Order Lifecycle & Status Machine

### State Machine

```
                       ┌────────────────┐
                       │    PENDING     │ ← Initial state on order creation
                       └───────┬────────┘
                               │
              ┌────────────────┼────────────────┐
              │ (auto: cron    │ (manual:       │
              │  every 5 min)  │  customer/admin)│
              ▼                ▼                 │
     ┌────────────────┐  ┌──────────┐           │
     │  PROCESSING    │  │CANCELLED │           │
     └───────┬────────┘  └──────────┘           │
             │                                   │
             │ (admin only)                      │
             ▼                                   │
     ┌────────────────┐                          │
     │    SHIPPED     │                          │
     └───────┬────────┘                          │
             │                                   │
             │ (admin only)                      │
             ▼                                   │
     ┌────────────────┐                          │
     │   DELIVERED    │ ← Terminal state         │
     └────────────────┘                          │
```

### Transition Rules

| From | To | Who | Condition |
|------|----|-----|-----------|
| PENDING | PROCESSING | Admin / Cron | Next valid step |
| PROCESSING | SHIPPED | Admin | Next valid step |
| SHIPPED | DELIVERED | Admin | Next valid step |
| PENDING | CANCELLED | Customer (own) / Admin (any) | Only from PENDING |

### Enforcement

Status transitions are enforced by an ordered array in `OrdersService`:

```typescript
const STATUS_FLOW = [PENDING, PROCESSING, SHIPPED, DELIVERED];
```

The service checks that the target status index is exactly `currentIndex + 1`, preventing skips and backward transitions. Cancelled orders are terminal and reject all further updates.

---

## 8. Audit Logging

Every order mutation is recorded in the `OrderAuditLog` table. This provides a complete, immutable history of who did what and when.

### Tracked Events

| Action | Trigger | Actor |
|--------|---------|-------|
| `ORDER_CREATED` | Customer places order | Customer userId |
| `STATUS_UPDATED` | Admin advances status | Admin userId |
| `ORDER_CANCELLED` | Customer/Admin cancels | Actor userId |
| `CRON_STATUS_UPDATE` | Cron promotes PENDING -> PROCESSING | `null` (SYSTEM) |

### Example Audit Trail

```json
[
  { "action": "ORDER_CREATED",    "oldStatus": null,         "newStatus": "PENDING",    "performedByRole": "CUSTOMER" },
  { "action": "STATUS_UPDATED",   "oldStatus": "PENDING",    "newStatus": "PROCESSING", "performedByRole": "ADMIN"    },
  { "action": "STATUS_UPDATED",   "oldStatus": "PROCESSING", "newStatus": "SHIPPED",    "performedByRole": "ADMIN"    },
  { "action": "STATUS_UPDATED",   "oldStatus": "SHIPPED",    "newStatus": "DELIVERED",  "performedByRole": "ADMIN"    }
]
```

### Implementation Approach

The `OrderAuditService` is injected into `OrdersService`. After each successful mutation (create, updateStatus, cancel, promotePending), an audit entry is asynchronously written. For the cron job, which uses `updateMany`, the affected order IDs are queried first, then a bulk `createMany` inserts all audit rows in a single query.

---

## 9. Background Jobs

### Cron: Auto-Promote PENDING Orders

**Schedule:** Every 5 minutes (`@Cron(CronExpression.EVERY_5_MINUTES)`)

**Logic:**
1. Query all orders with `status = PENDING` (captures their IDs)
2. Batch update all to `PROCESSING` via `updateMany`
3. Bulk-insert `CRON_STATUS_UPDATE` audit log entries for each affected order
4. Log the count of promoted orders

**Why:** Simulates real-world behavior where unprocessed orders are automatically queued for fulfillment after a grace period.

---

## 10. Standardized Response Format

Every API response (success and error) follows the same envelope:

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
  "status": 400,
  "message": "Only PENDING orders can be cancelled. Current status: PROCESSING",
  "data": []
}
```

### Implementation

- **ResponseInterceptor** (global): Wraps all successful controller returns in the `{ status, message, data }` envelope. The HTTP status code is read from the response object, and a default message is assigned based on the code.
- **GlobalExceptionFilter** (global): Catches all exceptions (HttpException and unexpected errors), extracts a human-readable message, and returns the same envelope shape with `data: []`.

This ensures frontend consumers can always rely on a single response parsing contract regardless of the endpoint or outcome.

---

## 11. Validation Strategy

### DTO Validation with class-validator

All incoming request bodies are validated using DTOs decorated with `class-validator` rules:

```
  CreateOrderDto
  ├── items: CreateOrderItemDto[]
  │     ├── @IsInt() @Min(1) productId
  │     └── @IsInt() @Min(1) quantity
  │
  └── @IsArray() @ArrayMinSize(1) ← At least one item required
      @ValidateNested({ each: true })
      @Type(() => CreateOrderItemDto)
```

### Global ValidationPipe Configuration

```typescript
new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  forbidNonWhitelisted: true, // Reject requests with unknown properties
  transform: true,           // Auto-transform payloads to DTO instances
})
```

### Business Validation (Service Layer)

Beyond DTO validation, the service layer enforces:
- Product existence verification before order creation
- Stock availability checks with clear error messages
- Status transition rules (no skips, no backward moves)
- Ownership verification (customers can only access their own data)
- Duplicate email prevention on registration

---

## 12. Project Structure

```
src/
├── main.ts                          # Bootstrap, global pipes/interceptors/filters, Swagger
├── app.module.ts                    # Root module, imports all feature modules
├── app.controller.ts                # Health check endpoint
├── app.service.ts                   # Health check service
│
├── common/                          # Shared utilities
│   ├── api-response.interface.ts    # { status, message, data } type definition
│   ├── interceptors/
│   │   └── response.interceptor.ts  # Wraps success responses
│   └── filters/
│       └── http-exception.filter.ts # Wraps error responses
│
├── prisma/                          # Database layer
│   ├── prisma.module.ts             # Global module exporting PrismaService
│   └── prisma.service.ts            # PrismaClient wrapper with SQLite adapter
│
├── auth/                            # Authentication & authorization
│   ├── auth.module.ts               # Registers JWT, guards (APP_GUARD)
│   ├── auth.service.ts              # Register/login logic, token generation
│   ├── auth.controller.ts           # POST /auth/register, POST /auth/login
│   ├── guards/
│   │   ├── auth.guard.ts            # JWT verification guard
│   │   └── roles.guard.ts           # Role-based access guard
│   ├── decorators/
│   │   ├── public.decorator.ts      # @Public() — skip auth
│   │   ├── roles.decorator.ts       # @Roles(Role.ADMIN) — require role
│   │   └── index.ts                 # Barrel export
│   └── dto/
│       ├── register.dto.ts          # Registration validation
│       ├── login.dto.ts             # Login validation
│       └── index.ts                 # Barrel export
│
├── users/                           # User management
│   ├── users.module.ts
│   ├── users.service.ts             # CRUD, password hashing, profile
│   └── users.controller.ts          # GET /users, GET /users/profile
│
├── products/                        # Product catalog
│   ├── products.module.ts
│   ├── products.service.ts          # CRUD operations
│   ├── products.controller.ts       # Full CRUD routes
│   └── dto/
│       ├── create-product.dto.ts
│       ├── update-product.dto.ts    # PartialType of CreateProductDto
│       └── index.ts
│
└── orders/                          # Order processing (core domain)
    ├── orders.module.ts
    ├── orders.service.ts            # Order business logic, stock management
    ├── orders.controller.ts         # Order routes + audit log endpoints
    ├── order-audit.service.ts       # Audit log read/write operations
    ├── orders.cron.ts               # Scheduled PENDING -> PROCESSING job
    └── dto/
        ├── create-order.dto.ts
        ├── update-order-status.dto.ts
        └── index.ts
```

### Design Principles

- **Single Responsibility**: Each module encapsulates one domain (auth, users, products, orders)
- **Dependency Injection**: All services are injected via NestJS's DI container — no manual instantiation
- **Global Cross-Cutting Concerns**: Auth, roles, validation, response formatting, and error handling are registered globally — controllers stay clean
- **Separation of Concerns**: Controllers handle HTTP; services handle business logic; Prisma handles persistence

---

## 13. Setup & Running

### Prerequisites

- Node.js >= 18
- npm

### Installation

```bash
cd order-processing
npm install
```

### Environment Variables

Create `.env` in the project root:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-key-change-in-production"
```

### Database Setup

```bash
npx prisma migrate dev       # Apply migrations and generate client
```

### Start the Server

```bash
npm run start:dev             # Development with hot-reload
npm run start:prod            # Production
```

### Access Points

| Resource | URL |
|----------|-----|
| API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api |
| Swagger JSON | http://localhost:3000/api-json |
| Prisma Studio (DB GUI) | `npx prisma studio` → http://localhost:5555 |

---

## 14. Testing

### Automated API Test Suite

A comprehensive bash test script (`test-api.sh`) covers **58 test cases** across all modules:

```bash
# Run with Git Bash on Windows or any bash shell
bash test-api.sh
```

### Test Coverage Breakdown

| Category | Tests | What's Covered |
|----------|-------|----------------|
| Auth — Registration | 5 | Success, duplicate email, short password |
| Auth — Login | 4 | Success, wrong credentials |
| Users — Profile & List | 4 | Own profile, admin list, RBAC enforcement |
| Products — Admin CRUD | 6 | Create, update, customer forbidden |
| Products — Public | 3 | List, get by ID, 404 |
| Orders — Create | 5 | Success, no auth, empty items, bad product |
| Orders — Retrieve | 7 | Ownership, admin access, filtering, 404 |
| Orders — Cancel | 4 | Own cancel, double cancel, cross-user, admin |
| Orders — Status | 8 | Full lifecycle, skip/backward rejection, RBAC |
| Products — Delete | 3 | Admin delete, verify gone |
| Audit Logs | 8 | Per-order log, global log, filters, RBAC |
| Swagger | 1 | API docs accessible |

### Test Flow

The script is fully self-contained and idempotent:
1. Registers fresh users with timestamped emails
2. Promotes one to ADMIN via direct DB update
3. Creates products and orders
4. Tests all CRUD, status transitions, RBAC, and audit logs
5. Reports pass/fail with colored output

---

## 15. Design Decisions & Trade-offs

### 1. Price Snapshot in OrderItem

**Decision:** Store the product price at the time of purchase in `OrderItem.price` rather than computing it from the current product price.

**Why:** Product prices change over time. Without a snapshot, historical order totals would retroactively change, breaking financial accuracy.

### 2. Atomic Stock Decrement via Transactions

**Decision:** Use Prisma's `$transaction` to decrement stock and create the order atomically.

**Why:** Prevents race conditions where two concurrent orders could oversell a product. If any step fails, the entire transaction rolls back.

### 3. JWT Role Embedded in Token

**Decision:** Include `role` directly in the JWT payload rather than looking it up from the DB on every request.

**Why:** Eliminates a database query per request, improving latency. Trade-off: if a user's role changes, they must re-authenticate to get a new token.

### 4. Global Guards via APP_GUARD

**Decision:** Register `AuthGuard` and `RolesGuard` globally via `APP_GUARD` rather than applying them per-route.

**Why:** Secure-by-default — every route requires authentication unless explicitly opted out with `@Public()`. This prevents accidental exposure of unprotected endpoints.

### 5. Audit Log as Separate Table (Not Event Sourcing)

**Decision:** Use a simple append-only audit log table rather than full event sourcing.

**Why:** Event sourcing adds significant complexity (event replay, projections, eventual consistency). For an order processing system, a denormalized audit table provides full traceability with minimal overhead and is easy to query.

### 6. SQLite with Prisma Adapter

**Decision:** Use SQLite via `@prisma/adapter-better-sqlite3` instead of PostgreSQL.

**Why:** Zero infrastructure setup for a take-home assignment. The Prisma schema is database-agnostic — switching to PostgreSQL only requires changing the datasource provider and connection string.

### 7. Standardized Response Envelope

**Decision:** Wrap all responses in `{ status, message, data }` via a global interceptor/filter rather than returning raw data.

**Why:** Provides a consistent contract for frontend consumers. They always know the shape of the response. The interceptor approach means zero changes to controller/service code.

### 8. Cron Pre-Query for Audit Logging

**Decision:** In `promotePendingToProcessing()`, query the affected order IDs *before* running `updateMany`, then bulk-insert audit rows.

**Why:** `updateMany` doesn't return individual records. By querying first, we get the IDs needed for audit entries. This is a two-query approach (SELECT + UPDATE) rather than individual updates, optimizing for batch performance.

---

*This document reflects the current state of the system. For the interactive API reference, visit the Swagger UI at `/api` when the server is running.*
