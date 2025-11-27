// js/pages/board-edit.js
import { getCurrentUser, clearCurrentUser } from "../common/storage.js";
import { fetchPostDetail, updatePost } from "../api/postApi.js";
import { wireHeaderActions } from "../common/header-actions.js";

document.addEventListener("DOMContentLoaded", async () => {
  wireHeaderActions(); 

  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) {
    alert("로그인이 필요합니다.");
    window.location.href = "index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "board-list.html";
    return;
  }

  const backBtn = document.getElementById("backBtn");
  const form = document.getElementById("editPostForm");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const imageUrlInput = document.getElementById("imageUrl");
  const titleHelper = document.getElementById("titleHelper");
  const contentHelper = document.getElementById("contentHelper");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  
  backBtn?.addEventListener("click", () => {
    window.location.href = `board-detail.html?id=${postId}`;
  });

  
  cancelBtn?.addEventListener("click", () => {
    if (confirm("수정을 취소하시겠습니까?")) {
      window.location.href = `board-detail.html?id=${postId}`;
    }
  });

  
  await loadPostData();

  
  titleInput.addEventListener("input", validateForm);
  contentInput.addEventListener("input", validateForm);

  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { titleValid, contentValid } = validateForm();
    if (!titleValid || !contentValid) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const image = imageUrlInput.value.trim() || null;

    try {
      
      const res = await updatePost(postId, {
        title,
        content,
        image,
      });

      if (res.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        clearCurrentUser();
        window.location.href = "index.html";
        return;
      }

      if (!res.ok) {
        alert("게시글 수정에 실패했습니다. 입력값을 확인해주세요.");
        return;
      }

      alert("게시글이 수정되었습니다.");
      window.location.href = `board-detail.html?id=${postId}`;
    } catch (error) {
      console.error(error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    }
  });

  async function loadPostData() {
    try {
      
      const res = await fetchPostDetail(postId);

      if (res.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        clearCurrentUser();
        window.location.href = "index.html";
        return;
      }

      const data = res.data || res?.data;
      const post = data || null;

      if (!post) {
        alert("게시글 정보를 불러오지 못했습니다.");
        window.location.href = "board-list.html";
        return;
      }

      titleInput.value = post.title || "";
      contentInput.value = post.content || "";
      imageUrlInput.value = post.image || post.imageUrl || "";

      validateForm();
    } catch (e) {
      console.error(e);
      alert("게시글 정보를 불러오는 중 오류가 발생했습니다.");
      window.location.href = "board-list.html";
    }
  }

  function validateForm() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    let titleValid = false;
    let contentValid = false;

    if (!title) {
      titleHelper.textContent = "*제목을 입력해주세요.";
      titleHelper.className = "helper-text error";
    } else if (title.length > 26) {
      titleHelper.textContent = "*제목은 26자 이내로 입력해주세요.";
      titleHelper.className = "helper-text error";
    } else {
      titleHelper.textContent = "";
      titleHelper.className = "helper-text";
      titleValid = true;
    }

    if (!content) {
      contentHelper.textContent = "*내용을 입력해주세요.";
      contentHelper.className = "helper-text error";
    } else {
      contentHelper.textContent = "";
      contentHelper.className = "helper-text";
      contentValid = true;
    }

    if (titleValid && contentValid) {
      submitBtn.disabled = false;
      submitBtn.classList.add("active");
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.remove("active");
    }

    return { titleValid, contentValid };
  }
});