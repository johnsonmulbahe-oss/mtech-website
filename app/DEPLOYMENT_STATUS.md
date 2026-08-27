# M-TECH Application v36

Production source repository: `johnsonmulbahe-oss/mtech-website`
Production branch: `main`

## Architecture confirmed
- Public M-TECH website at `/`
- Customer application at `/app/`
- Secure administration at `/admin/`
- Cloudflare Pages Functions under `/functions/api/`
- Admin APIs require the Cloudflare `DB` binding
- Customer service-request flow uses the configured M-TECH Supabase backend where implemented

## Deployment rule
GitHub is the source-control platform. The full application must be deployed to Cloudflare Pages (or an equivalent serverless platform capable of running the repository Functions). GitHub Pages alone is not a complete production host for the Admin APIs.

## v36 corrections
- Added `/admin/index.html` so `/admin/` has a valid entry point.
- Added Cloudflare Pages `_redirects` for Admin and application clean routes.
- Corrected deployment documentation to match the actual full-stack architecture.

## Certification still required
- Cloudflare Pages project connected to `main`
- `DB` binding configured and database schema present
- Admin setup/login/session/logout verified live
- Dashboard CRUD permissions verified
- Customer request submission and tracking verified
- Mobile/PWA and key navigation routes verified on production origin

Do not mark production fully launched until these checks pass on the actual Cloudflare Pages deployment.
