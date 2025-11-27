// js/api/userApi.js
import { API_BASE_URL } from "../utils/config.js";


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};


export const fetchMe = async () => {
  console.log("\n=== fetchMe 호출 ===");
  console.log("요청 URL:", `${API_BASE_URL}/users/me`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders()
    });
    
    console.log("응답 상태:", response.status);
    
    // ★★★ Response 객체를 그대로 반환 (body 읽지 않음) ★★★
    return response;
  } catch (error) {
    console.error("❌ fetchMe 실패:", error);
    throw error;
  }
};


export const updateMe = async ({ nickname, profile_image }) => {
  console.log("\n=== updateMe 호출 ===");
  console.log("nickname:", nickname);
  console.log("profile_image:", profile_image);
  
  const body = JSON.stringify({ nickname, profile_image });
  const url = `${API_BASE_URL}/users/me`;
  
  console.log("요청 URL:", url);
  console.log("요청 바디:", body);

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body
    });
    
    console.log("응답 상태:", response.status);
    
    return response;
  } catch (error) {
    console.error("❌ updateMe 실패:", error);
    throw error;
  }
};


export const changePassword = async ({
  new_password,
  new_password_confirm,
}) => {
  console.log("\n=== changePassword 호출 ===");
  
  const payload = JSON.stringify({
    new_password,
    new_password_confirm,
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/users/me/password`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: payload,
      }
    );
    
    console.log("응답 상태:", response.status);
    
    return response;
  } catch (error) {
    console.error("❌ changePassword 실패:", error);
    throw error;
  }
};