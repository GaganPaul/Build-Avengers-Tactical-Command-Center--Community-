# Avengers Tactical Command Center

The React/Vite interface and FastAPI backend are deployed together as one Render web service. Supabase stores heroes, teams, and missions; JARVIS uses Google's Gemini API with `gemini-3.5-flash-lite`.

## Configure Supabase

1. Open [Supabase](https://supabase.com/dashboard) and create or select your project. Wait until its database has finished starting.
2. Open **SQL Editor → New query**, paste/run the contents of [`supabase/schema.sql`](./supabase/schema.sql), and confirm it finishes successfully. It creates/seeds the tables and RPC functions and restricts database access to the backend service role.
3. This schema also removes the broad `"classroom demo access"` policies from the SQL you shared. If you already ran that earlier SQL, it is still safe to run [`supabase/lockdown.sql`](./supabase/lockdown.sql) separately; it reapplies those restrictions.
4. Open **Project Settings → API**. Copy the **Project URL** into `SUPABASE_URL` and the **service_role / secret key** into `SUPABASE_SERVICE_ROLE_KEY`. Never use the anon/publishable key for this backend, paste a secret into frontend code, or commit it.
5. In **Table Editor**, confirm `heroes` has 6 rows and `missions` has 3 rows. The app expects the supplied hero and mission names.

The backend uses the Supabase service role to read and write because the browser has no authenticated user session. Consequently, the app does not currently have per-user authentication: anyone who can reach the deployed API can use its demo features. Add authentication/rate limiting before using it with private data or unrestricted public traffic.

## Configure environment variables

Set these in the ignored local `.env` file or in Render's environment settings:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL, e.g. `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server-side service role key |
| `GEMINI_API_KEY` | Key from Google AI Studio |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` |

[`.env.example`](./.env.example) is the safe template. The `.env` file is git-ignored; never put these credentials in a `VITE_*` variable or browser code.

## Run locally

Use Python 3.10 or newer and Node.js 22 or newer. Install dependencies:

```sh
python -m pip install -r requirements.txt
pnpm install --frozen-lockfile
```

Run the API and frontend in separate terminals:

```sh
python -m uvicorn api.main:app --reload --port 8000
pnpm dev
```

Vite forwards `/api` requests to FastAPI. Open the Vite URL printed in the terminal. The API health endpoint is `/api/health`.

## Deploy to Render

1. Make sure `.env` is not committed; it is ignored by Git. Push the project to a GitHub repository connected to your Render account.
2. In Render, select **New → Blueprint**, connect the repository, and confirm the Blueprint. [`render.yaml`](./render.yaml) creates a Docker web service which builds and serves both the Vite frontend and FastAPI backend. You can also create a **Web Service** manually and select **Docker** with the root `Dockerfile`.
3. Open the service's **Environment** settings. Add:
   - `SUPABASE_URL` — Supabase **Project URL**
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase **service_role / secret key**
   - `GEMINI_API_KEY` — Google AI Studio API key
   - `GEMINI_MODEL` — `gemini-3.5-flash-lite` (already set by the Blueprint)
   
   Use Render's environment settings, not a committed `.env` or Docker build arguments. Save changes.
4. Select **Manual Deploy → Deploy latest commit** (the Blueprint may start its initial deploy automatically). Wait for the build and deploy to finish.
5. Open the Render service URL. Check `<your-render-url>/api/health`; it should return `"status":"ok"`, both `*_configured` fields as `true`, and `"model":"gemini-3.5-flash-lite"`.
6. Open the app and check its hero and mission data, then open JARVIS and send a short message. In Render's **Logs**, inspect any backend errors. Do not copy secret values into logs or share them.

After you push future changes, Render can automatically deploy the connected branch. Frontend and `/api/*` endpoints share one origin, so no separate CORS configuration or frontend API URL is needed.

The frontend loads live hero and mission data from Supabase. Creating a squad, allocating it, and changing mission status use the supplied RPC functions. JARVIS receives the current mission, squad, and battle context through FastAPI; the Gemini key remains server-side.
