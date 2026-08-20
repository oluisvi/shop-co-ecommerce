# Final Evolution Deployment Checklist

## Supabase

- [x] Apply the two additive Prisma migrations and verify their checksums/history; no reset, push, or seed was used.
- [x] Verify 12 products, 23 variants/inventories, and 4 existing orders/items/addresses were preserved.
- [x] Enable RLS and revoke all direct `anon`/`authenticated` DML on commerce tables.
- [x] Create the public-read `shopco-products` image bucket with 8 MB and image MIME restrictions. Upload remains server/service-role only.
- [ ] Configure the production Site URL and exact HTTPS redirects for sign-up and `/auth/update-password` in Supabase Auth.
- [ ] Assign the intended owner profile `SELLER` after that owner signs up; no public promotion endpoint exists.

## Render API

- [ ] Change the service branch from `feat/commerce-backend-phase-3` to `main` while keeping root `server`, build `npm ci --include=dev && npm run build`, and start `npm start`.
- [ ] Set exact `FRONTEND_URLS`, Supabase server values, bucket, and Stripe test secrets; preserve the existing `DATABASE_URL`.
- [ ] Confirm deployed commit `10eda5f21aba7052cdea32209914783d159765c8`; `/products` currently works but final account/checkout routes still return 404 on old commit `086e17a`.

## Stripe test mode

- [ ] Register `POST https://shop-co-ecommerce-0i1i.onrender.com/webhooks/stripe` for `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`.
- Exercise successful, cancelled, failed/expired, and duplicate-delivery scenarios.
- Confirm success redirect alone does not pay an order; stock finalizes only after the webhook and releases on expiry/failure.

## Vercel

- [x] Production commit `10eda5f21aba7052cdea32209914783d159765c8` is deployed and the API/site URL values are present.
- [ ] Set/correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production; the current sign-in page reports that authentication is not configured.
- Never create a `NEXT_PUBLIC_*` service-role or Stripe secret value.
- Redeploy only after the API migration and Stripe test webhook are ready.

## Release smoke test

- [x] Public homepage/product desktop and mobile smoke: content present, no framework overlay/console errors, no horizontal overflow, Product JSON-LD present.
- [x] `/studio` redirects an unauthenticated visitor to sign-in.
- Verify sign-up/sign-in/reset/update/account order history.
- Verify seller create/upload/archive/stock and paid-order fulfillment.
- Run all commands in the README verification section and record results in the PR.
