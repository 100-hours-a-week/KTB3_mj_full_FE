// js/pages/board-detail.js
import { API_BASE_URL } from "../utils/config.js";
import { getCurrentUser } from "../common/storage.js";
import { wireHeaderActions } from "../common/header-actions.js";
import {
  createComment,
  fetchComments,
  updateComment,
  deleteComment,
  likePost,
  unlikePost,
  increasePostView,
} from "../api/postApi.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
  wireHeaderActions(); 

  const me = getCurrentUser();
  if (!me?.userId) {
    alert("로그인이 필요합니다.");
    location.href = "index.html";
    return;
  }

  const backBtnHeader = document.getElementById("backBtnHeader");
  backBtnHeader?.addEventListener("click", handleBack);

  const params = new URLSearchParams(location.search);
  const postId = Number(params.get("id"));

  if (!postId || Number.isNaN(postId)) {
    alert("잘못된 접근입니다.");
    location.href = "board-list.html";
    return;
  }

  await loadPostDetail(postId, me.userId);
  
  try {
    await increasePostView(me.userId, postId);
  } catch (_) {}
  
  const vc = document.getElementById("viewCount");
  if (vc) {
    vc.dataset.raw = vc.dataset.raw ? String(Number(vc.dataset.raw) + 1) : "1";
    const raw = Number(vc.dataset.raw);
    vc.textContent = formatCount(raw);
  }

  await loadComments(postId, me.userId);
  setupCommentSubmit(postId, me.userId);
}

function handleBack() {
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.pathname.endsWith("board-list.html")) {
      history.back();
      return;
    }
  } catch (_) {}
  location.href = "board-list.html";
}

async function loadPostDetail(postId, userId) {
  const container = document.getElementById("postDetail");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      headers: { "X-User-Id": String(userId) },
    });

    if (!res.ok) {
      if (res.status === 404) {
        alert("게시글을 찾을 수 없습니다.");
        location.href = "board-list.html";
        return;
      }
      throw new Error("게시글 조회 실패");
    }

    const body = await res.json().catch(() => ({}));
    const post = body?.data ?? {};

    renderDetail(post, container);
  } catch (err) {
    console.error(err);
    alert("게시글을 불러오는 중 오류가 발생했습니다.");
  }
}

async function loadComments(postId, userId) {
  const commentList = document.getElementById("commentList");
  if (!commentList) return;

  let comments = [];

  try {
    const data = await fetchComments(userId, postId);
    comments = Array.isArray(data?.data) ? data.data
             : Array.isArray(data) ? data
             : [];

    if (comments.length === 0) {
      commentList.innerHTML = '<p class="empty">댓글이 없습니다.</p>';
    } else {
      commentList.innerHTML = comments.map(c => `
        <div class="comment-item" data-id="${c.id}">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(c.author)}</span>
            <span class="comment-date">${formatDate(c.createdAt)}</span>
          </div>
          <div class="comment-content">${escapeHtml(c.content)}</div>
          ${c.isOwner ? `
            <div class="comment-actions">
              <button class="comment-edit-btn" data-id="${c.id}">수정</button>
              <button class="comment-delete-btn" data-id="${c.id}">삭제</button>
            </div>
          ` : ""}
        </div>
      `).join("");
    }

    bindCommentActions(postId, userId);

  } catch (err) {
    console.error(err);
    commentList.innerHTML = '<p class="error">댓글을 불러올 수 없습니다.</p>';
  } finally {
    const cc = document.getElementById("commentCount");
    if (cc) {
      const len = Array.isArray(comments) ? comments.length : 0;
      cc.dataset.raw = String(len);
      cc.textContent = formatCount(len);
    }
  }
}

function bindCommentActions(postId, userId) {
  const list = document.getElementById("commentList");
  if (!list || list._bound) return;
  list._bound = true;

  list.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".comment-edit-btn");
    const delBtn = e.target.closest(".comment-delete-btn");

    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      startEditComment(list, postId, userId, id);
      return;
    }

    if (delBtn) {
      const id = Number(delBtn.dataset.id);
      if (!confirm("이 댓글을 삭제하시겠습니까?")) return;

      try {
        const { ok, status } = await deleteComment(userId, postId, id);
        if (!ok) {
          if (status === 401) {
            alert("로그인이 만료되었습니다.");
            location.href = "index.html";
            return;
          }
          alert("댓글 삭제에 실패했습니다.");
          return;
        }
        await loadComments(postId, userId);
      } catch (err) {
        console.error(err);
        alert("댓글 삭제 중 오류가 발생했습니다.");
      }
    }
  });
}

