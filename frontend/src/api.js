const BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api")).replace(/\/$/, "");

export async function request(path, options = {}) {
  const token = localStorage.getItem("daymark_token");
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Something went wrong. Please try again.");
    error.details = payload?.error?.details || [];
    error.status = response.status;
    throw error;
  }
  return payload.data;
}
