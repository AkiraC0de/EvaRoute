# clients/admin — Staff Portal (integrated)

Staff-side frontend, imported from an external repository. This file records
provenance so the integration stays traceable.

## Source

- Repository: https://github.com/mavskiii/staff
- Branch: `main`
- Commit: `b2883ded116d993546a681490e91e8a4a32ebfa7`
  ("Add EvaRoute application project", 2026-10-12)
- Imported via `git archive` (no `.git`, no `node_modules`, no `.env`).

## What was imported

Byte-identical copies of the source tree, except the source `README.md`
(generic Vite template boilerplate) which was intentionally not imported so the
pre-existing `clients/admin/README.md` stayed untouched.

- `index.html`, `vite.config.js`, `eslint.config.js`, `.gitignore`, `.gitattributes`
- `package.json`, `package-lock.json`
- `public/favicon.svg`, `public/icons.svg`
- `src/**` (entry point, routes, components, styles, logo asset)

## Independence

This app has its own `package.json`, lockfile and Vite config. It is not a
workspace member of the repository root (there is no root `package.json`) and
it does not import anything from `clients/Public`.

## Backend contract

As imported, the app made no network requests at all: no `fetch`/`axios`, no
`import.meta.env`, no API base URL, and every figure was in-component mock state.

It is now wired to the existing EvaRoute API for the operations the backend
actually supports for a `FACILITY_STAFF` account. No endpoint was invented and
no backend file was changed.

Connected: sign in, sign out, sign out all devices, session refresh, the staff
member's own facility, and full resource CRUD (list / create / update / delete).

Still not backed by any endpoint (see the audit report for the exact contracts
required): occupancy and check-in/check-out, activity history, staff self-profile
read/edit, and the email-OTP password change flow.

Sessions use `Authorization: Bearer <accessToken>` plus the httpOnly refresh
cookie. `vite.config.js` proxies `/api` to the backend so requests stay
same-origin; the API's CORS headers (`Access-Control-Allow-Origin: *` with
`Access-Control-Allow-Credentials: true`) are rejected by browsers for
credentialed cross-origin requests, so the cookie only works through the proxy.
