# Store Panel

Admin panel for a small online store. You log in, see a quick overview on the dashboard and manage the products.

Stack: Next.js 16 (App Router), TypeScript, Tailwind, Prisma + SQLite.

## Requirements

- Node 20.9+ (I used Node 22)
- npm

You don't need to install a database. SQLite keeps everything in `prisma/dev.db`.

## Setup

```bash
npm install
cp .env.example .env
```

Put a random value in `AUTH_SECRET` inside `.env`. This works:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Env variables used:

- `DATABASE_URL` - path to the SQLite file, `file:./dev.db` by default (relative to the prisma folder)
- `AUTH_SECRET` - used to sign the session cookie, only used on the server

Create the database:

```bash
npm run db:migrate
```

Add the sample data (2 users, 4 categories, 24 products):

```bash
npm run db:seed
```

You can run the seed again whenever you want, it clears the products and adds them back. `npm run db:reset` drops everything and starts from zero.

Start the app:

```bash
npm run dev
```

and go to http://localhost:3000

Production build:

```bash
npm run build
npm start
```

## Test accounts

```
Admin    admin@example.com    Admin123!
Manager  manager@example.com  Manager123!
```

Admin can do everything. Manager can do everything except delete products.

## Tests

```bash
npm test           # vitest - unit + integration
npm run test:e2e   # playwright
npm run lint
npm run typecheck
```

- `tests/unit` - validation rules, permissions, parsing the filters from the URL
- `tests/integration` - runs the product service against a separate SQLite db (`prisma/test.db`, recreated every run). Covers create/update/delete, status change, filters, sorting, pagination. There's also a test that a manager can't delete even if they call the server function directly.
- `tests/e2e` - login -> products -> create product (incl. validation errors) -> search for it -> delete it. Plus a check that the manager doesn't get a delete button.

E2E uses the dev database, so seed it first. The first time you'll also need a browser for Playwright:

```bash
npx playwright install chromium
```

(If Chrome is already installed you can run `PW_CHANNEL=chrome npm run test:e2e` and skip that.)

## Folder structure

```
prisma/          schema, migrations, seed
src/
  proxy.ts       sends logged out users to /login
  app/
    login/
    (panel)/     all pages that need login (dashboard, products)
  components/
  lib/           validation, permissions, helpers
  server/        auth + product service (everything that touches the db)
tests/
```

## Decisions

Most pages are server components and read from the db directly through `src/server/products.ts`. I didn't add an API layer or something like React Query because it wasn't needed here. Client components are only used where there's interaction: forms, the filter bar, status button and the delete dialog.

Create/edit/delete/status change are server actions. After each one I call `revalidatePath` so the list, details page and dashboard show the new data without refreshing. The form uses `useActionState`, so server validation errors show up under the right field and what you typed stays in the inputs.

Search, filters, sort and page are kept in the URL, e.g. `/products?search=pizza&status=active&category=food&page=2`. That way refresh, back button and sharing a link all work. If someone puts garbage in the URL it just falls back to the defaults. Search has a small debounce so it doesn't fire on every key.

Auth: passwords are hashed with bcrypt. When you log in the server sets an httpOnly cookie with a signed JWT (jose, HS256). It only stores the user id and expires after 8 hours. `proxy.ts` only checks the cookie and redirects, the actual check is `requireUser()` which runs in the layout, on every page and in every server action, and loads the user + role from the db. So if a role changes it applies right away. The login error is the same for wrong email and wrong password.

Permissions are in one file (`lib/permissions.ts`). The UI uses it to hide buttons, and the product service checks it again before every write and throws a `ForbiddenError`. Since the check is in the service, a manager can't delete a product even by calling the action manually. Products belong to the store, not to a specific user, so there's no ownership check, only the role.

Validation is one Zod schema used on the server for both create and edit. Image URL has to be http/https (so no `javascript:` links).

I went with SQLite so the project runs without setting up anything. Moving to Postgres would just be changing the provider in `schema.prisma`, updating `DATABASE_URL` and creating a new migration (search would need `mode: "insensitive"` there, SQLite's LIKE is already case-insensitive). Prices are saved in cents as an integer to avoid float issues. Categories are their own table and the filter uses the slug so the URL stays readable.

Errors: wrong login, invalid form, deleted product, missing permission all show a normal message to the user. A wrong product id shows a not found page. Anything unexpected (db down etc.) is logged and `error.tsx` shows a message with a retry button.

For images I used a plain `<img>` instead of `next/image` because the URL can be from any domain and `next/image` needs every domain whitelisted. If the image doesn't load you get a placeholder instead.

## What I'd add with more time

- image upload (right now it's only a URL)
- toasts / optimistic updates
- a page to manage users
- rate limiting on login
- Docker

## Time spent

Around __ hours.
