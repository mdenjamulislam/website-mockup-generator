# Website Mockup Makers

A production-ready web application that takes any URL, renders it in a real Chromium browser via Playwright, and composites the screenshot into customizable, high-resolution device mockups (PNG or WebP) using Sharp.

## Features
- **No Database / Stateless**: All image rendering and manipulation happen completely in RAM using `multer.memoryStorage()`.
- **Instant Previews**: HTML/CSS based preview canvas scales automatically without triggering unnecessary server renders.
- **High-Quality Export**: Final composite images are rendered using Sharp for lossless pixel perfection.
- **SSRF Hardened**: Extensive private IP blocking and in-browser network interceptors ensure the server cannot be used to probe internal networks.

---

## 1. Local Development

You will need Node.js 20+ installed.

```bash
# Install dependencies for root, client, and server
npm run install:all

# Ensure playwright Chromium binaries are installed
cd server && npx playwright install chromium

# Start both frontend and backend concurrently
npm run dev
```
The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3001`.

---

# Build for production
npm run build

# Start production server
npm run start

# Lint all
npm run lint
```

## 2. Environment Configuration

You can configure the backend via environment variables.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port for the Express server. |
| `NODE_ENV` | `development` | Set to `production` to enable static file serving and strict CORS. |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed CORS origins. |
| `MAX_SCREENSHOT_WIDTH` | `1920` | Maximum allowed width for website capture. |
| `MAX_SCREENSHOT_HEIGHT` | `2160` | Maximum allowed height for website capture. |
| `SCREENSHOT_TIMEOUT` | `15000` | Playwright navigation timeout in milliseconds. |

---

## 3. Docker Development

You can build and run the application entirely within Docker.

```bash
docker-compose up --build
```
This will build the multi-stage Dockerfile and run the application at `http://localhost:3000`.

---

## 4. Production Docker Deployment

The included `Dockerfile` uses `mcr.microsoft.com/playwright` as the base image. This ensures all system-level dependencies for Chromium are present. The build is split into stages to keep the final image as clean as possible.

In production (`NODE_ENV=production`), the Express backend automatically serves the compiled Vite static assets, meaning you only need to expose a single port (`3000`).

```bash
# Run in detached mode
docker-compose up -d --build
```

---

## 5. API Endpoints

### `GET /api/health`
Returns a 200 OK status. Used for Docker health checks.

### `POST /api/screenshot`
Captures a raw screenshot of a URL.
**Body:** JSON
```json
{
  "url": "https://example.com",
  "width": 1440,
  "height": 900,
  "fullPage": false
}
```

### `POST /api/mockup/render`
Composites a screenshot into a device frame.
**Body:** `multipart/form-data`
- `screenshot`: The image blob.
- `format`: `"png"` or `"webp"`.
- `config`: JSON string representing the MockupConfig.

---

## 6. Security Considerations

This application is hardened for public, unauthenticated access:
- **SSRF Protection**: Node.js DNS validation combined with Playwright network interception (`page.route('**/*')`) prevents access to localhost, private IP ranges (RFC 1918), and DNS rebinding attacks.
- **Browser Isolation**: Playwright is launched with restricted capabilities (`--no-sandbox`, `--disable-dev-shm-usage`, etc.).
- **Input Validation**: All API inputs are strictly validated using Zod. Dimensions are capped to prevent Server Out-of-Memory (OOM) crashes via Sharp.
- **Rate Limiting**: An in-memory rate limiter (100 reqs / 15 mins) prevents abuse.
- **Error Masking**: Internal stack traces are suppressed when `NODE_ENV=production`.

---

## 7. Troubleshooting Playwright/Chromium

- **"Browser Type is not supported" or missing dependencies**: Ensure you are using the official `mcr.microsoft.com/playwright` Docker image. Alpine-based Node images lack the necessary shared libraries (e.g., `libnss3`, `libasound2`) to run Chromium.
- **Out of Memory (OOM)**: If the container crashes, ensure you have allocated at least 1GB of RAM to the Docker engine. Sharp image composition and headless Chromium are memory-intensive.
