// js/pages/board-list.js
import { API_BASE_URL } from "../utils/config.js";
import { getCurrentUser } from "../common/storage.js";
import { wireHeaderActions } from "../common/header-actions.js";

document.addEventListener("DOMContentLoaded", () => {
  wireHeaderActions();
  initList();
});

async function initList() {
  const me = getCurrentUser();
  if (!me?.userId) {
    alert("로그인이 필요합니다.");
    location.href = "index.html";
    return;
  }

  const listEl = document.getElementById("postList");
  const writeBtn = document.getElementById("writeBtn");
  
  writeBtn?.addEventListener("click", () => location.href = "board-new.html");

  try {
    
    const res = await fetch(`${API_BASE_URL}/posts`);

    if (!res.ok) {
      if (res.status === 401) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("currentUser");
        location.href = "index.html";
        return;
      }
      throw new Error("목록 조회 실패");
    }

    const body = await res.json().catch(() => ({}));
    const list = Array.isArray(body?.data?.content) ? body.data.content : [];

    if (!listEl) return;

    if (list.length === 0) {
      listEl.innerHTML = '<p class="empty">게시글이 없습니다.</p>';
      return;
    }

    listEl.innerHTML = "";
    list.forEach((p, idx) => {
      const id = p.id ?? p.postId;
      const title = p.title ?? "(제목 없음)";
      const author = p.author ?? "작성자";
      const likes = p.likesCount ?? p.likes ?? 0;
      const comments = p.commentsCount ?? p.commentCount ?? p.comments ?? 0;
      const views = p.views ?? p.viewCount ?? 0;
      const createdAt = p.createdAt ?? "";

      const card = document.createElement("div");
      card.className = "post-card";
      if (idx === 0) card.classList.add("post-card-active");

      card.innerHTML = `
        <div class="post-top">
          <div class="post-title">${escapeHtml(title)}</div>
          <div class="post-date">${escapeHtml(formatDate(createdAt))}</div>
        </div>
        <div class="post-meta">
          <span>좋아요 ${likes}</span>
          <span>댓글 ${comments}</span>
          <span>조회수 ${views}</span>
        </div>
        <div class="post-writer">
          <div class="writer-avatar"></div>
          <span>${escapeHtml(author)}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        if (id == null) {
          console.error("Post ID가 없습니다:", p);
          return;
        }
        location.href = `board-detail.html?id=${id}`;
      });

      listEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    alert("게시글 목록을 불러오지 못했습니다.");
  }
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}