import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LoginForm } from "@/widgets/auth/login-form/LoginForm";
import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";

const authSignals = [
  {
    value: "Role-aware",
    label: "Akses lebih presisi",
    detail: "Satu pintu login untuk santri, musyrif, admin, dan operator.",
  },
  {
    value: "Adaptive",
    label: "Flow setelah login",
    detail: "Arahkan user ke ganti password, isi email, atau verifikasi otomatis.",
  },
  {
    value: "Responsive",
    label: "Nyaman di semua layar",
    detail: "Layout tetap rapi dari mobile sampai desktop lebar.",
  },
] as const;

const authHighlights = [
  "React menjaga UI tetap responsif saat validasi dan submit berjalan.",
  "TypeScript membuat struktur form dan state auth lebih aman saat dikembangkan.",
  "Visual hierarchy dirancang agar pengguna cepat paham apa yang harus dilakukan.",
] as const;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isBootstrapping } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleLogin(values: { identity: string; password: string }) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const nextRoute = await login(values);
      navigate(nextRoute, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Login gagal. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <div className="auth-layout">
        <section className="auth-hero" aria-labelledby="auth-hero-title">
          <p className="auth-hero__eyebrow">KH2 Management System</p>
          <h1 id="auth-hero-title" className="auth-hero__title">
            Login pondok yang terasa modern, tenang, dan jelas.
          </h1>
          <p className="auth-hero__description">
            Gunakan NIS untuk santri atau kode akun untuk role lain. Antarmuka
            ini dirancang untuk mempercepat proses masuk, mengurangi friction,
            dan tetap terlihat premium di semua ukuran layar.
          </p>

          <div className="auth-signals" aria-label="Keunggulan tampilan login">
            {authSignals.map((signal) => (
              <article key={signal.label} className="auth-signal">
                <p className="auth-signal__value">{signal.value}</p>
                <h2 className="auth-signal__label">{signal.label}</h2>
                <p className="auth-signal__detail">{signal.detail}</p>
              </article>
            ))}
          </div>

          <section className="auth-showcase" aria-labelledby="auth-showcase-title">
            <div className="auth-showcase__header">
              <p className="auth-showcase__eyebrow">Mengapa React + TypeScript</p>
              <h2 id="auth-showcase-title" className="auth-showcase__title">
                Tampilan bagus saja tidak cukup.
              </h2>
            </div>

            <ul className="auth-feature-list">
              {authHighlights.map((item, index) => (
                <li key={item} className="auth-feature">
                  <span className="auth-feature__index">
                    0{index + 1}
                  </span>
                  <span className="auth-feature__text">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section className="auth-card" aria-labelledby="auth-card-title">
          <div className="auth-card__glow" aria-hidden="true" />
          <div className="auth-card__header">
            <div>
              <p className="auth-card__eyebrow">Secure Access</p>
              <h2 id="auth-card-title" className="auth-card__title">
                Masuk ke workspace
              </h2>
            </div>
            <span className="auth-card__status">Live auth flow</span>
          </div>

          <p className="auth-card__description">
            Setelah login pertama, sistem dapat langsung mengarahkan user ke
            flow lanjutan seperti ganti password, isi email, dan verifikasi
            email.
          </p>

          <div className="auth-card__meta">
            <span className="auth-card__meta-item">Frontend React 19</span>
            <span className="auth-card__meta-item">Strict TypeScript</span>
            <span className="auth-card__meta-item">Responsive layout</span>
          </div>

          <LoginForm
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onSubmit={handleLogin}
          />

          <p className="auth-card__footnote">
            Fokus utama desain ini adalah keterbacaan tinggi, feedback yang
            jelas, dan transisi visual yang tetap ringan.
          </p>
        </section>
      </div>
    </main>
  );
}