function startEditComment(listEl, postId, userId, commentId) {
  const item = listEl.querySelector(`.comment-item[data-id="${commentId}"]`);
  if (!item) return;

  const contentDiv = item.querySelector(".comment-content");
  const actionsDiv = item.querySelector(".comment-actions");
  const original = contentDiv.textContent;

  contentDiv.innerHTML = `
    <textarea class="comment-edit-textarea" style="width:100%;min-height:60px;">${escapeHtml(original)}</textarea>
    <div class="comment-actions" style="margin-top:6px;">
      <button class="comment-save-btn" data-id="${commentId}">저장</button>
      <button class="comment-cancel-btn" data-id="${commentId}">취소</button>
    </div>
  `;

  if (actionsDiv) actionsDiv.style.display = "none";

  const saveBtn = contentDiv.querySelector(".comment-save-btn");
  const cancelBtn = contentDiv.querySelector(".comment-cancel-btn");
  const textarea = contentDiv.querySelector(".comment-edit-textarea");

  saveBtn.addEventListener("click", async () => {
    const newText = (textarea.value || "").trim();
    if (!newText) {
      alert("내용을 입력해주세요.");
      return;
    }
    try {
      const { ok, status } = await updateComment(userId, postId, commentId, newText);
      if (!ok) {
        if (status === 401) {
          alert("로그인이 만료되었습니다.");
          location.href = "index.html";
          return;
        }
        alert("댓글 수정에 실패했습니다.");
        return;
      }
      await loadComments(postId, userId);
    } catch (err) {
      console.error(err);
      alert("댓글 수정 중 오류가 발생했습니다.");
    }
  });

  cancelBtn.addEventListener("click", () => {
    contentDiv.textContent = original;
    if (actionsDiv) actionsDiv.style.display = "";
  });
}

function setupCommentSubmit(postId, userId) {
  const commentInput = document.getElementById("commentInput");
  const commentSubmitBtn = document.getElementById("commentSubmitBtn");
  if (!commentInput || !commentSubmitBtn) return;

  commentSubmitBtn.addEventListener("click", async () => {
    const content = commentInput.value.trim();

    if (!content) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const res = await createComment(userId, postId, content);

      if (res.status === 401) {
        alert("로그인이 만료되었습니다.");
        location.href = "index.html";
        return;
      }

      if (!res.ok) {
        alert("댓글 작성에 실패했습니다.");
        return;
      }

      commentInput.value = "";
      await loadComments(postId, userId);
      alert("댓글이 등록되었습니다.");
    } catch (err) {
      console.error(err);
      alert("댓글 작성 중 오류가 발생했습니다.");
    }
  });
}

