// js/api/postApi.js
import { API_BASE_URL } from "../utils/config.js";

/* ====== 게시글 ====== */
// 목록 조회 (JSON 바로 반환)
export const fetchPosts = async (userId) => {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    headers: { "X-User-Id": String(userId) },
  });
  return res.json();
};

// 상세 조회 (JSON 바로 반환)
export const fetchPostDetail = async (userId, postId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    headers: { "X-User-Id": String(userId) },
  });
  return res.json();
};

// 등록 (Response 그대로)
export const createPost = (userId, { title, content, image }) => {
  return fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": String(userId),
    },
    body: JSON.stringify({ title, content, image }),
  });
};

// 수정 (Response 그대로)
export const updatePost = (userId, postId, { title, content, image }) => {
  return fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": String(userId),
    },
    body: JSON.stringify({ title, content, image }),
  });
};

// 삭제 (204 여부로 boolean 반환)
export const deletePost = async (userId, postId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: { "X-User-Id": String(userId) },
  });
  return res.status === 204;
};

/* ====== 댓글 ====== */
// 목록 조회 (JSON 바로 반환)
export const fetchComments = async (userId, postId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    headers: { "X-User-Id": String(userId) },
  });
  return res.json();
};

// 작성 (Response 그대로)
export const createComment = (userId, postId, content) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": String(userId),
    },
    body: JSON.stringify({ content }),
  });
};

// 수정 (Response 그대로)
export const updateComment = (userId, postId, commentId, content) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": String(userId),
    },
    body: JSON.stringify({ content }),
  });
};

// 삭제 (Response 그대로: 204면 본문 없음)
export const deleteComment = (userId, postId, commentId) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { "X-User-Id": String(userId) },
  });
};

// 좋아요 추가
export const likePost = (userId, postId) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
    method: "POST",
    headers: { "X-User-Id": String(userId) },
  });
};

// 좋아요 취소
export const unlikePost = (userId, postId) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
    method: "DELETE",
    headers: { "X-User-Id": String(userId) },
  });
};

// 조회수 +1
// js/api/postApi.js
export const increasePostView = (userId, postId) =>
  fetch(`${API_BASE_URL}/posts/${postId}/views`, {
    method: "POST",
    headers: { "X-User-Id": String(userId) },
  })
  .then(res => res.ok ? res.json().catch(() => null) : null)
  .then(data => data?.data?.views ?? null);


