# M-TECH Application v36

Production source repository: `johnsonmulbahe-oss/mtech-website`
Production branch: `main`
Supabase project: `vsirepejlaytbqhhikev` (ACTIVE_HEALTHY during v36 audit)

## Architecture confirmed
- Public M-TECH website at `/`
- Customer application at `/app/`
- Secure administration at `/admin/`
- Cloudflare Pages Functions under `/functions/api/`
- Admin APIs require the Cloudflare `DB` binding
- Customer service-request flow uses the M-TECH Supabase backend and active Edge Functions

## Deployment rule
GitHub is the source-control platform. The full application must be deployed to Cloudflare Pages (or an equivalent serverless platform capable of running the repository Functions). GitHub Pages alone is not a complete production host for the Admin APIs.

## v36 source and routing corrections
- Added `/admin/index.html` so `/admin/` has a valid secure entry point.
- Added Cloudflare Pages `_redirects` for Admin and application clean routes.
- Legacy QR routes now redirect to the production-safe v36 QR generator.
- Updated deployment documentation to match the actual full-stack architecture.
- Removed old GitHub Pages subfolder assumptions from PWA launch paths.
- Updated website fallback links to use the active production origin.
- Refreshed the service-worker cache version so installed devices receive v36 files.

## v36 browser/security corrections
- CSP now permits only the approved M-TECH Supabase endpoint and required Supabase/QR script CDNs.
- Customer camera and microphone use are permitted on the M-TECH origin while geolocation remains disabled.
- Supabase-hosted request photos/audio/video can be displayed securely.
- Admin/API responses receive no-cache/noindex protections.
- Framing, MIME sniffing and unsafe object embedding protections remain enabled.

## v36 Supabase/backend hardening completed
- Supabase project verified healthy and active.
- Customer `mtech-submit` Edge Function verified active.
- Browser application verified to use a publishable key, not a service-role secret.
- Removed anonymous execution from non-public SECURITY DEFINER RPCs.
- Kept only token/code-scoped customer functions intentionally public.
- Blocked direct API execution of database trigger helpers and internal number generators.
- Blocked the older insecure job-completion RPC and unrestricted customer-duplicate lookup from client execution.
- Restricted financial job profitability to CEO/Owner/Admin/Finance/Manager roles.
- Restricted CEO dashboard financial snapshot to management/finance roles.
- Restricted system-health and smart-task helpers to authorized M-TECH roles.
- Public request creation must pass through the validated Edge Function rather than direct authenticated client RPC.
- Fixed the marketplace compliance trigger search_path warning.
- Added indexes to the principal request, job, quotation, invoice, payment, receipt, notification, marketplace, user-access and service-catalog foreign keys.

## Intentional public token-based functions
The following customer-facing flows remain callable without signing in because they require unguessable tracking/public/invite/certificate tokens or paired order credentials:
- Customer portal/status
- Public quotation, invoice and receipt viewing
- Customer quotation response
- Secure job-completion confirmation
- User invite/access-request lookup and submission
- Certificate verification
- Marketplace order status

These may still appear as SECURITY DEFINER warnings in automated advisors because the advisor cannot determine the product-level token requirement.

## Remaining production certification requirements
- Cloudflare Pages project connected to `main`
- Cloudflare `DB` binding configured and Admin database schema present
- `ADMIN_SETUP_SECRET` configured securely before initial Admin setup
- Admin setup/login/session/logout verified on the live Cloudflare origin
- Dashboard CRUD permissions verified with actual authorized roles
- Customer request submission, media upload and tracking verified end-to-end on the production origin
- Mobile/PWA install, QR scan, camera, microphone and offline/cache behavior verified on real iPhone/Android devices
- Supabase Auth leaked-password protection should be enabled in project Auth settings when available
- Remaining performance-advisor RLS-policy optimization and lower-priority foreign-key indexes can be completed without changing business behavior

Do not mark production fully launched until the Cloudflare/runtime checks pass on the actual production origin.