function renderDetail(post, container) {
  const title = post.title ?? "(제목 없음)";
  const author = post.authorName ?? post.author ?? "작성자";
  const content = post.content ?? "";
  const images = Array.isArray(post.images) ? post.images : [];
  let likes = post.likes ?? post.likesCount ?? 0;
  let views = post.views ?? 0;
  let comments = post.comments ?? post.commentsCount ?? 0;

  const createdAt = post.createdAt ?? "";
  const isOwner =
    (typeof post.isOwner === "boolean" ? post.isOwner : null) ??
    (typeof post.owner === "boolean" ? post.owner : null) ??
    (typeof post.is_author === "boolean" ? post.is_author : null) ??
    (typeof post.is_owner === "boolean" ? post.is_owner : null) ??
    false;

  const me = getCurrentUser();
  const postId = new URLSearchParams(location.search).get("id");
  let liked = getLiked(me.userId, postId);

  container.innerHTML = `
    <section class="detail-header">
      <h2 class="detail-title">${escapeHtml(title)}</h2>
      <div class="detail-user-row">
        <div class="writer-avatar"></div>
        <div class="detail-user-info">
          <div class="detail-writer">${escapeHtml(author)}</div>
          <div class="detail-date">${formatDate(createdAt)}</div>
        </div>
      </div>
      ${isOwner ? `
        <div class="detail-actions">
          <button id="editBtn" class="detail-edit-btn" type="button">수정</button>
          <button id="deleteBtn" class="detail-delete-btn" type="button">삭제</button>
        </div>
      ` : ""}
    </section>

    <section class="detail-image-area">
      ${images.length ? images.map(src => `<img class="detail-image" src="${escapeAttr(src)}" alt="post image" />`).join("") : ""}
    </section>

    <section class="detail-content">
      <p>${escapeHtml(content).replace(/\n/g, "<br>")}</p>
    </section>

    <section class="detail-stats">
      <div class="stat-box">
        <button id="likeBtn" class="like-btn ${liked ? "enabled" : "disabled"}" type="button">
          좋아요
        </button>
        <div class="stat-number" id="likeCount">${formatCount(likes)}</div>
        <div class="stat-label">좋아요수</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" id="viewCount" data-raw="${Number(views)}">${formatCount(views)}</div>
        <div class="stat-label">조회수</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" id="commentCount" data-raw="${Number(comments)}">${formatCount(comments)}</div>
        <div class="stat-label">댓글</div>
      </div>
    </section>

    <div class="detail-actions-row">
      <button type="button" id="backBtnList" class="small-action-btn">목록으로</button>
    </div>
  `;

  document.getElementById("backBtnList")?.addEventListener("click", handleBack);

  if (isOwner) {
    document.getElementById("editBtn")?.addEventListener("click", () => {
      location.href = `board-edit.html?id=${postId}`;
    });
    document.getElementById("deleteBtn")?.addEventListener("click", async () => {
      if (!confirm("정말 삭제하시겠습니까?")) return;
      await deletePost(postId);
    });
  }

  const likeBtn = document.getElementById("likeBtn");
  const likeCountEl = document.getElementById("likeCount");

  likeBtn?.addEventListener("click", async () => {
    try {
      if (!liked) {
        const res = await likePost(me.userId, postId);
        if (!res.ok) return alert("좋아요 처리에 실패했습니다.");
        liked = true;
        likes = (likes || 0) + 1;
        setLiked(me.userId, postId, true);
        likeBtn.classList.remove("disabled");
        likeBtn.classList.add("enabled");
      } else {
        const res = await unlikePost(me.userId, postId);
        if (!res.ok) return alert("좋아요 취소에 실패했습니다.");
        liked = false;
        likes = Math.max(0, (likes || 0) - 1);
        setLiked(me.userId, postId, false);
        likeBtn.classList.remove("enabled");
        likeBtn.classList.add("disabled");
      }
      likeCountEl.textContent = formatCount(likes);
    } catch (e) {
      console.error(e);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  });
}

async function deletePost(postId) {
  const me = getCurrentUser();
  
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: { "X-User-Id": String(me.userId) },
    });
    
    if (res.status === 204) {
      alert("삭제되었습니다.");
      location.href = "board-list.html";
      return;
    }
    
    alert("삭제에 실패했습니다.");
  } catch (e) {
    console.error(e);
    alert("삭제 중 오류가 발생했습니다.");
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

function escapeAttr(s) {
  return String(s ?? "").replace(/"/g, "&quot;");
}

function formatCount(n) {
  const v = Number(n || 0);
  if (v >= 100000) return "100k+";
  if (v >= 10000) return `${Math.floor(v / 1000)}k`;
  if (v >= 1000) return `${Math.floor(v / 1000)}k`;
  return String(v);
}

function likeKey(userId, postId) {
  return `liked:${userId}:${postId}`;
}

function getLiked(userId, postId) {
  try {
    return localStorage.getItem(likeKey(userId, postId)) === "1";
  } catch {
    return false;
  }
}

function setLiked(userId, postId, liked) {
  try {
    if (liked) localStorage.setItem(likeKey(userId, postId), "1");
    else localStorage.removeItem(likeKey(userId, postId));
  } catch {}
}