# Synex frontend

Synex is a React 18, Vite, TypeScript, Tailwind CSS, and Framer Motion frontend. It does not use Next.js or the Next.js App Router.

## Source structure

```text
src/
├── components/
│   ├── dashboard/             reusable dashboard presentation
│   └── landing/               reusable landing-page presentation
├── config/                    browser-safe runtime configuration
├── features/platform/
│   ├── context/               platform state providers
│   ├── layouts/               authenticated workspace shell
│   └── services/              typed API client
└── pages/
    ├── dashboard/             authenticated route screens
    └── LandingPage.tsx        public landing route
```

There is intentionally one `src/pages/` root and one `src/components/` root. There is no `src/app/` directory because that name suggests Next.js conventions in a Vite project.

## Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_DEV_AUTH_BYPASS=true` only when you need a populated local dashboard preview without Auth0. Production builds ignore this bypass.

## Auth0 setup

The frontend login needs an Auth0 Single Page Application. Calling the protected Go API additionally needs an Auth0 API audience:

1. Create or select a **Single Page Application** and copy its Domain and Client ID.
2. Create an **API** in Auth0. Its Identifier becomes `VITE_AUTH0_AUDIENCE` and the Go backend's `AUTH0_AUDIENCE`.
3. Add `http://localhost:5173/auth/callback` to Allowed Callback URLs.
4. Add `http://localhost:5173` to Allowed Logout URLs and Allowed Web Origins.

The Auth0 client secret is confidential. Keep it in server-only configuration if a server-side OAuth flow later needs it; never add it to this Vite project under a `VITE_` name.
