This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `BETTER_AUTH_SECRET` — a random secret for signing auth tokens (generate with `openssl rand -hex 32`)
- `DATABASE_URL` — PostgreSQL connection string
- `EMAIL_USER` / `EMAIL_PASS` — SMTP credentials for sending welcome emails

### 3. Run database migrations

```bash
npm run db:push
```

### 4. Seed the admin user

```bash
npm run seed
```

This creates an admin account with:
- **Email:** `admin@dropoff.com` (or `ADMIN_EMAIL` env var)
- **Password:** auto-generated and printed to console (or `ADMIN_PASSWORD` env var)

Save the password — it won't be shown again.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 6. Access the admin panel

Sign in with the admin credentials from step 4. The "Admin" link will appear in the header.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
