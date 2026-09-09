# NDAI website

The current ndai.pro site is maintained in `public/`. Root-level HTML and images are older repository history and are not deployed.

- `npm ci` installs development tools.
- `npm run build` validates `public/` and creates `dist/` with content-addressed assets.
- `npm run dev` builds and serves the site at http://127.0.0.1:8934.
- `npm test` runs Chromium and WebKit checks. Install WebKit with `PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install webkit` if needed. Chromium tests use installed Google Chrome.
- `node scripts/optimize-assets.mjs` regenerates optimized versions of the existing imagery and the sharing image. Font licenses are included beside the self-hosted font files.

Vercel project: `nd-ai/site`, ID `prj_ONu2WuiHapUj6PND3kFGo0cAewpp`. The configured output directory is `dist/`; do not deploy the legacy root as static output.

Form submissions use the existing FormSubmit recipient, andrew@ndai.pro. Tests intercept submissions; they do not send email. The interface confirms success only after the provider accepts a request, not after a URL parameter. Provider acceptance is not proof of inbox delivery.

Production analytics use Vercel Web Analytics and Speed Insights. Custom events contain fixed interaction names and public service/project labels, never form values. URLs are stripped of query strings and fragments. Analytics do not load on localhost/preview domains or when DNT/GPC is enabled.

Customer testimonials, outcome statistics, client screenshots and case studies are intentionally deferred until Andrew supplies approved material.
