# OoNt Grocery API

Take-home assignment — NestJS + Prisma + PostgreSQL. Covers product catalog, cart management, and checkout with concurrency protection.

## Stack

- NestJS
- Prisma ORM
- PostgreSQL
- Swagger
- Docker Compose

## Architecture

- `src/products`, `src/categories`, `src/cart`, `src/orders`: feature modules with standard NestJS `controller -> service -> prisma` flow.
- `src/prisma/prisma.service.ts`: shared Prisma client registered globally through `PrismaModule`.
- `prisma/schema.prisma`: database schema for users, products, carts, and orders.
- `SCHEMA.md`: quick relationship map and transaction notes for reviewers.
- `prisma/seed.ts`: deterministic demo seed used for local verification.

Controllers are thin, logic lives in services, DB access goes through Prisma.

## Run With Docker

Start the API and PostgreSQL together:

```bash
docker compose up --build
```

Services:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`
- Postgres: `localhost:5432`

The container waits for Postgres, runs migrations on startup, then starts the server.

## Catalog Behavior

- Products with `deletedAt != null` are hidden from the public catalog and from new checkouts.
- Historical orders remain valid because `order_items` store product name and price snapshots.

## Local Run

1. Create `.env` from `.env.example`.

Windows:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
docker compose up -d postgres
```

3. Install dependencies:

```bash
npm install
```

4. Apply migrations:

```bash
npm run db:migrate:dev
```

5. Seed demo data:

```bash
npm run db:seed
```

6. Start the API:

```bash
npm run start:dev
```

## Database Commands

Generate Prisma client:

```bash
npm run db:generate
```

Run development migration:

```bash
npm run db:migrate:dev
```

Apply existing migrations in containers/CI:

```bash
npm run db:migrate:deploy
```

Seed demo data:

```bash
npm run db:seed
```

## Swagger

Swagger UI is available at:

`http://localhost:3000/api`

All endpoints are documented with request/response schemas and validation rules.

## Concurrency Strategy

Checkout uses `SELECT ... FOR UPDATE` inside a Prisma transaction to prevent overselling.

Checkout:

- Runs in a single transaction.
- Locks the cart row first (prevents double-checkout of the same cart).
- Locks product rows in sorted `id` order — deterministic ordering to avoid deadlocks.
- Validates stock only after locks are held, then decrements, creates the order, and clears the cart atomically.
- Returns `400` with a `failedItems` list if any product is out of stock; transaction rolls back.

Cancellation:

- Also runs in a transaction: lock order → lock products → restore stock + set status to `CANCELLED`.

## Seed Data

```bash
npm run db:seed
```

`prisma/seed.ts` creates:

- 3 demo users
- 5 categories
- 20 products

User IDs are printed to stdout after seeding — use them directly in cart/order requests.

## Testing

Build:

```bash
npm run build
```

Unit tests:

```bash
npm test
```

E2E tests:

```bash
npm run test:e2e
```

The e2e suite has a concurrency test: two checkouts race for a product with `stock = 1`, exactly one succeeds.

