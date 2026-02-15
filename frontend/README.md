# Frontend (React + TypeScript)

Quick scaffold for the React + TypeScript frontend that talks to the Project Management API.

Run locally:

```bash
cd frontend
npm install
npm run dev
```

Environment:
- Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your API base URL.

Notes:
- Auth flow uses the token stored in localStorage by `AuthProvider`.
- Update API endpoints in `src/api/axios.ts` if your backend paths differ.
