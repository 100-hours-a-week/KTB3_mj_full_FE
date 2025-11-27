// js/api/authApi.js
import { API_BASE_URL } from "../utils/config.js";

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  
  if (res.ok) {
    const data = await res.json();
    
    
    if (data.data && data.data.token) {
      localStorage.setItem("token", data.data.token);
    }
    
    
    return {
      ok: true,
      status: res.status,
      data: data
    };
  }
  
  // 실패 시
  return {
    ok: false,
    status: res.status,
    data: null
  };
};

export const logout = async () => {
  localStorage.removeItem("token");
  
  return fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
  });
};