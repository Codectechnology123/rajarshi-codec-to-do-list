# Frontend

## Run locally
1. Run `npm install` in this folder.
2. Copy `.env.example` to `.env`.
3. Set `VITE_API_URL=http://localhost:5000/api` (or your deployed API URL).
4. Run `npm run dev` and open the local URL shown by Vite.

Build for deployment with `npm run build`. Publish the `dist` directory as a static site. The API URL is read at build time.
