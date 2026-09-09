# Production baseline recovered September 9, 2026

The local checkout at `Documents/ndai-site` contained unrelated changes and an older site. GitHub main was `78654792b18a41454696085259ba53f58b9a1e1b` (April 22). Neither was used as the design baseline.

The release started with every static file retrieved through the authenticated Vercel source API from production deployment `dpl_E4hxvrkrYs4B3zEDBnc1BUhC1JRW` (`site-7bdc9x22k-nd-ai.vercel.app`, July 8).

The recovered homepage and live `https://ndai.pro/` response matched byte for byte:

`SHA256 2cc681c7070d540eb21358bffbd1bf06b757ec5109d2e6a74d1e5ac9ecc8fcd3`

The deployment contained only static files and a Build Output API configuration with `version: 3`. The missing clean-URL configuration explains the audited `/privacy` 404 even though `privacy.html` existed.

The saved checkout's unrelated edits were left untouched. This isolated release preserves the original site identity and sections, adds technical and usability improvements, and restores a reproducible source/deployment path.

Customer evidence remains a subsequent owner-supplied content task. No customer records, invented metrics, or invented testimonials were added.
