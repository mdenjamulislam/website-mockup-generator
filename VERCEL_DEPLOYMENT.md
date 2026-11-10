# Vercel Deployment Guide

This guide details how to deploy the **Mockup Maker** application on Vercel using a two-project architecture connected to the same GitHub repository.

---

## 1. Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │           GitHub Repository            │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
       ┌───────────────────┐                           ┌───────────────────┐
       │     Project 1     │                           │     Project 2     │
       │ Mockup Maker Web  │                           │ Mockup Maker API  │
       ├───────────────────┤                           ├───────────────────┤
       │ Root: client      │                           │ Root: server      │
       │ Framework: Vite   │                           │ Runtime: Node.js  │
       │ Static SPA        │                           │ Serverless Func   │
       └─────────┬─────────┘                           └─────────┬─────────┘
                 │                                               │
                 │              API Calls & Render               │
                 └───────────────────────────────────────────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │     Supabase      │
                               │  (DB unchanged)   │
                               └───────────────────┘
```

- **Project 1 (Frontend)**:
  - **Root Directory**: `client`
  - **Framework Preset**: Vite
  - **Hosting**: Vercel Static Hosting (with SPA rewrites)
  - **Environment Variables**: `VITE_API_BASE_URL`

- **Project 2 (Backend)**:
  - **Root Directory**: `server`
  - **Framework Preset**: Other
  - **Hosting**: Vercel Serverless Functions (`@vercel/node`)
  - **Browser Runtime**: `@sparticuz/chromium` + `playwright-core`
  - **Environment Variables**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_ORIGIN`, `SCREENSHOT_TIMEOUT_MS`

---

## 2. Project 1: Frontend Deployment (`client`)

### Step-by-Step Instructions

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
2. Select your `mockup-maker` GitHub repository.
3. In **Project Configuration**:
   - **Project Name**: `mockup-maker-client` (or your preferred name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `client`
   - **Build Command**: `npm run build` (or leave default `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. In **Environment Variables**, add:
   | Key | Value | Description |
   | --- | --- | --- |
   | `VITE_API_BASE_URL` | `https://<your-backend-project>.vercel.app` | The production URL of Project 2 (Backend) |
5. Click **Deploy**.

> [!NOTE]
> The `client/vercel.json` file is already preconfigured to route all routes (such as `/export`) to `index.html` so the React SPA functions properly when Playwright loads the export page.

---

## 3. Project 2: Backend Deployment (`server`)

### Step-by-Step Instructions

1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..." > "Project"**.
2. Import the **same** `mockup-maker` repository.
3. In **Project Configuration**:
   - **Project Name**: `mockup-maker-server` (or your preferred name)
   - **Framework Preset**: `Other`
   - **Root Directory**: Click **Edit** and choose `server`
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty / default
   - **Install Command**: `npm install`
4. In **Environment Variables**, configure the following variables:
   | Key | Example Value | Description |
   | --- | --- | --- |
   | `FRONTEND_ORIGIN` | `https://<your-frontend-project>.vercel.app` | Production origin of the client app (used for CORS and export rendering) |
   | `SUPABASE_URL` | `https://xxxx.supabase.co` | Your Supabase project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role key (kept strictly private on server) |
   | `SCREENSHOT_TIMEOUT_MS` | `60000` | Screenshot capture timeout in milliseconds (default: 60000) |
   | `NODE_ENV` | `production` | Node environment |
5. Click **Deploy**.

---

## 4. Required Dependencies & Chromium Configuration

### Dependencies in `server/package.json`

- **`playwright-core`**: Core browser automation client without pre-bundled browser binaries.
- **`@sparticuz/chromium`**: Lightweight Chromium binary packaged specifically for AWS Lambda / Vercel Serverless (uncompressed size: ~63 MB, well under Vercel's 250 MB limit).
- **`playwright`**: Used for local development on Windows / macOS / Linux with full local browser binaries.

### Runtime Selection Logic (`server/src/services/browserService.ts`)

The backend automatically detects the environment:
- **On Vercel Serverless (`process.env.VERCEL`)**:
  Dynamically imports `@sparticuz/chromium` and `playwright-core`, using the serverless-optimized Chromium binary.
- **On Local Development**:
  Dynamically imports local `playwright`, preserving Windows compatibility with no manual flags needed.

### Function Configuration (`server/vercel.json`)

The server configuration reserves memory and execution time needed for rendering:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ],
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 60,
      "includeFiles": "node_modules/@sparticuz/chromium/**"
    },
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 60,
      "includeFiles": "node_modules/@sparticuz/chromium/**"
    }
  }
}
```

---

## 5. Summary of Exact Vercel Project Settings

### Frontend (`client`)
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Environment Variables**:
  - `VITE_API_BASE_URL` = `https://<backend-project-url>.vercel.app`

### Backend (`server`)
- **Root Directory**: `server`
- **Framework Preset**: `Other`
- **Build Command**: `npm run build`
- **Output Directory**: *(blank / default)*
- **Install Command**: `npm install`
- **Environment Variables**:
  - `FRONTEND_ORIGIN` = `https://<frontend-project-url>.vercel.app`
  - `SUPABASE_URL` = `https://<your-project>.supabase.co`
  - `SUPABASE_SERVICE_ROLE_KEY` = `<your-service-role-key>`
  - `SCREENSHOT_TIMEOUT_MS` = `60000`
  - `NODE_ENV` = `production`

---

## 6. Troubleshooting

1. **CORS Error on Frontend**:
   - Ensure `FRONTEND_ORIGIN` in the backend matches the exact URL of your Vercel frontend without a trailing slash (e.g., `https://mockup-maker-client.vercel.app`).
   - If using preview deployments, you can set `FRONTEND_ORIGIN=*` or include comma-separated preview domains.

2. **Export Rendering Fails in Production**:
   - Ensure `FRONTEND_ORIGIN` is configured in the backend environment variables so Playwright navigates to `https://<frontend-project-url>.vercel.app/export`.
   - Verify that `client/vercel.json` exists so `/export` correctly rewrites to `index.html`.

3. **Function Timeout on Complex Websites**:
   - Vercel functions on the Pro plan can run up to 300s. The default in `server/vercel.json` is configured to `60` seconds. Adjust `maxDuration` in `server/vercel.json` if needed.
