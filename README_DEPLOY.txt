M-TECH WEBSITE + APPLICATION — PRODUCTION DEPLOYMENT NOTES

Business: M-TECH / Mulbah Technology Solution Liberia Ltd.
CEO & Founder: Mulbah E. Johnson
Contacts: 0773330241 | 0555387355
Email: mtechsolution2005@gmail.com

ARCHITECTURE
This repository now contains more than a static marketing website. It includes:
- Main public M-TECH website at /
- Customer application area at /app/
- Secure administration area at /admin/
- Cloudflare Pages Functions under /functions/api/
- Admin authentication/session/management APIs
- Customer request workflows that also use the configured M-TECH Supabase backend

PRODUCTION HOSTING REQUIREMENT
Use Cloudflare Pages (or an equivalent platform that executes the Functions runtime). GitHub remains the source-control repository, but GitHub Pages alone is NOT sufficient for the full application because it cannot execute /functions/api routes.

CLOUDFLARE PAGES DEPLOYMENT
1. Sign in to the Cloudflare account dedicated to M-TECH.
2. Go to Workers & Pages and create/connect a Pages project.
3. Connect GitHub repository: johnsonmulbahe-oss/mtech-website.
4. Production branch: main.
5. For this static + Functions repository, do not set an unnecessary framework build command unless Cloudflare requires one for the selected project mode.
6. Deploy the repository root as the site output.
7. Configure the required Cloudflare bindings/environment values before certifying Admin features.
8. Confirm the D1 database binding is named DB because the Admin Functions read env.DB.
9. Verify all required database tables/migrations and administrator setup have been completed.
10. Attach the approved custom domain only after the pages.dev deployment passes certification.

PRIMARY ROUTES
- /                 Main M-TECH website
- /app/             Customer application entry
- /admin/           Secure Admin entry (redirects to login)
- /admin/login      Admin sign-in
- /admin/dashboard  Admin dashboard
- /admin/setup      Initial secure administrator setup

ROUTING
The repository includes _redirects so Cloudflare Pages resolves the clean Admin and application routes correctly.

SECURITY
- Keep the M-TECH Cloudflare/GitHub accounts separate from unrelated businesses and systems.
- Never place Admin passwords, D1 secrets, service-role keys or private API credentials in public HTML/JavaScript or repository documentation.
- Admin authentication uses server-side Functions, HttpOnly Secure cookies and the DB binding.
- Admin pages are marked noindex/nofollow.
- Complete production verification of authentication, authorization, database bindings and session expiry before giving staff access.

DEVICE SUPPORT
- Responsive layouts for phones, tablets, laptops, desktops, foldables and wide displays.
- iPhone/iPad safe-area and app-like presentation support where implemented.
- Touch-friendly controls and mobile form sizing are retained.

PUBLIC WEBSITE QA BASELINE
- Main HTML structure checked for duplicate IDs in the prior QA pass.
- Internal navigation anchors and local asset references were checked in the prior QA pass.
- Official M-TECH contacts remain 0773330241 | 0555387355 | mtechsolution2005@gmail.com.

CURRENT STATUS — v36 DEPLOYMENT CORRECTION
- Source repository confirmed active on branch main.
- Customer /app entry exists.
- Admin frontend exists.
- Admin backend Functions exist.
- /admin/ entry redirect added.
- Cloudflare _redirects added for clean Admin/app routes.
- Full production launch still requires a working Cloudflare Pages project with required bindings and live-route certification.

Do not describe the complete application as successfully launched until those production checks pass.
