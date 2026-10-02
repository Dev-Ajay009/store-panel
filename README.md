# Store Panel

Admin panel for an online store, built with Next.js.

## Tech

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- Zod for validation
- Vitest and Playwright for tests

## Features

- Login with email and password
- Two roles: Admin and Manager
- Manager can't delete products
- Dashboard with product counts and recent products
- Product list with search, filters, sorting and pagination
- Create, edit, delete and activate/deactivate products
- Form validation on the server
- Works on mobile

## Requirements

- Node.js 20.9 or newer
- npm

## Setup

1. Install packages

```bash
npm install
```

2. Create the `.env` file

```bash
cp .env.example .env
```

3. Set `AUTH_SECRET` in `.env` to any long random text

4. Create the database

```bash
npm run db:migrate
```

5. Add sample data

```bash
npm run db:seed
```

6. Start the app

```bash
npm run dev
```

7. Open http://localhost:3000

## Environment variables

- `DATABASE_URL` - SQLite database file
- `AUTH_SECRET` - secret for the login cookie

## Test accounts

- Admin: `admin@example.com` / `Admin123!`
- Manager: `manager@example.com` / `Manager123!`

## Commands

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm start` - run the production build
- `npm run db:migrate` - create or update the database
- `npm run db:seed` - add sample data
- `npm run db:reset` - clear the database and seed again
- `npm test` - unit and integration tests
- `npm run test:e2e` - end-to-end tests
- `npm run lint` - check code style
- `npm run typecheck` - check types

## Tests

- Unit tests: validation, permissions, URL filters
- Integration tests: product create, update, delete, filters and pagination
- E2E test: login, create a product, search it, delete it
- Before E2E tests, run `npm run db:seed` and `npx playwright install chromium`

## Folder structure

- `prisma/` - database schema, migrations, seed
- `src/app/login/` - login page
- `src/app/(panel)/` - pages that need login (dashboard, products)
- `src/components/` - reusable UI parts
- `src/lib/` - validation, permissions, helpers
- `src/server/` - login check and database functions
- `src/proxy.ts` - redirects to login if not logged in
- `tests/` - all tests

## Technical decisions

- Pages are Server Components, so they read data directly from the database
- Client Components only where needed (forms, filters, buttons)
- Create, edit, delete use Server Actions
- After a change, `revalidatePath` refreshes the pages
- Search, filters, sort and page are saved in the URL
- Passwords are hashed with bcrypt
- Login is saved in an httpOnly cookie with a signed JWT
- Every page and action checks the logged in user on the server
- Role permissions are checked on the server before every change
- SQLite so the project runs without installing a database
- Price is saved in cents to avoid decimal problems

## Could be added later

- Image upload
- Toast messages
- User management page
- Docker
