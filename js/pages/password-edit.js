// js/pages/password-edit.js
import { changePassword } from "../api/userApi.js";
import { getCurrentUser, clearCurrentUser } from "../common/storage.js";
import { wireHeaderActions } from "../common/header-actions.js";

document.addEventListener("DOMContentLoaded", () => {
  wireHeaderActions();
  secureGate();
  wireForm();
  wireBack();
});


function secureGate() {
  const me = getCurrentUser();
  if (!me?.userId) {
    alert("로그인이 필요합니다.");
    location.href = "index.html";
  }
}


function wireBack() {
  const backBtn = document.getElementById("backBtn");
  backBtn?.addEventListener("click", () => history.back());
}


function wireForm() {
  const form = document.getElementById("pwForm");
  const pwInput = document.getElementById("password");
  const pw2Input = document.getElementById("passwordConfirm");
  const submitBtn = document.getElementById("submitBtn");

  const pwHelper = document.getElementById("pwHelper");
  const pw2Helper = document.getElementById("pw2Helper");
  const msg = document.getElementById("pwMessage");

  
  const strongRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/;

  const validate = () => {
    clearMsg(msg);
    const pw = (pwInput?.value ?? "").trim();
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

    const pw = (pwInput?.value ?? "").trim();
    const pw2 = (pw2Input?.value ?? "").trim();

    try {
      
      const res = await changePassword({
        new_password: pw,
        new_password_confirm: pw2,
      });

      if (res.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        clearCurrentUser();
        location.href = "index.html";
        return;
      }

      if (res.ok) {
        showMsg(msg, "비밀번호가 변경되었습니다. 다시 로그인해주세요.", false);
        
        
        localStorage.removeItem("token");
        clearCurrentUser();
        
        
        setTimeout(() => {
          location.href = "index.html";
        }, 2000);
        return;
      }

     
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
      
      showMsg(msg, message || "비밀번호 변경에 실패했습니다.", true);
    } catch (e) {
      console.error(e);
      showMsg(msg, "네트워크 오류가 발생했습니다.", true);
    }
  });
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