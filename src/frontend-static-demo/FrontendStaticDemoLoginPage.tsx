import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "@/frontend-static-demo/frontendStaticDemo.css";

const demoAccounts = [
  { label: "Santri Demo", identity: "santri.demo", password: "kh2-demo" },
  { label: "Wali Demo", identity: "wali.demo", password: "kh2-demo" },
  { label: "Pengurus Demo", identity: "pengurus.demo", password: "kh2-demo" },
] as const;

const authPoints = [
  {
    title: "Static Authentication Flow",
    detail: "Validasi ringan dan feedback visual untuk kebutuhan demo.",
  },
  {
    title: "Role-based Storytelling",
    detail: "Pilih akun demo untuk santri, wali, atau pengurus.",
  },
  {
    title: "Presentation Ready",
    detail: "Layout tetap rapi di layar laptop maupun proyektor.",
  },
] as const;

type LoginStatus = {
  tone: "neutral" | "success" | "error";
  message: string;
};

export function FrontendStaticDemoLoginPage() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ identity?: string; password?: string }>({});
  const [status, setStatus] = useState<LoginStatus>({
    tone: "neutral",
    message: "Mode demo aktif. Kredensial apa pun akan diterima setelah validasi field.",
  });

  function fillDemoAccount(nextIdentity: string, nextPassword: string) {
    setIdentity(nextIdentity);
    setPassword(nextPassword);
    setErrors({});
    setStatus({
      tone: "neutral",
      message: "Akun demo terisi otomatis. Tekan tombol masuk untuk simulasi login.",
    });
  }

  function resolveStatusClassName() {
    if (status.tone === "success") {
      return "fsd-loginStatus fsd-loginStatusSuccess";
    }

    if (status.tone === "error") {
      return "fsd-loginStatus fsd-loginStatusError";
    }

    return "fsd-loginStatus";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = {
      identity: identity.trim() ? undefined : "Identitas akun wajib diisi.",
      password: password.trim() ? undefined : "Password wajib diisi.",
    };

    setErrors(nextErrors);

    if (nextErrors.identity || nextErrors.password) {
      setStatus({
        tone: "error",
        message: "Lengkapi field login terlebih dahulu.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({
      tone: "neutral",
      message: "Memverifikasi akun demo...",
    });

    window.setTimeout(() => {
      setIsSubmitting(false);
      setStatus({
        tone: "success",
        message: `Login demo berhasil untuk akun "${identity.trim()}". Halaman ini memang tidak mengarah ke backend.`,
      });
    }, 900);
  }

  return (
    <div className="fsd-shell">
      <main className="fsd-authShell">
        <section className="fsd-authHero">
          <Link className="fsd-brand" to="/frontend-static-demo">
            <span className="fsd-brandMark">
              <img src="/assets/images/logo_ppm.png" alt="Logo PPM KH2" />
            </span>
            <span className="fsd-brandCopy">
              <strong>PPM KH2</strong>
              <span>KH2 Management System</span>
            </span>
          </Link>

          <div className="fsd-authCopy">
            <span className="fsd-eyebrow">Portal Login Demo</span>
            <h1>Masuk ke workspace presentasi KH2.</h1>
            <p>
              Halaman ini sudah berada di dalam `src` dan dirender sebagai route React,
              tetapi tetap mempertahankan perilaku login statis untuk kebutuhan demo.
            </p>
          </div>

          <div className="fsd-authPoints">
            {authPoints.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="fsd-authFormPanel">
          <div className="fsd-authCard">
            <div className="fsd-authCardHead">
              <span className="fsd-statusPill">Secure Access</span>
              <Link className="fsd-backLink" to="/frontend-static-demo">
                Kembali ke landing
              </Link>
            </div>

            <div className="fsd-authCardCopy">
              <h2>Login Demo</h2>
              <p>
                Gunakan salah satu akun contoh di bawah atau isi manual untuk simulasi saat
                presentasi.
              </p>
            </div>

            <div className="fsd-demoAccountList">
              {demoAccounts.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  className="fsd-demoAccount"
                  onClick={() => fillDemoAccount(account.identity, account.password)}
                >
                  {account.label}
                </button>
              ))}
            </div>

            <form className="fsd-authForm" onSubmit={handleSubmit} noValidate>
              <label className="fsd-fieldGroup">
                <span>Identitas Akun</span>
                <input
                  className="fsd-fieldInput"
                  type="text"
                  name="identity"
                  placeholder="NIS, username, atau email"
                  autoComplete="username"
                  value={identity}
                  onChange={(event) => {
                    setIdentity(event.target.value);
                    setErrors((current) => ({ ...current, identity: undefined }));
                  }}
                />
                <small className="fsd-fieldError">{errors.identity ?? ""}</small>
              </label>

              <label className="fsd-fieldGroup">
                <span>Password</span>
                <div className="fsd-passwordRow">
                  <input
                    className="fsd-fieldInput"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors((current) => ({ ...current, password: undefined }));
                    }}
                  />
                  <button
                    type="button"
                    className="fsd-ghostButton"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                <small className="fsd-fieldError">{errors.password ?? ""}</small>
              </label>

              <button
                className="fsd-button fsd-buttonPrimary fsd-fullWidth"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Masuk ke Demo"}
              </button>
            </form>

            <div className={resolveStatusClassName()} aria-live="polite">
              {status.message}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
