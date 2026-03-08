# Coding Learning Platform

Backend and schema work for **BEN-213**: Supabase/Postgres schema foundation, migrations, seeds, and Express API integration.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Express
- Database: PostgreSQL (Supabase-compatible)
- Query builder + pooling: Knex + `pg`
- Tests: Vitest + Testing Library + Supertest

## Environment

Copy `.env.example` to `.env` and set `DATABASE_URL` to your Supabase Postgres URL:

```bash
cp .env.example .env
```

## Database setup

Install dependencies and run migrations/seeds:

```bash
npm install
npm run db:migrate
npm run db:seed
```

Available database scripts:

- `npm run db:migrate` - apply latest migrations
- `npm run db:rollback` - rollback latest migration batch
- `npm run db:seed` - run seed data
- `npm run db:reset` - rollback + migrate + seed

## Run locally

Start frontend and backend:

```bash
npm run dev
```

- Express API: `http://localhost:3765` (set `PORT` to override)
- Vite app: `http://localhost:5173`

## API Endpoints

- `GET /api/health`
- `GET /api/lessons/intro`
- `GET /api/highlights/:lessonId`
- `POST /api/highlights`
- `DELETE /api/highlights/:id` (soft delete)

## Seed content

Seed script inserts:

- 1 default user
- 3 categories
- 5 lessons (real lesson content)

## Testing

Run automated tests:

```bash
npm test
```

Note: test runs use an in-memory Postgres-compatible database (`pg-mem`) and execute Knex migrations + seeds.
