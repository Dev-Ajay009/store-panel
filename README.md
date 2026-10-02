# Store Panel

## Requirements

- Node.js 20.9 or newer
- npm

## Installation

```bash
npm install
```

## Environment

```bash
cp .env.example .env
```

- `DATABASE_URL` - SQLite database file (default `file:./dev.db`)
- `AUTH_SECRET` - set any long random text

## Database

```bash
npm run db:migrate
```

## Seed

```bash
npm run db:seed
```

## Development

```bash
npm run dev
```

Open http://localhost:3000

## Testing

```bash
npm test
npm run test:e2e
```

- `npm test` runs unit and integration tests
- Before `npm run test:e2e`, run `npm run db:seed` and `npx playwright install chromium`, and stop `npm run dev`

## Build

```bash
npm run build
npm start
```

## Test Account

- Admin: `admin@example.com` / `Admin123!`
- Manager: `manager@example.com` / `Manager123!`
