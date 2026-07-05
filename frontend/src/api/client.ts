import axios from 'axios'

// VITE_API_BASE is set in:
//   .env              → http://localhost:8000  (local dev)
//   .env.production   → https://your-backend.onrender.com  (Vercel build)
//   Vercel dashboard  → Environment Variables (overrides .env.production)
const BASE_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90_000,
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg: string =
      err.response?.data?.detail ??
      err.message ??
      'Something went wrong — please try again.'
    return Promise.reject(new Error(msg))
  }
)

export default client
