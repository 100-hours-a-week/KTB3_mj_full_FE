// js/pages/login.js
import { API_BASE_URL } from "../utils/config.js";
import { setCurrentUser } from "../common/storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailHelper = document.getElementById("emailHelper");
  const passwordHelper = document.getElementById("passwordHelper");
  const loginBtn = document.getElementById("loginBtn");
  const goRegisterBtn = document.getElementById("goRegisterBtn");

  // ===== 입력 유효성 & 버튼 활성화 =====
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPassword = (pw) =>
    pw.length >= 8 && pw.length <= 20 &&
    /[A-Z]/.test(pw) && /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);

  const validate = () => {
    const email = emailInput.value.trim();
    const pw = passwordInput.value.trim();

    let emailOk = false, pwOk = false;

    if (!email) {
      emailHelper.textContent = "*이메일을 입력해주세요.";
      emailHelper.className = "helper-text error";
    } else if (!isValidEmail(email)) {
      emailHelper.textContent = "*올바른 이메일 형식(예: a@b.com)으로 입력해주세요.";
      emailHelper.className = "helper-text error";
    } else {
      emailHelper.textContent = "";
      emailHelper.className = "helper-text success";
      emailOk = true;
    }

    if (!pw) {
      passwordHelper.textContent = "*비밀번호를 입력해주세요.";
      passwordHelper.className = "helper-text error";
    } else if (!isValidPassword(pw)) {
      passwordHelper.textContent =
        "*8~20자, 대/소문자/숫자/특수문자 각 1자 이상 포함해야 합니다.";
      passwordHelper.className = "helper-text error";
    } else {
      passwordHelper.textContent = "";
      passwordHelper.className = "helper-text success";
      pwOk = true;
    }

    loginBtn.disabled = !(emailOk && pwOk);
    loginBtn.classList.toggle("active", emailOk && pwOk);

    return { emailOk, pwOk };
  };

  emailInput.addEventListener("input", validate);
  passwordInput.addEventListener("input", validate);
  validate();

  // ===== 회원가입 이동 =====
  if (goRegisterBtn) {
    goRegisterBtn.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }

  // ===== 폼 제출(백엔드 연동) =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { emailOk, pwOk } = validate();
    if (!emailOk || !pwOk) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json().catch(() => ({}));
      // 백엔드 응답: {"message":"loginSuccess","data":{"user_id":1}}
      if (res.ok && body?.data?.user_id != null) {
        setCurrentUser({ userId: body.data.user_id, email });
        alert("로그인 성공!");
        window.location.href = "board-list.html";
        return;
      }

      // 실패 케이스
      alert(body?.message ?? "이메일 또는 비밀번호를 확인해주세요.");
    } catch (err) {
      console.error(err);
      alert("로그인 중 오류가 발생했습니다.");
    }
  });
});
