# E-commerce Order Processing System

A production-grade backend for an e-commerce order processing system built with **NestJS**, **Prisma ORM**, and **SQLite**. The system supports customer order placement, order lifecycle tracking, role-based access control, and automated background processing.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Order Lifecycle & State Machine](#order-lifecycle--state-machine)
- [Background Job (Cron)](#background-job-cron)
- [Audit Logging](#audit-logging)
- [Rate Limiting](#rate-limiting)
- [Server-Side Pagination](#server-side-pagination)
- [Standardized Response Format](#standardized-response-format)
- [Input Validation](#input-validation)
- [Setup & Running](#setup--running)
- [Testing](#testing)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [Cursor AI Usage & Issues Encountered](#cursor-ai-usage--issues-encountered)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | NestJS 11 (TypeScript) | Modular, decorator-based backend framework |
| ORM | Prisma 7 | Type-safe database access, migrations, schema-first design |
| Database | SQLite (via better-sqlite3) | File-based, zero-config relational database |
| Auth | @nestjs/jwt + bcrypt | JWT token generation/verification, password hashing |
| Validation | class-validator + class-transformer | DTO-based input validation with decorators |
| Scheduling | @nestjs/schedule (cron) | Background job for auto-promoting PENDING orders |
| Rate Limiting | @nestjs/throttler | Global + per-route request throttling |
| API Docs | @nestjs/swagger | Auto-generated OpenAPI 3.0 documentation |

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
    │AuthModule│     │OrdersModule │   │ProductsModule│
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

---

## Project Structure

```
order-processing/
├── prisma/
│   ├── schema.prisma              # Database schema (5 models, 2 enums)
│   ├── dev.db                     # SQLite database file
│   └── migrations/                # Prisma migration history
│       ├── 20260324185712_add_users_products_rbac/
│       └── 20260324195632_add_order_audit_log/
├── src/
│   ├── main.ts                    # App bootstrap, global config
│   ├── app.module.ts              # Root module (imports all feature modules)
│   ├── app.controller.ts          # Health check endpoint (GET /)
│   ├── auth/
│   │   ├── auth.module.ts         # JWT config, guards registration
│   │   ├── auth.service.ts        # Register, login, token generation
│   │   ├── auth.controller.ts     # POST /auth/register, POST /auth/login
│   │   ├── guards/
│   │   │   ├── auth.guard.ts      # JWT verification guard (global)
│   │   │   └── roles.guard.ts     # Role-based access guard (global)
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts    # @Public() — skip auth
│   │   │   └── roles.decorator.ts     # @Roles(Role.ADMIN) — require role
│   │   └── dto/
│   │       ├── register.dto.ts    # { email, password, name }
│   │       └── login.dto.ts       # { email, password }
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts       # CRUD, password hashing, profile
│   │   └── users.controller.ts    # GET /users, GET /users/profile
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.service.ts    # CRUD with pagination
│   │   ├── products.controller.ts # Full CRUD endpoints
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       └── update-product.dto.ts
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.service.ts      # Core order logic, state machine
│   │   ├── orders.controller.ts   # Order endpoints + audit log endpoints
│   │   ├── orders.cron.ts         # Background job (every 5 minutes)
│   │   ├── order-audit.service.ts # Audit log read/write operations
│   │   └── dto/
│   │       ├── create-order.dto.ts        # { items: [{ productId, quantity }] }
│   │       ├── update-order-status.dto.ts # { status: OrderStatus }
│   │       ├── order-list-query.dto.ts    # Extends PaginationQueryDto + status filter
│   │       └── audit-log-query.dto.ts     # Extends PaginationQueryDto + orderId/action
│   ├── prisma/
│   │   ├── prisma.module.ts       # Global Prisma provider
│   │   └── prisma.service.ts      # PrismaClient with SQLite adapter
│   ├── common/
│   │   ├── api-response.interface.ts          # { status, message, data } type
│   │   ├── pagination.helper.ts               # paginate() utility function
│   │   ├── dto/
│   │   │   └── pagination-query.dto.ts        # { page, limit } with validation
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts        # Wraps success responses
│   │   └── filters/
│   │       └── http-exception.filter.ts       # Formats error responses
│   └── generated/prisma/                      # Auto-generated Prisma client types
├── test-api.sh                    # Full API test suite (65 tests)
├── test-assignment.sh             # Assignment-focused validation (68 tests)
├── .env                           # Environment variables
├── package.json
└── tsconfig.json
```

---

## Database Design

### Entity Relationship Diagram

```
┌──────────────┐       ┌───────────────┐       ┌──────────────┐
│     User     │       │     Order     │       │   Product    │
├──────────────┤       ├───────────────┤       ├──────────────┤
│ id       PK  │◄──┐   │ id        PK  │   ┌──►│ id       PK  │
│ email  UQ    │   │   │ status       │   │   │ name         │
│ password     │   ├───│ customerId FK│   │   │ description  │
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
                   ├───│ performedById FK  │
                       │ action            │
                       │ oldStatus         │
                       │ newStatus         │
                       │ performedByRole   │
                       │ note              │
                       │ createdAt         │
                       └───────────────────┘
```

### Models

**User** — Application users with role-based access.

| Field | Type | Notes |
|---|---|---|
| id | Int (PK) | Auto-increment |
| email | String | Unique, indexed |
| password | String | bcrypt hashed (10 salt rounds) |
| name | String | Display name |
| role | Enum: `ADMIN`, `CUSTOMER` | Default: `CUSTOMER` |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

**Product** — Catalog items available for purchase.

| Field | Type | Notes |
|---|---|---|
| id | Int (PK) | Auto-increment |
| name | String | Indexed for search |
| description | String? | Optional |
| price | Float | Unit price |
| stock | Int | Current inventory count, decremented on order |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

**Order** — Customer orders containing one or more items.

| Field | Type | Notes |
|---|---|---|
| id | Int (PK) | Auto-increment |
| status | Enum: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` | Default: `PENDING` |
| customerId | Int (FK) | References User.id, indexed |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

**OrderItem** — Line items within an order (join table between Order and Product).

| Field | Type | Notes |
|---|---|---|
| id | Int (PK) | Auto-increment |
| quantity | Int | Number of units |
| price | Float | Price at time of order (snapshot) |
| orderId | Int (FK) | References Order.id, cascading delete |
| productId | Int (FK) | References Product.id |

**OrderAuditLog** — Immutable event log for order lifecycle tracking.

| Field | Type | Notes |
|---|---|---|
| id | Int (PK) | Auto-increment |
| orderId | Int (FK) | References Order.id, cascading delete |
| action | String | `ORDER_CREATED`, `STATUS_UPDATED`, `ORDER_CANCELLED`, `CRON_STATUS_UPDATE` |
| oldStatus | String? | Previous status (null for creation) |
| newStatus | String | New status after action |
| performedById | Int? (FK) | References User.id (null for system/cron) |
| performedByRole | String? | `ADMIN`, `CUSTOMER`, or `SYSTEM` |
| note | String? | Optional context |
| createdAt | DateTime | Immutable timestamp |

### Database Indexes

Indexes are added on all foreign keys and frequently queried fields for optimal performance:

- `User`: email (unique + index), role
- `Product`: name
- `Order`: customerId, status
- `OrderItem`: orderId, productId
- `OrderAuditLog`: orderId, action, createdAt

---

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

## Authentication & Authorization

### JWT Authentication Flow

```
Client                          Server
  │                               │
  │  POST /auth/register          │
  │  { email, password, name }    │
  │──────────────────────────────►│
  │                               │  1. Validate DTO (class-validator)
  │                               │  2. Check email uniqueness
  │                               │  3. Hash password (bcrypt, 10 rounds)
  │                               │  4. Create user in DB
  │                               │  5. Generate JWT { sub, email, role }
  │  { user, access_token }       │
  │◄──────────────────────────────│
  │                               │
  │  POST /auth/login             │
  │  { email, password }          │
  │──────────────────────────────►│
  │                               │  1. Find user by email
  │                               │  2. Compare password with bcrypt
  │                               │  3. Generate JWT
  │  { access_token }             │
  │◄──────────────────────────────│
  │                               │
  │  GET /orders                  │
  │  Authorization: Bearer <jwt>  │
  │──────────────────────────────►│
  │                               │  AuthGuard: verify JWT
  │                               │  RolesGuard: check role
  │                               │  Controller → Service → DB
  │  { status, message, data }    │
  │◄──────────────────────────────│
```

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

## Order Lifecycle & State Machine

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

### Implementation

The state machine is implemented in `OrdersService.updateStatus()` using an ordered array:

```typescript
const STATUS_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];
```

On each update, the service checks that `targetIndex === currentIndex + 1`, guaranteeing forward-only, sequential transitions. The cancel operation is handled separately and only allowed from `PENDING`.

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

### Implementation

- `ThrottlerModule.forRoot()` sets the global default (60 req/min)
- `ThrottlerGuard` is registered as a global `APP_GUARD`
- Auth routes use `@Throttle({ default: { limit: 10, ttl: 60000 } })` for stricter limits
- Responses include `X-RateLimit-*` headers showing remaining quota
- Exceeding the limit returns `429 Too Many Requests`

---

## Server-Side Pagination

All list endpoints return paginated responses using offset-based pagination.

### Query Parameters

| Parameter | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `page` | number | 1 | min: 1 | Current page number |
| `limit` | number | 10 | min: 1, max: 100 | Items per page |

### Response Format

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "items": [ ... ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 47,
      "totalPages": 5
    }
  }
}
```

### Paginated Endpoints

- `GET /products` — Public product listing
- `GET /orders` — Orders (with optional `?status=` filter)
- `GET /users` — Admin user listing
- `GET /orders/:id/audit-log` — Order-specific audit trail
- `GET /orders/audit-logs/all` — All audit logs (with optional `?orderId=` and `?action=` filters)

### Implementation

A shared `PaginationQueryDto` handles validation. A `paginate()` helper function standardizes the response structure:

```typescript
export function paginate<T>(items: T[], totalItems: number, page: number, limit: number): PaginatedResult<T> {
  return {
    items,
    meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
  };
}
```

Services use `Promise.all([findMany({ skip, take }), count()])` for efficient parallel queries.

---

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

### Example DTO

```typescript
export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class CreateOrderItemDto {
  @IsInt() @Min(1) productId: number;
  @IsInt() @Min(1) quantity: number;
}
```

---

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
- **Prisma 7** with the `@prisma/adapter-better-sqlite3` driver adapter was used for native SQLite support.

### Price Snapshot in OrderItem

The `OrderItem.price` field stores the product price at order time, not a reference to the current product price. This prevents order totals from changing if product prices are later updated — a standard e-commerce pattern.

### Stock Management

Stock is decremented atomically within a Prisma `$transaction` during order creation. This prevents race conditions where two concurrent orders could both succeed with insufficient stock.

### Audit Log Design

The audit log is append-only (no updates or deletes). It captures the actor (`performedById`, `performedByRole`) and the state transition (`oldStatus` → `newStatus`) for complete traceability. The `SYSTEM` role identifies automated cron actions.

### State Machine Approach

Rather than a complex state machine library, the allowed transitions are encoded as a simple ordered array (`STATUS_FLOW`). The validation checks `targetIndex === currentIndex + 1`, which naturally enforces forward-only, sequential transitions. Cancellation is a separate branch from `PENDING` only.

### Global Guards vs Per-Route

Both `AuthGuard` and `RolesGuard` are registered globally via `APP_GUARD`. The `@Public()` decorator opts individual routes out of authentication. This "secure by default" approach prevents accidental exposure of unprotected endpoints.

### Response Envelope

All responses use `{ status, message, data }`. This was implemented with a global interceptor (success) and exception filter (errors) rather than modifying individual controller methods, ensuring zero business logic changes.

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
- Comprehensive test scripts (68+ automated tests)

---

## License

UNLICENSED — Private assignment project.
