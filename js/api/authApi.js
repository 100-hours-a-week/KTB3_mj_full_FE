// js/api/authApi.js
import { API_BASE_URL } from "../utils/config.js";

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res;
};

export const logout = async (userId) => {
  return fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "X-User-Id": String(userId) },
  });
};
