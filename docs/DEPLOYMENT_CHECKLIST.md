# Final Evolution Deployment Checklist

## Supabase

- Create/confirm the private product-image bucket and keep the service-role key on Render only.
- Configure the production Site URL and exact HTTPS redirects for sign-up and `/auth/update-password`.
- Apply `npm --prefix server run prisma:migrate:deploy`; do not reset or reseed production.
- Assign the owner profile `SELLER` through a trusted database/server operation; no public promotion endpoint exists.

## Render API

- Set `DATABASE_URL`, exact `FRONTEND_URLS`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- Build with `npm install && npm run build` from `server`; start with `npm start`.
- Confirm `/products` works and protected `/studio/*` rejects missing/customer tokens.

## Stripe test mode

- Register `POST https://<api-host>/webhooks/stripe` for Checkout completion, async success/failure, and expiration events.
- Exercise successful, cancelled, failed/expired, and duplicate-delivery scenarios.
- Confirm success redirect alone does not pay an order; stock finalizes only after the webhook and releases on expiry/failure.

## Vercel

- Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL=https://shop-co-store.vercel.app`.
- Never create a `NEXT_PUBLIC_*` service-role or Stripe secret value.
- Redeploy only after the API migration and Stripe test webhook are ready.

## Release smoke test

- Browse home/catalog/product/sold archive on desktop and mobile, including reduced motion/save data.
- Verify sign-up/sign-in/reset/update/account order history.
- Verify seller create/upload/archive/stock and paid-order fulfillment.
- Run all commands in the README verification section and record results in the PR.
