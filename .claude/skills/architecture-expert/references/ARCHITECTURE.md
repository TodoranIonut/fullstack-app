# Architecture

This document describes the structure, components, and key design decisions of the fullstack e-commerce application.

## Overview

The application is a multi-role e-commerce platform where **Customers** browse products, manage a cart, and place orders, while **Administrators** manage the product catalog. It is composed of three services:

| Service | Technology | Port |
|---------|-----------|------|
| API | Spring Boot 4.0.3 / Java 21 | 3000 |
| UI | Angular 21 | 4200 |
| Database | PostgreSQL 18 | 5432 |

## System diagram

```
┌─────────────────────────────────────┐
│  Browser                            │
│                                     │
│  Angular SPA (port 4200)            │
│  ├── Feature: auth                  │
│  ├── Feature: products              │
│  ├── Feature: cart (client-side)    │
│  └── Feature: orders                │
└──────────────┬──────────────────────┘
               │ HTTP + JWT
               ▼
┌─────────────────────────────────────┐
│  Spring Boot API (port 3000)        │
│  Context path: /api                 │
│                                     │
│  Controllers → Services → Repos     │
│  JWT Auth Filter (stateless)        │
│  Strategy: order fulfillment        │
└──────────────┬──────────────────────┘
               │ JDBC
               ▼
┌─────────────────────────────────────┐
│  PostgreSQL 18 (port 5432)          │
│  Database: shopdb                   │
│  Schema: onlineshop                 │
│  Migrations: Flyway                 │
└─────────────────────────────────────┘
```

---

## Backend

### Package structure

```
onlineshopapi/src/main/java/msg/onlineshopapi/
├── config/          — OpenAPI / CORS configuration
├── controller/      — REST endpoints
├── dto/             — Request/response contracts
│   └── mapper/      — Entity ↔ DTO conversions
├── exception/       — Custom exceptions + GlobalExceptionHandler
├── model/           — JPA entities
├── repository/      — Spring Data JPA repositories
├── security/        — JWT filter, SecurityConfig, UserDetails
└── service/
    └── strategy/    — Order fulfillment strategies
```

### API endpoints

| Controller | Base path | Key operations |
|-----------|----------|----------------|
| `AuthController` | `/api/auth` | `POST /register`, `POST /login`, `GET /profile` |
| `ProductController` | `/api/products` | CRUD — read is public, write requires `ADMIN` |
| `ProductCategoryController` | `/api/products/categories` | CRUD — same access rules as products |
| `OrderController` | `/api/orders` | `GET /`, `GET /{id}`, `POST /` — all require auth |

Swagger UI is available at `http://localhost:3000/api/swagger-ui.html`.

### Data model

```
product_categories ──< products >── stocks >── locations
                                               (warehouses)
users ──< orders ──< order_details >── products
                  └── shipped_from (→ locations)
```

All primary keys are UUID. Notable design choices:

- `stocks` uses a composite primary key `(product_id, location_id)` to represent per-location inventory.
- `order_details` uses a composite key `(order_id, product_id)` and records which location fulfilled the shipment via `shipped_from_id`.
- Order shipping address is denormalized onto `orders` (country, city, county, street_address).

### Order fulfillment strategies

When an order is placed, the service selects a warehouse location via the `OrderStrategy` interface:

| Strategy | Behaviour |
|----------|----------|
| `SingleLocationStrategy` | Fulfills the entire order from one location |
| `MostAbundantStrategy` | Fulfills from the location with the highest stock level |

The active strategy is selected at startup via the `app.order.strategy` config property.

### Security

- **Authentication**: Stateless JWT. Tokens are signed with HMAC-SHA using `JWT_SECRET`, expire after 24 hours.
- **Authorization**: Role-based via `@PreAuthorize`. Roles: `ADMIN`, `CUSTOMER`.
- **Filter chain**: `JwtAuthFilter` extracts and validates the `Authorization: Bearer <token>` header before the Spring Security processors run.
- **Public endpoints**: `/auth/register`, `/auth/login`, and Swagger docs (`/v3/api-docs/**`, `/swagger-ui/**`).
- **Passwords**: BCrypt.
- **CORS**: Whitelist configured via `CORS_ALLOWED_ORIGINS` environment variable.

---

## Frontend

