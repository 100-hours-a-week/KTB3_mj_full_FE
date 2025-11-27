// js/pages/login.js
import { login } from "../api/authApi.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailHelper = document.getElementById("emailHelper");
  const passwordHelper = document.getElementById("passwordHelper");
  const loginBtn = document.getElementById("loginBtn");
  const goRegisterBtn = document.getElementById("goRegisterBtn");

  
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

  
  if (goRegisterBtn) {
    goRegisterBtn.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }

  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { emailOk, pwOk } = validate();
    if (!emailOk || !pwOk) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      
      const result = await login(email, password);

      console.log("로그인 결과:", result);

      
      if (result.ok && result.data?.data?.token) {
       
        localStorage.setItem("currentUser", JSON.stringify({
          userId: result.data.data.user_id,
          email: result.data.data.email,
          nickname: result.data.data.nickname
        }));

        console.log("로그인 성공 - 토큰:", localStorage.getItem("token")?.substring(0, 20) + "...");

        alert("로그인 성공!");
        window.location.href = "board-list.html";
        return;
      }

      
      if (result.status === 401) {
        alert("이메일 또는 비밀번호를 확인해주세요.");
      } else {
        alert(result.data?.message ?? "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error("로그인 에러:", err);
      alert("로그인 중 오류가 발생했습니다.");
    }
  });
});