# Store Panel

A small management panel for an online store. Staff log in, see an overview of the store and manage products (create, edit, change status, delete). Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma and SQLite.

## Requirements

- Node.js 20.9 or newer (tested on Node 22)
- npm 10+

No database server is needed: SQLite stores everything in a single file (`prisma/dev.db`).

## Getting started

```bash
npm install
cp .env.example .env
```

Open `.env` and set `AUTH_SECRET` to a random string. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Environment variables

| Name           | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL` | SQLite connection string. Default `file:./dev.db` (relative to `prisma/`).  |
| `AUTH_SECRET`  | Secret used to sign session cookies. Server-only, never sent to the browser. |

### Database

Create the database and apply the migrations:

```bash
npm run db:migrate
```

### Seed

Load the test users, categories and 24 sample products:

```bash
npm run db:seed
```

The seed is safe to run again. It resets the products and keeps users and categories up to date.
To wipe the database and start over, run `npm run db:reset` (re-applies migrations and seeds).

### Development

```bash
npm run dev
```

Then open http://localhost:3000.

### Build

```bash
npm run build
npm start
```

## Test accounts

| Role    | Email               | Password      |
| ------- | ------------------- | ------------- |
| Admin   | admin@example.com   | `Admin123!`   |
| Manager | manager@example.com | `Manager123!` |

Admins can do everything. Managers can view, create, edit and change the status of products, but can't delete them.

## Testing

```bash
npm test            # unit + integration tests (Vitest)
npm run test:e2e    # end-to-end tests (Playwright)
npm run lint
npm run typecheck
```

- **Unit tests** (`tests/unit`) cover the product validation rules, role permissions and URL query parsing.
- **Integration tests** (`tests/integration`) run the product service against a real SQLite database (`prisma/test.db`, recreated from the migrations on every run). They cover create/update/delete, status changes, filtering, sorting, pagination, and check that a manager can't delete even when calling the server code directly.
- **E2E tests** (`tests/e2e`) log in, open Products, hit the validation errors, create a product, find it by search and delete it. Another test checks that a manager doesn't see the delete action.

The E2E tests start the dev server and use the seeded dev database, so run `npm run db:seed` first. Playwright needs a browser the first time:

```bash
npx playwright install chromium
```

If you already have Chrome installed you can skip the download with `PW_CHANNEL=chrome npm run test:e2e`.

## Project structure

```
prisma/
  schema.prisma        User, Category, Product
  migrations/          SQL migrations
  seed.ts
src/
  proxy.ts             redirects signed-out users to /login
  app/
    login/             login page + login/logout server actions
    (panel)/           everything behind authentication
      dashboard/
      products/        list, details, new, edit + server actions
  components/          UI pieces (form, toolbar, pagination, dialogs…)
  lib/                 validation, permissions, query parsing, formatting, db client
  server/              auth helpers and the product service (all DB access)
tests/
```

## Technical decisions

**Server Components by default.** Pages fetch data directly on the server through `src/server/products.ts`, so there is no client-side data fetching library and no API layer to keep in sync. Client Components are used only where interaction is needed: the forms, the search/filter toolbar, the status toggle and the delete dialog.

**Server Actions for mutations.** Create, update, status change and delete are Server Actions. After a change they call `revalidatePath`, so the list, details page and dashboard update without a manual reload. The product form uses `useActionState` to show server-side validation errors next to each field and keeps what the user typed.

**URL as the state for the product list.** Search, filters, sorting and page live in the query string (`/products?search=pizza&status=active&category=food&page=2`). A view can be shared or refreshed, and the back button works. Invalid values in the URL fall back to defaults instead of breaking the page. Search is debounced. The results sit in a `Suspense` boundary keyed on the query, so a skeleton shows while the next page loads.

**Authentication.** Passwords are hashed with bcrypt. On login the server sets an `httpOnly`, `sameSite=lax` cookie containing a signed JWT (HS256, via `jose`) that holds only the user id and expires after 8 hours. `proxy.ts` does a quick signature check to redirect signed-out visitors. The real check is `requireUser()`, which runs in the panel layout, every page and every Server Action, and loads the user (and role) from the database. If a user's role changes, it takes effect on the next request. Failed logins return the same message whether the email exists or not.

**Authorization in one place.** `lib/permissions.ts` maps roles to actions. The UI uses it to hide buttons. The product service calls it before every write and throws `ForbiddenError` if the role isn't allowed. Because the check lives in the service and not only in the UI or the action, a Manager can't delete a product even by calling the action by hand. Products belong to the store and every staff member works on the same catalog, so there's no per-user ownership to check. Access depends only on being signed in and having the right role.

**Validation.** One Zod schema (`lib/validation.ts`) defines the product rules and runs on the server for both create and edit. Image URLs must be `http(s)`, so `javascript:` URLs are rejected.

**Database.** I picked SQLite so the project runs with `npm install` and no extra setup. Prisma keeps it easy to swap: change the `provider` in `schema.prisma` to `postgresql`, point `DATABASE_URL` at a Postgres database and generate a new migration. (Search on Postgres would also need `mode: "insensitive"`. SQLite's `LIKE` is already case-insensitive for ASCII.) Prices are stored as integer cents (`priceCents`) to avoid floating point rounding. Categories have their own table, and the list filters on the category slug so URLs stay readable.

**Error handling.** Expected errors are handled where they happen: invalid login, field validation, "product no longer exists", forbidden actions. Each one shows a clear message. Unknown product ids render a not-found page. Unexpected errors (for example the database being unavailable) are logged on the server and caught by `error.tsx`, which shows a friendly message and a retry button.

**Images.** Product images are any URL the user enters, so a plain `<img>` is used instead of `next/image` (which needs every remote host listed in the config). If an image fails to load, a placeholder is shown.

## Not included / possible improvements

- Image upload (only image URLs are supported)
- Toast notifications and optimistic updates
- User management UI (users come from the seed)
- Rate limiting on the login endpoint
- Docker setup

## Time spent

About _X_ hours.
