# VETXUILT — Student Project Marketplace

A full-stack starter for a student-first freelance/project collaboration marketplace, built with **Next.js App Router, TypeScript, and Supabase**.

## Included

- Responsive dark/cyan startup landing page
- Email/password signup and login using Supabase Auth
- Profile editor for college, course, skills, portfolio and role
- Student verification submission/review workflow
- Project marketplace with search and category filtering
- Project posting (authenticated; database policy requires verified student)
- Dashboard with user's project briefs and verification status
- Basic project messages constrained by participant RLS
- Admin verification queue (database role check)
- SQL schema for bids, milestones, deliveries, reviews, payments and reports
- Private storage buckets/policies for student documents and project files
- Payment route scaffolding that explicitly refuses to pretend money movement works
- Environment template and deployment notes

## Important status

This is a **starter codebase**, not a fully production-ready marketplace. The database schema includes bidding, milestones, delivery, reviews, payments and reports, but the user interface currently implements the landing page, auth, profile, verification submission, project browsing/posting, dashboard, basic messaging and verification admin queue. Detailed bid acceptance, milestone management, delivery upload, review forms, dispute resolution, and real payment processing remain implementation tasks. The payment endpoints return 501/503 until a provider integration is properly built and verified.

The demo marketplace contains clearly illustrative sample projects until Supabase has live open projects. Do not advertise sample projects as real jobs.

## Requirements

- Node.js 20.9+ (Node 22 LTS recommended)
- npm
- A Supabase project

## 1. Install

```bash
unzip vetxuilt.zip
cd vetxuilt
npm install
cp .env.example .env.local
```

## 2. Configure Supabase

1. Create a project at https://supabase.com/dashboard.
2. Open **Project Settings → API**.
3. Copy the project URL and publishable/anon key into `.env.local`.
4. In **SQL Editor**, run `supabase/migrations/0001_initial_schema.sql`.
5. Then run `supabase/migrations/0002_storage_buckets.sql`.
6. In **Authentication → URL Configuration**, set Site URL to `http://localhost:3000` and add redirect URL `http://localhost:3000/auth/callback`.
7. In **Authentication → Providers**, enable Email. For a real launch, keep email confirmation enabled and configure SMTP.
8. Restart Next.js after editing `.env.local`.

Example `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAILS=admin@example.com
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
PAYMENT_WEBHOOK_SECRET=
```

Use the Supabase **publishable/anon key** in the browser. Never use `service_role` or a secret key in `NEXT_PUBLIC_*` or commit it to Git.

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

Production build check:

```bash
npm run build
npm start
```

## 4. Create an admin

1. Register an account normally.
2. Confirm the email and log in once, so the profile row exists.
3. In Supabase SQL Editor, run this with your own account email:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL';
```

4. Visit `/admin`.

Only do this for a trusted administrator. The database role is the actual control; hiding the admin URL is not security.

## 5. Student verification storage

The verification form records a **private storage path**, not the document bytes. The private `student-documents` bucket and starter RLS policies are created by migration 0002. Before production, build a signed-in upload component that:
- Uploads to `student-documents/<auth.uid()>/<safe-file-name>`
- Enforces file size/type on both client and server where possible
- Avoids public URLs for ID documents
- Provides admin-only, time-limited access for review
- Defines retention/deletion rules and consent text

The current form is a workflow scaffold and must not be treated as completed identity verification.

## 6. Payments

No real payment is processed by this repository. The `/api/payments/create-order` and `/api/payments/webhook` endpoints intentionally return 501/503.

Before real payments:
1. Choose a provider available for your business and jurisdiction (for example, a supported Indian payment gateway).
2. Implement server-side order creation using secret credentials stored only in deployment environment variables.
3. Verify signed webhooks server-side, including event type, order ID, amount, currency, and idempotency.
4. Only then update payment records; never accept `paid=true` from the browser.
5. Build refunds, disputes, reconciliation, receipts, terms, and a clear milestone-release policy.
6. Confirm provider terms permit the intended marketplace / split-payment flow. Do not assume an ordinary UPI transfer is escrow.

## 7. Deploy to Vercel

1. Push this repository to a private/public GitHub repo.
2. Import it at https://vercel.com/new.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, and only any server secrets you have implemented.
4. Set `NEXT_PUBLIC_SITE_URL` to the production domain, e.g. `https://vetxuilt.com`.
5. In Supabase Auth URL Configuration, set the production Site URL and add `https://YOUR_DOMAIN/auth/callback` to allowed redirects.
6. Deploy and test signup, confirmation, login, profile, RLS, and project posting with separate client/developer accounts.

## 8. Suggested implementation order

1. Add secure private file upload and profile photo upload.
2. Add bid creation, bid list and atomic accept-bid database function.
3. Add project workspace and milestone CRUD.
4. Add delivery upload, revision requests, completion state transitions.
5. Add reviews with database validation that the project is completed and reviewer is a participant.
6. Complete provider orders/webhooks/refunds only after legal/provider review.
7. Add report triage, dispute handling, moderation and rate limits.
8. Add automated tests for RLS and user journeys.

## Routes

- `/` — landing page
- `/projects` — marketplace
- `/post-project` — create a project
- `/signup`, `/login` — authentication
- `/dashboard` — signed-in dashboard
- `/profile` — profile editor
- `/verification` — student verification submission
- `/messages` — project messaging scaffold
- `/how-it-works` — flow overview
- `/trust` — trust and safety
- `/admin` — admin verification queue

## Data model

The SQL migrations define profiles, student_verifications, projects, bids, milestones, messages, deliveries, reviews, payment_records, reports, plus row-level security policies and private storage buckets.

## Production checklist

- [ ] Update terms, privacy, refunds, academic integrity and community standards
- [ ] Set up SMTP and email deliverability
- [ ] Test RLS policies with multiple real test accounts
- [ ] Build and test secure uploads and signed document access
- [ ] Implement full bid/milestone/delivery/review screens
- [ ] Implement payment provider + webhook verification
- [ ] Add abuse controls, moderation, logs and backups
- [ ] Verify accessibility, mobile UX and deployment redirects
