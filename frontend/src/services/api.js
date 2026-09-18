// src/services/api.js
import axios from 'axios';

// Base URL for API – reads from VITE_API_URL env var (fallback to relative /api for production)
// All backend routes are mounted under /api, so we append it here once.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL + '/api'
    : '/api',
  withCredentials: true, // send HttpOnly cookie
});

export default api;
