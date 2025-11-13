// js/common/header-actions.js
import { API_BASE_URL } from "../utils/config.js";
import { getCurrentUser, clearCurrentUser } from "./storage.js";

export function wireHeaderActions() {
  const menu     = document.getElementById("profileMenu");
  const circle   = document.querySelector(".profile-circle");
  const imgEl    = document.getElementById("profileImg");
  const bgIconEl = document.getElementById("profileIcon"); // 레거시 지원

  const btnProfile  = document.getElementById("goProfileBtn") || document.getElementById("btnProfile");
  const btnPassword = document.getElementById("btnPassword");
  const btnLogout   = document.getElementById("logoutBtn");

  // ---- 디버깅(원인 파악용, 문제 해결되면 주석 처리 가능)
  // console.debug("[header] menu:", !!menu, "circle:", !!circle, "img:", !!imgEl, "bgIcon:", !!bgIconEl);

  // --- 프로필 이미지 세팅 ---
  const me = getCurrentUser();
  const fallback = "https://i.pravatar.cc/80?u=fallback";
  const url = me?.profileImageUrl || me?.profile_image || fallback;

  if (imgEl) {
    imgEl.src = url;
    imgEl.alt = "profile";
    imgEl.onerror = () => { imgEl.src = fallback; };
  } else if (bgIconEl) {
    bgIconEl.style.background = `#ddd center/cover no-repeat`;
    bgIconEl.style.backgroundImage = `url("${url}")`;
  }

  // --- 드롭다운 열기/닫기 ---
  const toggleMenu = (e) => {
    if (!menu) return;
    e?.stopPropagation?.();
    menu.classList.toggle("open");
  };

  // 아이콘/이미지 모두에 토글 연결
  if (circle) circle.addEventListener("click", toggleMenu);
  if (imgEl)  imgEl.addEventListener("click", toggleMenu);
  if (bgIconEl) bgIconEl.addEventListener("click", toggleMenu);

  // 문서 클릭 시 닫기 (열자마자 닫히는 플리커 방지로 setTimeout)
  if (menu) {
    setTimeout(() => {
      document.addEventListener("click", (e) => {
        const target = e.target;
        if (
          !menu.contains(target) &&
          target !== circle &&
          target !== imgEl &&
          target !== bgIconEl
        ) {
          menu.classList.remove("open");
        }
      });
    }, 0);
  }

  // --- 이동 버튼들 ---
  btnProfile?.addEventListener("click", () => {
    menu?.classList.remove("open");
    window.location.href = "profile.html";
  });
  btnPassword?.addEventListener("click", () => {
    menu?.classList.remove("open");
    window.location.href = "password-edit.html";
  });

  // --- 로그아웃 ---
  btnLogout?.addEventListener("click", async () => {
    menu?.classList.remove("open");
    const userId = me?.userId;
    try {
      if (userId) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { "X-User-Id": String(userId) },
          credentials: "include",
        }).catch(() => {});
      }
    } finally {
      clearCurrentUser();
      // 로그인 파일 경로에 맞춰 조정
      window.location.href = "../html/index.html"; // 프로젝트 구조에 맞게 유지
    }
  });
}
