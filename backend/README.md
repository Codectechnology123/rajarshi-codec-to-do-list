# Backend API

## Requirements
- Node.js 20+
- MongoDB local instance or MongoDB Atlas database

## Run locally
1. In this folder, run `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters.
4. Set `CLIENT_URL=http://localhost:5173`.
5. Run `npm run dev`.

The API runs at `http://localhost:5000`; health check: `GET /api/health`.

## Endpoints
- `POST /api/auth/register` — create an account
- `POST /api/auth/login` — get a JWT
- `GET /api/auth/me` — current user (Bearer token)
- `GET /api/tasks?page=1&limit=8&status=Pending&search=notes&sort=newest` — list/filter tasks
- `POST /api/tasks` — create task
- `PATCH /api/tasks/:id` — update task
- `DELETE /api/tasks/:id` — delete task

Task routes require `Authorization: Bearer <token>`. Every task query is scoped to the signed-in user. Responses use `{ success, data }` or `{ success: false, error: { code, message, details? } }`.
