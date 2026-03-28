const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const loginForm = document.querySelector("[data-login-form]");

if (loginForm) {
  const identityInput = loginForm.querySelector('input[name="identity"]');
  const passwordInput = loginForm.querySelector('input[name="password"]');
  const identityError = loginForm.querySelector('[data-error-for="identity"]');
  const passwordError = loginForm.querySelector('[data-error-for="password"]');
  const statusBox = document.querySelector("[data-login-status]");
  const submitButton = loginForm.querySelector("[data-submit-label]");
  const passwordToggle = loginForm.querySelector("[data-password-toggle]");

  const showStatus = (message, variant) => {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.classList.remove("success", "error");
    if (variant) {
      statusBox.classList.add(variant);
    }
  };

  const setError = (target, message) => {
    if (target) {
      target.textContent = message;
    }
  };

  document.querySelectorAll("[data-demo-account]").forEach((button) => {
    button.addEventListener("click", () => {
      if (identityInput) identityInput.value = button.dataset.identity || "";
      if (passwordInput) passwordInput.value = button.dataset.password || "";
      setError(identityError, "");
      setError(passwordError, "");
      showStatus(
        "Akun demo terisi otomatis. Tekan tombol masuk untuk simulasi login.",
        ""
      );
    });
  });

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
      const isHidden = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isHidden ? "text" : "password");
      passwordToggle.textContent = isHidden ? "Sembunyikan" : "Tampilkan";
    });
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const identity = identityInput ? identityInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    setError(identityError, identity ? "" : "Identitas akun wajib diisi.");
    setError(passwordError, password ? "" : "Password wajib diisi.");

    if (!identity || !password) {
      showStatus("Lengkapi field login terlebih dahulu.", "error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Memproses...";
    }

    showStatus("Memverifikasi akun demo...", "");

    window.setTimeout(() => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Masuk ke Demo";
      }

      showStatus(
        `Login demo berhasil untuk akun "${identity}". Halaman ini memang tidak mengarah ke backend.`,
        "success"
      );
    }, 900);
  });
}
