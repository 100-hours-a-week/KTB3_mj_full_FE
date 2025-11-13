// js/pages/profile.js
import { getCurrentUser, clearCurrentUser, setCurrentUser } from "../common/storage.js";
import { fetchMe, updateMe } from "../api/userApi.js";
import { logout } from "../api/authApi.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) {
    alert("로그인이 필요합니다.");
    location.href = "index.html";
    return;
  }

  // elements
  const backBtn = $("#backBtn");
  const profileIcon = $("#profileIcon");
  const profileMenu = $("#profileMenu");
  const goPasswordBtn = $("#goPasswordBtn");
  const logoutBtn = $("#logoutBtn");
  const form = $("#profileForm");
  const nicknameInput = $("#nickname");
  const profileImageInput = $("#profileImage");
  const nicknameHelper = $("#nicknameHelper");
  const submitBtn = $("#submitBtn");
  const cancelBtn = $("#cancelBtn");

  // header
  backBtn?.addEventListener("click", () => (location.href = "board-list.html"));
  profileIcon?.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu?.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (profileMenu?.classList.contains("open") && !profileMenu.contains(e.target) && e.target !== profileIcon) {
      profileMenu.classList.remove("open");
    }
  });
  goPasswordBtn?.addEventListener("click", () => (location.href = "password-edit.html"));

  logoutBtn?.addEventListener("click", onLogout);

  cancelBtn?.addEventListener("click", () => (location.href = "board-list.html"));

  // load me
  await loadMe();

  // validation
  nicknameInput.addEventListener("input", validateForm);
  profileImageInput.addEventListener("input", validateForm);

  form.addEventListener("submit", onSubmit);

// js/pages/profile.js 안의 loadMe()만 교체
async function loadMe() {
  try {
    const res = await fetchMe(currentUser.userId);
    console.log("[/users/me] status=", res.status, "ct=", res.headers.get("content-type"));

    // 본문은 먼저 text로 받아서 JSON 시도 (비 JSON이어도 안전)
    const raw = await res.text();
    console.log("[/users/me] raw=", raw);

    if (res.status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      clearCurrentUser();
      location.href = "index.html";
      return;
    }
    if (!res.ok) {
      
      alert(`내 정보를 불러오지 못했습니다. (status ${res.status})`);
      location.href = "board-list.html";
      return;
    }

    let body;
    try { body = raw ? JSON.parse(raw) : null; } catch {
      alert("서버 응답이 올바른 JSON이 아닙니다.");
      location.href = "board-list.html";
      return;
    }

    const me = body?.data;
    if (!me) {
      alert("응답에 data가 없습니다.");
      location.href = "board-list.html";
      return;
    }

    nicknameInput.value = me.nickname ?? "";
    profileImageInput.value = me.profile_image ?? "";
    validateForm();
  } catch (e) {
    console.error("[loadMe] error:", e);
    alert("내 정보를 불러오지 못했습니다.");
    location.href = "board-list.html";
  }
}


  async function onSubmit(e) {
    e.preventDefault();
    const { nicknameValid } = validateForm();
    if (!nicknameValid) return;

    const payload = {
      nickname: nicknameInput.value.trim(),
      profile_image: profileImageInput.value.trim() || null,
    };

    try {
      const res = await updateMe(currentUser.userId, payload);
      if (res.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        clearCurrentUser();
        location.href = "index.html";
        return;
      }
      if (res.status === 400) {
        const body = await res.json();
        const errors = body?.data || [];
        const nickErr = errors.find((e) => e.field === "nickname");
        if (nickErr) {
          setHelper(nicknameHelper, "*닉네임을 확인해주세요. (공백 금지, 최대 20자)", true);
        }
        return;
      }
      if (!res.ok) {
        alert("수정에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      const body = await res.json();
      const updated = body?.data;
      setCurrentUser({ ...currentUser, nickname: updated?.nickname, profileImageUrl: updated?.profile_image });
      alert("수정되었습니다.");
      location.href = "board-list.html";
    } catch (e) {
      console.error(e);
      alert("수정 중 오류가 발생했습니다.");
    }
  }

  async function onLogout() {
    try {
      await logout(currentUser.userId);
    } catch {}
    clearCurrentUser();
    alert("로그아웃되었습니다.");
    location.href = "index.html";
  }

  function validateForm() {
    const nickname = nicknameInput.value.trim();
    let nicknameValid = false;

    if (!nickname) {
      setHelper(nicknameHelper, "*닉네임을 입력해주세요.", true);
    } else if (nickname.length > 20) {
      setHelper(nicknameHelper, "*닉네임은 20자 이내로 입력해주세요.", true);
    } else {
      setHelper(nicknameHelper, "");
      nicknameValid = true;
    }

    submitBtn.disabled = !nicknameValid;
    submitBtn.classList.toggle("active", nicknameValid);
    return { nicknameValid };
  }
}

// utils
function $(sel) { return document.querySelector(sel); }
function setHelper(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.className = isError ? "helper-text error" : "helper-text";
}
