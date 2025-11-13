// js/register.js

const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const emailHelper = document.getElementById("emailHelper");

  const nicknameInput = document.getElementById("nickname");
  const nicknameHelper = document.getElementById("nicknameHelper");

  const passwordInput = document.getElementById("password");
  const passwordHelper = document.getElementById("passwordHelper");

  const passwordConfirmInput = document.getElementById("passwordConfirm");
  const passwordConfirmHelper = document.getElementById("passwordConfirmHelper");

  const profileImageInput = document.getElementById("profileImage");
  const submitBtn = document.getElementById("registerBtn");
  const goLoginBtn = document.getElementById("goLoginBtn");

  // 입력 시 유효성 검사
  emailInput.addEventListener("input", validateForm);
  nicknameInput.addEventListener("input", validateForm);
  passwordInput.addEventListener("input", validateForm);
  passwordConfirmInput.addEventListener("input", validateForm);

  // 로그인 페이지로 이동
  if (goLoginBtn) {
    goLoginBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // 회원가입 폼 제출
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { emailValid, nicknameValid, passwordValid, confirmValid } =
      await validateForm(true); // 제출 시에는 이메일 중복 포함 확인

    if (!emailValid || !nicknameValid || !passwordValid || !confirmValid) {
      return;
    }

    const body = {
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(),
      password_confirm: passwordConfirmInput.value.trim(),
      nickname: nicknameInput.value.trim(),
      profile_image: profileImageInput.value.trim() || ""
    };

    try {
      const res = await fetch(`${API_BASE_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.status === 201) {
        const data = await res.json();
        if (data?.status === "register_success") {
          alert("회원가입이 완료되었습니다. 로그인 해주세요.");
          window.location.href = "index.html";
          return;
        }
      }

      // 400 또는 기타 실패 응답 처리
      emailHelper.textContent =
        "*이미 사용 중인 이메일이거나, 입력값이 올바르지 않습니다.";
      emailHelper.className = "helper-text error";
    } catch (error) {
      console.error(error);
      alert("서버와의 통신 중 오류가 발생했습니다.");
    }
  });

  // ===== 유효성 검사 함수 =====

  async function validateForm(checkEmailDuplicate = false) {
    const email = emailInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();

    let emailValid = false;
    let nicknameValid = false;
    let passwordValid = false;
    let confirmValid = false;

    // 이메일 형식 검사
    if (!email) {
      emailHelper.textContent = "*이메일을 입력해주세요.";
      emailHelper.className = "helper-text error";
    } else if (!isValidEmail(email)) {
      emailHelper.textContent =
        "*올바른 이메일 형식을 입력해주세요. (예: example@example.com)";
      emailHelper.className = "helper-text error";
    } else {
      emailValid = true;
      emailHelper.textContent = "";
      emailHelper.className = "helper-text";

      // 제출 시 또는 필요 시 이메일 중복 체크 (옵션)
      if (checkEmailDuplicate) {
        const duplicate = await checkEmailExists(email);
        if (duplicate) {
          emailValid = false;
          emailHelper.textContent = "*이미 사용 중인 이메일입니다.";
          emailHelper.className = "helper-text error";
        }
      }
    }

    // 닉네임 검사 (서버 기준: 필수, 최대 20자)
    if (!nickname) {
      nicknameHelper.textContent = "*닉네임을 입력해주세요.";
      nicknameHelper.className = "helper-text error";
    } else if (nickname.length > 20) {
      nicknameHelper.textContent =
        "*닉네임은 20자 이하로 입력해주세요.";
      nicknameHelper.className = "helper-text error";
    } else {
      nicknameValid = true;
      nicknameHelper.textContent = "";
      nicknameHelper.className = "helper-text";
    }

    // 비밀번호 형식 검사
    if (!password) {
      passwordHelper.textContent = "*비밀번호를 입력해주세요.";
      passwordHelper.className = "helper-text error";
    } else if (!isValidPassword(password)) {
      passwordHelper.textContent =
        "*비밀번호는 8~20자, 대/소문자/숫자/특수문자를 각각 1자 이상 포함해야 합니다.";
      passwordHelper.className = "helper-text error";
    } else {
      passwordValid = true;
      passwordHelper.textContent = "";
      passwordHelper.className = "helper-text";
    }

    // 비밀번호 확인 검사
    if (!passwordConfirm) {
      passwordConfirmHelper.textContent =
        "*비밀번호 확인을 입력해주세요.";
      passwordConfirmHelper.className = "helper-text error";
    } else if (password !== passwordConfirm) {
      passwordConfirmHelper.textContent =
        "*비밀번호가 일치하지 않습니다.";
      passwordConfirmHelper.className = "helper-text error";
    } else {
      confirmValid = true;
      passwordConfirmHelper.textContent = "";
      passwordConfirmHelper.className = "helper-text";
    }

    // 버튼 활성화 제어
    if (emailValid && nicknameValid && passwordValid && confirmValid) {
      submitBtn.disabled = false;
      submitBtn.classList.add("active");
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.remove("active");
    }

    return { emailValid, nicknameValid, passwordValid, confirmValid };
  }

  function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  function isValidPassword(pw) {
    if (pw.length < 8 || pw.length > 20) return false;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNum = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    return hasUpper && hasLower && hasNum && hasSpecial;
  }

  async function checkEmailExists(email) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/exists/email?email=${encodeURIComponent(email)}`
      );
      if (!res.ok) return false;
      const data = await res.json();
      return !!data?.data?.exists;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
});
