async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || "Request failed");
  return payload;
}

function setMessage(el, text, kind) {
  if (!el) return;
  el.textContent = String(text || "");
  el.classList.remove("ok", "err");
  if (kind) el.classList.add(kind);
}

function validateUsername(name) { return null; }

function validatePasswordForSignup(password) { return null; }

function validatePasswordForLogin(password) { return null; }

document.addEventListener("DOMContentLoaded", () => {

  const suBtn = document.getElementById("su_btn");
  if (suBtn) {
    suBtn.onclick = async () => {
      const msg = document.getElementById("su_msg");
      setMessage(msg, "", null);

      const name = document.getElementById("su_name").value;
      const password = document.getElementById("su_pass").value;

      try {
        await postJSON("/api/signup", { name: String(name).trim(), password });
        setMessage(msg, "Account created. Redirecting…", "ok");
        window.location.href = "/signin";
      } catch (e) {
        setMessage(msg, e.message, "err");
      }
    };
  }

  const siBtn = document.getElementById("si_btn");
  if (siBtn) {
    siBtn.onclick = async () => {
      const msg = document.getElementById("si_msg");
      setMessage(msg, "", null);

      const name = document.getElementById("si_name").value;
      const password = document.getElementById("si_pass").value;

      try {
        await postJSON("/api/login", { name: String(name).trim(), password });
        setMessage(msg, "Signed in. Redirecting…", "ok");
        window.location.href = "/game";
      } catch (e) {
        setMessage(msg, e.message, "err");
      }
    };
  }

});