### Package structure

```
onlineshopui/src/app/
├── clib/            — Shared component library
│   ├── components/  — card, modal, navbar, spinner, notification-popup, error-message, icon
│   ├── layouts/     — root-layout (app shell with navbar)
│   └── services/    — theme.service (dark/light mode)
├── core/            — Infrastructure
│   ├── config/      — Route and validation constants
│   ├── mocks/       — MSW handlers and mock data (used in mock build)
│   ├── providers/   — DI setup for environment, mock API, validation messages
│   ├── services/    — notifications.service
│   └── types/       — DTOs, enums, shared types
└── features/        — Lazy-loaded feature modules
    ├── auth/        — Login, register, route guards, AuthService
    ├── products/    — Catalog, detail, create, update pages; ProductService
    ├── cart/        — Cart overview; CartService (client-side state)
    └── orders/      — Orders overview, order detail; OrdersService
```

### Routing

All routes live under the root `authGuard`. Authenticated users land on the product catalog by default.

```
/ (authGuard)
├── auth/login        — guestGuard (redirect if already logged in)
├── auth/register     — guestGuard
├── products/
│   ├── overview      — all authenticated users
│   ├── :id           — all authenticated users
│   ├── create        — rolesGuard (ADMIN only)
│   └── update/:id    — rolesGuard (ADMIN only)
├── cart/overview     — all authenticated users
└── orders/
    ├── overview      — all authenticated users
    └── details/:id   — all authenticated users
```

**Guards:**

| Guard | Purpose |
|-------|---------|
| `authGuard` | Redirects unauthenticated users to `/auth/login` |
| `guestGuard` | Redirects authenticated users away from auth pages |
| `rolesGuard` | Blocks access based on `UserRole` (e.g. ADMIN-only routes) |

### Authentication flow

1. User submits credentials → `POST /api/auth/login`
2. Backend returns a signed JWT.
3. `AuthService` stores the token in `localStorage`.
4. `AuthTokenInterceptor` attaches `Authorization: Bearer <token>` to every outgoing request.
5. On logout, the token is removed and the user is redirected to login.

### State management

The application uses service-based state without a dedicated state library:

- `AuthService` — current user session, login/logout.
- `CartService` — client-side cart state (RxJS `BehaviorSubject`). Cart items are not persisted to the backend until checkout.
- `NotificationsService` — transient toast notifications.

### Mock API

Running `npm run start:mock` (`ng serve --configuration mock`) activates an MSW-based interceptor that replaces all HTTP calls with in-memory responses. This allows full UI development without a running backend. Handlers live in `core/mocks/interceptors/handlers/`.

### Build configurations

| Configuration | API base | Use case |
|--------------|---------|---------|
| `development` | `http://localhost:3000/api` | Local development with real backend |
| `mock` | `http://mock-api` (intercepted) | Frontend-only development |
| `production` | `${API_URL}` (runtime env var) | Deployed environments |

---

## Database

### Migrations

Flyway runs automatically on application startup. Migration files live at:

```
onlineshopapi/src/main/resources/db/migration/
├── V1__create_tables.sql         — Full schema definition
└── local/V1.1__populate_mock_data.sql  — Seed data (local profile only)
```

The `local` profile activates the seed data migration. Production deployments only run `V1__create_tables.sql`.

### Seed data (local)

| Entity | Count | Notes |
|--------|-------|-------|
| Product categories | 4 | Electronics, Clothing, Home & Garden, Sports |
| Products | 10 | Spread across all categories |
| Locations | 2 | Cluj-Napoca, Bucharest |
| Stocks | 10 | Various quantities per location |
| Users | 3 | 1 ADMIN + 2 CUSTOMER (password: `password`) |
| Orders | 2 | Sample orders with line items |

---

## Configuration reference

### Backend environment variables

| Variable | Required | Description |
|----------|---------|-------------|
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | Yes | PostgreSQL port |
| `DB_NAME` | Yes | Database name |
| `DB_USERNAME` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Base64-encoded HMAC secret |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins |

The `local` Spring profile pre-configures all of these for local development via `application-local.yml`.

### Frontend environment variables

| Variable | Configurations | Description |
|----------|---------------|-------------|
| `API_URL` | `development`, `production` | Base URL of the backend API |
