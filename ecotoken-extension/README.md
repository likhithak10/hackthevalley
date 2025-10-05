## EcoToken Browser Extension

Optimize prompts to save tokens on sites like ChatGPT 
This repo contains:

- Extension (React + TypeScript + Vite) that injects an "Optimize" button into text inputs
- Minimal backend (`server/server.mjs`) that calls a Snowflake stored procedure to optimize text

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- Chrome or any Chromium-based browser for loading the unpacked extension
- Snowflake account and a key pair (for backend JWT auth)

### Install dependencies

```bash
cd ecotoken-extension
npm install
```

### Configure environment

There are two `.env` files you may set:

- Extension (Vite) `.env` in the project root: controls where the service worker calls the API
- Backend `.env` in `server/.env`: Snowflake credentials and server options

By default the extension calls `http://localhost:3001/api`. Either run the backend on port 3001, or change the extension env to match your backend port.

Create `./.env` (extension) if you need to override the default:

```bash
# ./ecotoken-extension/.env
VITE_API_BASE=http://localhost:3001/api
```

Create `./server/.env` (backend). Example template:

```bash
# ./ecotoken-extension/server/.env
PORT=3001

# Your Snowflake account URL prefix used by the SQL API
SNOWFLAKE_HTTP_ACCOUNT=xxxx-xxxxxx

# Core identity and role settings
SNOWFLAKE_ACCOUNT=MYACCOUNT
SNOWFLAKE_USER=MYUSER
SNOWFLAKE_PUBLIC_KEY_FP=SHA256:YOUR_PUBLIC_KEY_FINGERPRINT
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=ECOTOKEN_DB
SNOWFLAKE_SCHEMA=ECOTOKEN
SNOWFLAKE_LOG_SCHEMA=ECOTOKEN
SNOWFLAKE_ROLE=ACCOUNTADMIN

# Key pair auth
SF_PRIVATE_KEY_PATH=./rsa_key.p8
# SF_PRIVATE_KEY_PASSPHRASE=your-passphrase-if-any

# Optional: tighten CORS in production
# EXTENSION_ID=abcdefg1234567hijklmnopqrstu  # chrome://extensions → Details → ID
# ALLOW_ORIGIN=http://localhost:3001
```

Notes:

- Replace the provided `server/rsa_key.p8`/`rsa_key.pub` with your own key pair in real deployments.
- Ensure your Snowflake account has a stored procedure named `OPTIMIZE` in `SNOWFLAKE_DATABASE.SNOWFLAKE_SCHEMA`.

### Run the backend (API)

```bash
npm run dev:api
# prints: [EcoToken API] http://localhost:3001
```

If you used a different port, update `VITE_API_BASE` accordingly.

### Build the extension

The extension must be built before loading into Chrome.

```bash
npm run build
# output is written to ./build
```

Optional rebuild-on-change during development:

```bash
npx vite build --watch
```

### Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `build` folder

The extension will display an "Optimize" button on supported pages:

- chatgpt.com / chat.openai.com
- www.google.com

Click the button to send the current input to the backend and auto-replace it with the optimized text. The popup UI is served from `index.html` in the build.

### Common issues

- Service worker not responding: refresh the tab or reload the extension. The content script will prompt if the extension context was reloaded.
- 404/Network errors: ensure the backend is running and `VITE_API_BASE` matches the backend port and path (e.g. `http://localhost:3001/api`).
- CORS during local dev: the backend allows non-production origins by default; to harden, set `EXTENSION_ID` and/or `ALLOW_ORIGIN` in `server/.env`.
- No result from optimize: verify your Snowflake `OPTIMIZE` procedure and credentials; see backend logs for errors.

### Scripts

- `npm run dev:api`: start the backend server at the port from `server/.env`
- `npm run build`: type-check then build extension into `build/`
- `npm run preview`: preview Vite output (not used for Chrome loading)

### Project structure

- `src/context.tsx`: content script that injects the Optimize button and communicates with the service worker
- `src/sw.ts`: extension service worker calling the backend API (`VITE_API_BASE`)
- `public/manifest.json`: copied into `build/` during build
- `server/server.mjs`: minimal HTTP server that calls Snowflake SQL API

### Production notes

- Set `NODE_ENV=production` and configure `EXTENSION_ID`/`ALLOW_ORIGIN` for strict CORS.
- Replace test keys with your own, set `SNOWFLAKE_PUBLIC_KEY_FP` correctly, and rotate keys regularly.
