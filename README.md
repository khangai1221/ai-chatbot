This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploying to Vercel with Neon (Postgres)

This project uses Prisma. To deploy on Vercel with a Neon Postgres database:

1. Create a Neon Postgres database at https://neon.tech and copy the connection string.
2. In your Vercel project settings, add an environment variable named `DATABASE_URL` with the Neon connection string.
3. Also add any other secrets (for example `GEMINI_API_KEY`) in Vercel's Environment Variables.
4. Ensure Prisma reads the `DATABASE_URL` from `prisma.config.mjs` (this repo includes a config that reads `process.env.DATABASE_URL`).
5. During the Vercel build you may need to run:

```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

Vercel will run `npm run build` by default; you can add a build hook or a custom `vercel` build script if you'd like these Prisma commands to run automatically. Alternatively run them manually from your CI or locally before deploying.

Note: the repo contains simple on-disk user/session stores under `data/` for quick local auth. For production, replace those with a proper DB-backed implementation and secure session storage.
