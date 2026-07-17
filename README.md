# Housing Price Prediction — Portal

React + Vite single-page portal for the [Housing Price Prediction API](https://github.com/kimboyeme-maker/housing-price-predit).
Three cross-linked pages backed by TanStack Query + Router.

## Stack

- **Vite + React 19 + TypeScript**
- **TanStack Router** (code-based) · **TanStack Query** (server state)
- **Tailwind CSS v4** + shadcn-style component library
- **Recharts** for charts · **Zod** for form validation
- **aube** package manager

## Pages

| Route        | What it does                                                             |
| ------------ | ------------------------------------------------------------------------ |
| `/` → `/dashboard` | Model metrics, health badge, coefficient chart; links to the others |
| `/predict`   | Validated feature form → prediction + contribution chart, history, compare |
| `/model`     | Full coefficients table + chart, metrics, training stats                 |

All three pages link to each other. Prediction history is persisted in `localStorage`;
selecting rows opens a side-by-side comparison.

## API contract

The client (`src/api/client.ts`) reads the backend gateway headers on every response and
normalises failures into `{ requestId, errorCode, errorMessage }`. Error codes map to localised
shadcn-style toast/panel messages; unknown codes use an i18n fallback. The requestId remains visible
for support. Base URL comes from `VITE_API_URL` (default `/api`).

## Local development

Uses [aube](https://github.com/jdx/aube) (installed via mise). Start the backend on `:8000`
first (see the backend repo), then:

```bash
aube install
aube run dev        # http://localhost:5173  (proxies /api → http://localhost:8000)
```

Point the dev proxy elsewhere with `VITE_API_TARGET=http://host:port aube run dev`.

Lint / build:

```bash
aube run lint
aube run build
```

> The project pins `advisoryCheck = off` in `.config/aube/config.toml` because aube's local
> advisory DB false-flags mainstream packages (e.g. `@tanstack/react-router`).

## Deployment

### Netlify (primary)

Import the repo; Netlify uses `netlify.toml`. Set the project env var
`VITE_API_URL` to the HTTPS backend prefix:

```text
VITE_API_URL=https://hk.vps.kaeo.app/api
```

The client appends `/health`, `/model-info`, and `/predict`, producing URLs such as
`https://hk.vps.kaeo.app/api/health`. Vite injects this value at build time, so changing it requires
a new Netlify deployment; changing the variable does not modify an already-built JavaScript bundle.

For the GitHub Actions Netlify job, configure:

- Repository variable `NETLIFY_SITE_ID`
- Repository variable `VITE_API_URL`
- Repository secret `NETLIFY_AUTH_TOKEN`

The backend must allow the exact Netlify origin through `HPP_CORS_ORIGINS`. Do not include a path
in the CORS origin: use `https://your-site.netlify.app`, not
`https://your-site.netlify.app/some/path`.

Because Netlify serves the portal over HTTPS, its browser code cannot call an HTTP backend. Use a
TLS-enabled API URL; `.app` domains additionally force HTTPS through browser HSTS preload.

### Docker (self-host)

Multi-stage build (aube build → nginx). For a local full-stack demo with the published
backend image:

```bash
docker compose up --build     # web → http://localhost:8080, api → http://localhost:8000
```
