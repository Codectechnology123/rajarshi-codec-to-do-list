# Daymark — Advanced MERN To-Do List

A responsive task manager built with React, Node.js, Express, and MongoDB. Includes JWT authentication, private user tasks, CRUD REST APIs, server-side validation, structured errors, status workflow, search, filtering, sorting, and pagination.

## Features
- Register and sign in with JWT authentication
- Tasks are private to the account that created them
- Create, read, update, and delete tasks
- Status workflow: Pending, In-Progress, Completed
- Server-side search, status filter, sorting, and pagination
- Validation and consistent JSON error responses
- Responsive React dashboard and reusable task components
- Express serves the production React build

## Run locally
Requires Node.js 20+ and MongoDB (local or Atlas).
1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters.
3. Install dependencies: `npm install --prefix backend` and `npm install --prefix frontend`.
4. Terminal 1: `npm run dev --prefix backend`.
5. Terminal 2: `npm run dev --prefix frontend`.
6. Open the Vite URL (normally http://localhost:5173).

## API routes
All routes use the `/api` prefix. Protected routes require `Authorization: Bearer <token>`.
- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/:id`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`

List query parameters: `page`, `limit` (max 50), `status`, `search`, `sort` (`newest`, `oldest`, `dueDate`, `title`, `status`).

## Deploy on Render
Use the included Blueprint or create a Web Service from this repository. Set `MONGODB_URI` to your MongoDB Atlas connection string; Render can generate `JWT_SECRET`. In Atlas, add a database user and allow network access from Render. Never commit credentials or a real database URI.

## Structure
- `backend/src/models` — MongoDB schemas
- `backend/src/controllers` — request logic
- `backend/src/routes` — REST endpoints and validation
- `backend/src/middleware` — authentication and errors
- `frontend/src` — React UI, API helper, and styles
