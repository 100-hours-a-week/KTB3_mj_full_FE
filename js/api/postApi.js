// js/api/postApi.js
import { API_BASE_URL } from "../utils/config.js";


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};


const getAuthHeadersWithoutContentType = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return { "Authorization": `Bearer ${token}` };
  }
  return {};
};


export const fetchPosts = async () => {
  const res = await fetch(`${API_BASE_URL}/posts`);
  return res.json();
};


export const fetchPostDetail = async (postId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}`);
  return res.json();
};


export const createPost = ({ title, content, image }) => {
  return fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, image }),
  });
};


export const updatePost = (postId, { title, content, image }) => {
  return fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, image }),
  });
};


export const deletePost = async (postId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: getAuthHeadersWithoutContentType(),
  });
  return res.status === 204;
};


export const fetchComments = async (postId) => {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
  return res.json();
};


export const createComment = (postId, content) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
};


export const updateComment = (postId, commentId, content) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
};


export const deleteComment = (postId, commentId) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeadersWithoutContentType(),
  });
};


export const likePost = (postId) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
    method: "POST",
    headers: getAuthHeadersWithoutContentType(),
  });
};


export const unlikePost = (postId) => {
  return fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
    method: "DELETE",
    headers: getAuthHeadersWithoutContentType(),
  });
};


export const increasePostView = (postId) =>
  fetch(`${API_BASE_URL}/posts/${postId}/views`, {
    method: "POST",
    headers: getAuthHeadersWithoutContentType(),
  })
  .then(res => res.ok ? res.json().catch(() => null) : null)
  .then(data => data?.data?.views ?? null);