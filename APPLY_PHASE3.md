# Apply SHOP.CO Phase 3 overlay

Requirements: Node.js 20+ and a PostgreSQL database.

This bundle is an overlay, not a standalone copy of the repository. It contains every new or modified file produced for Phase 3 and intentionally omits unchanged project assets/components.

From your real `shop-co-ecommerce` checkout:

```bash
git switch main
git pull
git switch -c feat/commerce-backend-phase-3
```

Then extract/copy the contents of this overlay into the repository root, preserving paths.

After the files are applied:

```bash
npm install

cd server
npm install
# Keep the generated server/package-lock.json in the Phase 3 commit.
cp .env.example .env
# set a real DATABASE_URL
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm test
npm run typecheck
npm run lint
npm run build
cd ..

cp .env.example .env.local
# point NEXT_PUBLIC_API_URL at the API
npm test
npm run typecheck
npm run lint
npm run build
```

Run both apps locally and smoke-test `/`, `/categories`, an existing product slug, cart reconciliation and `/checkout` before pushing.

Do not merge if any quality gate fails.
