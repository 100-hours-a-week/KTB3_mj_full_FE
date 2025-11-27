// js/common/header-actions.js
import { API_BASE_URL } from "../utils/config.js";
import { getCurrentUser, clearCurrentUser } from "./storage.js";

export function wireHeaderActions() {
  const menu     = document.getElementById("profileMenu");
  const circle   = document.querySelector(".profile-circle");
  const imgEl    = document.getElementById("profileImg");
  const bgIconEl = document.getElementById("profileIcon"); 

  const btnProfile  = document.getElementById("goProfileBtn") || document.getElementById("btnProfile");
  const btnPassword = document.getElementById("btnPassword");
  const btnLogout   = document.getElementById("logoutBtn");

  
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

  
  const toggleMenu = (e) => {
    if (!menu) return;
    e?.stopPropagation?.();
    menu.classList.toggle("open");
  };

 
  if (circle) circle.addEventListener("click", toggleMenu);
  if (imgEl)  imgEl.addEventListener("click", toggleMenu);
  if (bgIconEl) bgIconEl.addEventListener("click", toggleMenu);

  
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

  
  btnProfile?.addEventListener("click", () => {
    menu?.classList.remove("open");
    window.location.href = "profile.html";
  });
  btnPassword?.addEventListener("click", () => {
    menu?.classList.remove("open");
    window.location.href = "password-edit.html";
  });

  
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
      
      window.location.href = "../html/index.html"; 
    }
  });
}
