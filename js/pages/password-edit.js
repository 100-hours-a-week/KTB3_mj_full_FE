// js/pages/password-edit.js
import { API_BASE_URL } from "../utils/config.js";

const CURRENT_KEY = "currentUser";

document.addEventListener("DOMContentLoaded", () => {
  secureGate();
  wireForm();   // 폼/유효성
  wireBack();   // 뒤로가기
});

/** 로그인 확인 */
function secureGate() {
  const me = getMe();
  if (!me?.userId) {
    alert("로그인이 필요합니다.");
    location.href = "../index.html";
  }
}

/** 뒤로가기 */
function wireBack() {
  const backBtn = document.getElementById("backBtn");
  backBtn?.addEventListener("click", () => history.back());
}

/** 폼 바인딩 + 유효성(버튼 enable) */
function wireForm() {
  const form = document.getElementById("pwForm");
  const pwInput = document.getElementById("password");
  const pw2Input = document.getElementById("passwordConfirm");
  const submitBtn = document.getElementById("submitBtn");

  const pwHelper = document.getElementById("pwHelper");
  const pw2Helper = document.getElementById("pw2Helper");
  const msg = document.getElementById("pwMessage"); // 없어도 동작하도록 방어

  // 8~20자 / 대문자/소문자/숫자/특수문자 최소 1자
  const strongRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/;

  const validate = () => {
    clearMsg(msg);
    const pw  = (pwInput?.value ?? "").trim();
    const pw2 = (pw2Input?.value ?? "").trim();

    let ok = true;

    if (!strongRule.test(pw)) {
      pwHelper.textContent = "8~20자, 대/소문자/숫자/특수문자 각 1자 이상이어야 합니다.";
      ok = false;
    } else {
      pwHelper.textContent = "";
    }

    if (pw2 && pw !== pw2) {
      pw2Helper.textContent = "비밀번호가 일치하지 않습니다.";
      ok = false;
    } else {
      pw2Helper.textContent = "";
    }

    if (submitBtn) {
      submitBtn.disabled = !ok;
      submitBtn.classList.toggle("active", ok);
    }
    return ok;
  };

  pwInput?.addEventListener("input", validate);
  pw2Input?.addEventListener("input", validate);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const me  = getMe();
    const pw  = (pwInput?.value ?? "").trim();
    const pw2 = (pw2Input?.value ?? "").trim();

    // 1) 백엔드 API 호출 (스펙: new_password / new_password_confirm)
    const result = await tryChangePasswordViaApi(me.userId, pw, pw2);
    if (result.ok) {
  showMsg(msg, "비밀번호가 변경되었습니다. 다시 로그인해주세요.", false);
  localStorage.removeItem(CURRENT_KEY);
  goToLogin(); // ← 라우트로 이동
  return;
}
    // 실패 사유 출력
    showMsg(msg, result.message || "비밀번호 변경에 실패했습니다.", true);
  });
}

/** 백엔드 API: /api/users/me/password */
async function tryChangePasswordViaApi(userId, pw, pw2) {
  const headers = {
    "Content-Type": "application/json",
    "X-User-Id": String(userId),
  };
  const body = JSON.stringify({
    new_password: pw,
    new_password_confirm: pw2,
  });

  try {
    const res = await fetch(`${API_BASE_URL}/users/me/password`, {
      method: "PATCH",
      headers,
      body,
    });

    if (res.ok) return { ok: true };

    // 에러 메시지(백엔드가 JSON이면 그대로, 아니면 텍스트)
    let message = "";
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        message = j?.message || JSON.stringify(j);
      } else {
        message = await res.text();
      }
    } catch {}
    return { ok: false, message };
  } catch (e) {
    return { ok: false, message: "네트워크 오류가 발생했습니다." };
  }
}

/** 로그인 페이지로 안전하게 이동 (여러 후보 경로 HEAD 체크) */
async function goLogin() {
  // 현재 파일 기준 상대 경로를 절대 URL로 만들어 주는 헬퍼
  const rel = (p) => new URL(p, window.location.href).toString();

  const candidates = [
    rel("../index.html"),          // pages/ 밑이라면 한 단계 위
    rel("../../index.html"),
    `${location.origin}/index.html`,
    `${location.origin}/frontend/index.html`,
    `${location.origin}/`,         // 루트 (정적 index.html)
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) {
        window.location.replace(url);
        return;
      }
    } catch { /* 다음 후보 시도 */ }
  }
  // 최후의 보루: 오리진 루트
  window.location.replace(`${location.origin}/`);
}

/** 유틸 */
function getMe() {
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY)); }
  catch { return null; }
}
function showMsg(el, text, isErr) {
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("error", !!isErr);
  el.classList.toggle("success", !isErr);
}
function clearMsg(el) {
  if (!el) return;
  el.textContent = "";
  el.classList.remove("error", "success");
}

function goToLogin() {
  // 백엔드(8080)에서 열려 있으면 프런트(5500)로 강제
  const FRONT_ORIGIN =
    location.port === "8080" ? "http://127.0.0.1:5500" : location.origin;

 
  const target = new URL("../html/index.html", `${FRONT_ORIGIN}${location.pathname}`);
  window.location.replace(target.toString());
}
