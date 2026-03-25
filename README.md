# E-commerce Order Processing System

A production-grade backend system for order processing built using **NestJS**, **Prisma ORM**, and **SQLite**.  
The system supports order creation, lifecycle management, background processing, and demonstrates scalable backend architecture.

---

## 🚀 Tech Stack

- Framework: NestJS (TypeScript)
- ORM: Prisma
- Database: SQLite (file-based, easily replaceable with MySQL/PostgreSQL)
- Validation: class-validator
- Scheduling: @nestjs/schedule (cron jobs)
- API Docs: Swagger (OpenAPI)
- Rate Limiting: @nestjs/throttler

---

## 🧠 Architecture Overview

The system follows a clean modular architecture:

Client → Controller → Service → Prisma → Database

- Controllers handle HTTP requests
- Services contain business logic
- Prisma manages database interactions
- DTOs ensure input validation

---

## 📦 Core Features

### 1. Create Order
- Customers can place orders with multiple items
- Validates product existence and stock availability
- Uses database transaction to ensure consistency

### 2. Retrieve Order
- Fetch order details by ID
- Ownership-based access (users see their own orders, admins see all)

### 3. List Orders
- Supports filtering by status
- Includes server-side pagination

### 4. Update Order Status
- Follows strict state machine:
  PENDING → PROCESSING → SHIPPED → DELIVERED
- Prevents skipping or reversing states

### 5. Cancel Order
- Allowed only if status = PENDING
- Enforced via business logic

---

## 🔄 Background Job (Cron)

A scheduled job runs every 5 minutes:
- Automatically updates all PENDING orders → PROCESSING
- Implemented using @nestjs/schedule

---

## 🗄️ Database Design

### Order
- id
- status (enum)
- createdAt

### OrderItem
- id
- orderId (FK)
- productId
- quantity
- price

---

## 🔒 Validation Rules

- Order must contain at least one item
- Quantity must be greater than 0
- Status transitions must follow defined flow
- Only PENDING orders can be cancelled

---

## 📚 API Endpoints

POST   /orders              → Create order  
GET    /orders/:id          → Get order  
GET    /orders              → List orders  
PATCH  /orders/:id/status   → Update status  
PATCH  /orders/:id/cancel   → Cancel order  

---

## ⚙️ Setup & Running

npm install  
npx prisma generate  
npx prisma migrate dev  
npm run start:dev  

---

## 📄 API Documentation

Swagger UI available at:
http://localhost:3000/api

---

## 🧪 Testing

Basic API testing can be done using:
- Postman
- Swagger UI

---

## ⚖️ Design Decisions

### Why NestJS?
Provides structured, scalable architecture with dependency injection and modular design.

### Why Prisma?
Type-safe ORM with easy schema management and migrations.

### Why SQLite?
Chosen for simplicity and quick setup in a take-home assignment.  
Can be easily replaced with MySQL/PostgreSQL.

### Transaction Handling
Order creation uses database transactions to ensure:
- Stock updates
- Order creation consistency

---

## 🤖 AI Usage & Learnings (IMPORTANT)

I used Cursor AI and ChatGPT to accelerate development:

- Generated initial NestJS module structure
- Designed Prisma schema
- Assisted with API design and validation patterns

Issues faced:
- Incorrect Prisma relations initially caused runtime errors
- Validation edge cases (empty items, invalid input)

Fixes:
- Refined schema and relations manually
- Added proper DTO validation
- Tested APIs thoroughly

All AI-generated code was reviewed, modified, and validated to ensure correctness.

---

## 💡 Additional Enhancements

To demonstrate real-world backend design, I added:

- Role-based access control (RBAC)
- Audit logging for order lifecycle
- Rate limiting
- Standardized API response format
- Pagination support

---

## 🏁 Conclusion

This project demonstrates:

- Clean backend architecture
- Real-world business logic handling
- Scalable and maintainable system design
- Effective use of AI-assisted development
