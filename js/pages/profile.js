// js/pages/profile.js
import { getCurrentUser, clearCurrentUser, setCurrentUser } from "../common/storage.js";
import { fetchMe, updateMe } from "../api/userApi.js";
import { logout } from "../api/authApi.js";

let currentUser = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  
  currentUser = getCurrentUser();
  
  
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

  
  await loadMe(nicknameInput, profileImageInput, nicknameHelper, submitBtn);

  
  nicknameInput.addEventListener("input", () => validateForm(nicknameInput, nicknameHelper, submitBtn));
  profileImageInput.addEventListener("input", () => validateForm(nicknameInput, nicknameHelper, submitBtn));

  form.addEventListener("submit", (e) =>
    onSubmit(e, nicknameInput, profileImageInput, nicknameHelper, submitBtn)
  );
}

async function loadMe(nicknameInput, profileImageInput, nicknameHelper, submitBtn) {
  try {
    
    const res = await fetchMe();
    console.log("[/users/me] status=", res.status, "ct=", res.headers.get("content-type"));

    const raw = await res.text();
    console.log("[/users/me] raw=", raw);

    if (res.status === 401) {
      alert("로그인이 필요합니다.");
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
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
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

    
    setCurrentUser({
      userId: me.id,
      email: me.email,
      nickname: me.nickname,
      profileImageUrl: me.profile_image
    });
    currentUser = getCurrentUser();

    nicknameInput.value = me.nickname ?? "";
    profileImageInput.value = me.profile_image ?? "";
    validateForm(nicknameInput, nicknameHelper, submitBtn);
  } catch (e) {
    console.error("[loadMe] error:", e);
    alert("내 정보를 불러오지 못했습니다.");
  }
}

async function onSubmit(e, nicknameInput, profileImageInput, nicknameHelper, submitBtn) {
  e.preventDefault();
  const { nicknameValid } = validateForm(nicknameInput, nicknameHelper, submitBtn);
  if (!nicknameValid) return;

  const payload = {
    nickname: nicknameInput.value.trim(),
    profile_image: profileImageInput.value.trim() || null,
  };

  try {
    
    const res = await updateMe(payload);
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
    
    
    if (currentUser) {
      setCurrentUser({ 
        ...currentUser, 
        nickname: updated?.nickname, 
        profileImageUrl: updated?.profile_image 
      });
    }
    
    alert("수정되었습니다.");
    location.href = "board-list.html";
  } catch (e) {
    console.error(e);
    alert("수정 중 오류가 발생했습니다.");
  }
}

async function onLogout() {
  try {
    await logout();
  } catch {}
  clearCurrentUser();
  alert("로그아웃되었습니다.");
  location.href = "index.html";
}

function validateForm(nicknameInput, nicknameHelper, submitBtn) {
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

// utils
function $(sel) {
  return document.querySelector(sel);
}
function setHelper(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.className = isError ? "helper-text error" : "helper-text";
}