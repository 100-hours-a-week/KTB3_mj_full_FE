// js/api/userApi.js
import { API_BASE_URL } from "../utils/config.js";

/** 공통 헤더 */
const authHeaders = (userId) => ({ "X-User-Id": String(userId) });
const jsonHeaders = (userId) => ({ "Content-Type": "application/json", ...authHeaders(userId) });
const withCreds = (init={}) => ({ credentials: "include", ...init });

/* ------------------ 내 정보 조회 ------------------ */
/** 1순위: GET /users/me, 404면 2순위: GET /users/{id} */
export const fetchMe = async (userId) => {
  const r1 = await fetch(`${API_BASE_URL}/users/me`, {
    credentials: "include",
    headers: { "X-User-Id": String(userId) },
  });
  // 500/401/400 등은 그대로 반환(폴백 금지)
  if (r1.status !== 404) return r1;

  // 백엔드에 /users/{id} GET이 실제로 있을 때만 의미 있음
  return fetch(`${API_BASE_URL}/users/${userId}`, {
    credentials: "include",
    headers: { "X-User-Id": String(userId) },
  });
};

export const updateMe = async (userId, { nickname, profile_image }) => {
  const body = JSON.stringify({ nickname, profile_image });
  try {
    const r1 = await fetch(`${API_BASE_URL}/users/me`, withCreds({ method:"PATCH", headers: jsonHeaders(userId), body }));
    if (r1.status !== 404) return r1;
  } catch {}
  return fetch(`${API_BASE_URL}/users/${userId}`, withCreds({ method:"PATCH", headers: jsonHeaders(userId), body }));
};
/* ------------------ 비밀번호 변경 ------------------ */
/** 1순위: PATCH /users/me/password, 404면 2순위: PATCH /users/{id}/password */
export const changePassword = async (userId, { new_password, new_password_confirm }) => {
  const payload = JSON.stringify({ new_password, new_password_confirm });
  try {
    const r1 = await fetch(`${API_BASE_URL}/users/me/password`, {
      method: "PATCH",
      headers: jsonHeaders(userId),
      body: payload,
    });
    if (r1.status !== 404) return r1;
  } catch (_) { /* 다음 후보 시도 */ }
  return fetch(`${API_BASE_URL}/users/${userId}/password`, {
    method: "PATCH",
    headers: jsonHeaders(userId),
    body: payload,
  });
};
