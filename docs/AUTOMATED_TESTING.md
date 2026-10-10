# VETXUILT automated test agents

## Agent suites

- **Code/runtime agent**: checks homepage runtime exceptions and local request failures. Static checks are separate commands.
- **Navigation agent**: checks known routes, expected headings, key navigation and internal links.
- **Marketplace workflow agent**: smoke-tests auth forms and marketplace entry points and checks that unfinished features are disclosed. It does not create accounts or mutate production data.
- **Security baseline agent**: checks baseline response headers, 404 behavior, unauthenticated admin UI controls, and that the scaffold payment endpoint does not report a payment as paid.

These are independent automated test suites, not autonomous AI agents. They report observed behavior and do not claim that a workflow is complete simply because its page renders.

## Install and run

```bash
cd /home/suriya/Downloads/vetxuilt
npm install
npx playwright install chromium
npm run lint
npm run typecheck
npm run build
npm run test:agents
npm run test:report
```

The Playwright config starts `next dev` automatically when `PLAYWRIGHT_BASE_URL` is not set. If a dev server is already running on port 3000, stop it first or set `PLAYWRIGHT_BASE_URL` to the server you intend to test. The HTML report is at `playwright-report/index.html`; the chart dashboard is at `test-results/agent-dashboard.html`.

## Supabase and integration tests

The public-route smoke tests can run without Supabase credentials. To test authenticated user flows, use a dedicated Supabase test project and test accounts only. Never put service-role keys in browser-visible `NEXT_PUBLIC_*` variables. Never run destructive tests against production data.

Current starter gaps documented in `FEATURE_STATUS.md` remain gaps: student ID file upload/review edge cases, full bid acceptance UI, milestone UI, delivery upload/accept UI, reviews UI, disputes UI, and real payment processing/webhook verification. Tests for these must remain pending/blocked until implemented and exercised against a sandbox. No test in this suite transfers money.

## Security headers

`next.config.ts` adds baseline browser security headers. This is not a complete security review and does not replace CSP design, dependency auditing, Supabase RLS tests, server-side authorization tests, rate limiting, CSRF analysis, privacy review or penetration testing.

## One-command full run

```bash
npm run test:all
```

The runner executes lint, TypeScript checking, the production build, browser agents, then creates the chart dashboard. It runs checks serially to avoid overloading lower-memory development laptops. It keeps going after an earlier check fails so later results are still collected, and returns a non-zero exit code if any stage fails.
