import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LoginForm } from "@/widgets/auth/login-form/LoginForm";
import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";

const loginHighlights = [
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10 2a5 5 0 0 1 5 5v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v1h6V7a3 3 0 0 0-3-3Z" />
      </svg>
    ),
    title: "Akses Fleksibel",
    detail: "Login dengan NIS, kode akun, atau email.",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    title: "Flow Lanjutan",
    detail: "Ganti password, isi email, dan verifikasi otomatis.",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path
          fillRule="evenodd"
          d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41a1.651 1.651 0 0 1 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    title: "Tampilan Modern",
    detail: "Fullscreen, no-scroll, fokus pada autentikasi.",
  },
] as const;

const loginKeywords = [
  "Secure Access",
  "KH2 Management System",
  "NIS / Kode Akun / Email",
  "First Login Flow",
  "Responsive Interface",
  "Professional Workspace",
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
    <main className="relative grid h-dvh min-h-dvh place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_0%_0%,rgba(45,122,86,0.45),transparent_45%),radial-gradient(ellipse_at_100%_100%,rgba(8,30,20,0.9),transparent_55%),linear-gradient(135deg,#081e14_0%,#0f2d1e_30%,#1a4530_55%,#c8ddd0_78%,#f0f6f2_100%)] p-4 max-sm:p-3">

      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="absolute -left-8 -top-32 h-136 w-136 rounded-full bg-[radial-gradient(circle,rgba(73,146,107,0.32),transparent_65%)] blur-2xl motion-safe:animate-auth-orb-float" />
        <span className="absolute -right-10 -bottom-48 h-120 w-120 rounded-full bg-[radial-gradient(circle,rgba(246,250,247,0.7),transparent_65%)] blur-2xl motion-safe:animate-auth-orb-float motion-safe:[animation-duration:22s]" />
        <span className="absolute left-[35%] -top-24 h-88 w-88 rounded-full bg-[radial-gradient(circle,rgba(45,122,86,0.18),transparent_70%)] blur-2xl motion-safe:animate-auth-orb-float motion-safe:[animation-duration:14s]" />
        <span className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[5rem_5rem] mask-[linear-gradient(180deg,rgba(0,0,0,0.8),transparent_82%)] motion-safe:animate-auth-grid-shift" />

        <div className="absolute left-[-10%] top-[9%] hidden w-max gap-2.5 whitespace-nowrap opacity-[0.09] lg:flex motion-safe:animate-auth-marquee-left">
          {[...loginKeywords, ...loginKeywords].map((item, index) => (
            <span
              key={`top-${item}-${index}`}
              className="inline-flex min-h-8 items-center rounded-full border border-white/10 bg-white/5 px-3 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-mist-50/70"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="absolute bottom-[8%] left-[-10%] hidden w-max gap-2.5 whitespace-nowrap opacity-[0.06] lg:flex motion-safe:animate-auth-marquee-right">
          {[...loginKeywords.slice().reverse(), ...loginKeywords.slice().reverse()].map((item, index) => (
            <span
              key={`bottom-${item}-${index}`}
              className="inline-flex min-h-8 items-center rounded-full border border-white/10 bg-white/5 px-3 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-mist-50/60"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div
        className="relative z-10 grid w-full max-w-275 overflow-hidden rounded-4xl border border-white/10 shadow-[0_40px_100px_rgba(4,14,9,0.38),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl max-md:h-[calc(100dvh-1.4rem)] max-lg:grid-cols-1 lg:grid-cols-[1fr_minmax(370px,410px)] h-[min(720px,calc(100dvh-2rem))]"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        {/* Column divider + left bg */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 max-lg:bottom-[42%] max-lg:right-0 lg:right-[37.6%] bg-[radial-gradient(ellipse_at_15%_20%,rgba(72,144,107,0.22),transparent_40%),linear-gradient(160deg,rgba(7,24,16,0.97)_0%,rgba(14,40,26,0.95)_100%)] max-lg:bg-[linear-gradient(170deg,rgba(7,24,16,0.97)_0%,rgba(12,34,22,0.95)_100%)]" />
          <div className="absolute bottom-6 left-[calc(62.4%-0.5px)] top-6 hidden w-px bg-[linear-gradient(180deg,transparent,rgba(60,120,87,0.22)_20%,rgba(60,120,87,0.22)_80%,transparent)] lg:block" />
          <div className="absolute left-6 right-6 top-[42%] h-px bg-[linear-gradient(90deg,transparent,rgba(60,120,87,0.22)_20%,rgba(60,120,87,0.22)_80%,transparent)] lg:hidden max-sm:hidden" />
        </div>

        {/* Left panel — hero */}
        <section
          className="relative z-10 flex h-full min-w-0 flex-col justify-between p-8 max-lg:p-6 max-sm:hidden"
          aria-labelledby="auth-hero-title"
        >
          {/* Top: branding */}
          <div className="motion-safe:animate-auth-fade-up">
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/14 bg-white/8 shadow-[0_4px_16px_rgba(0,0,0,0.2)] motion-safe:animate-auth-logo-pop">
                <span className="text-[0.75rem] font-extrabold tracking-tight text-mist-50">KH2</span>
                <span className="absolute -inset-0.75 rounded-[0.9rem] border border-forest-500/30 motion-safe:animate-auth-pulse-ring" />
              </div>
              <div>
                <p className="mb-0.5 text-[0.63rem] font-bold uppercase leading-none tracking-[0.2em] text-mist-100/55">
                  PPM KH2
                </p>
                <p className="text-[0.78rem] font-bold leading-none text-mist-50/90">
                  KH2-ManagementSystem
                </p>
              </div>
            </div>

            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/7 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-mist-100/70">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-500" />
              Portal Login Utama
            </span>

            <h1
              id="auth-hero-title"
              className="m-0 font-display text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[0.9] tracking-[-0.05em] text-mist-50 drop-shadow-[0_8px_24px_rgba(3,10,7,0.18)] max-lg:text-[clamp(1.9rem,5.5vw,2.8rem)]"
            >
              Login sistem pondok yang rapi.
            </h1>

            <p className="mt-4 max-w-md text-[0.91rem] leading-[1.62] text-mist-100/70 max-lg:text-[0.88rem]">
              Autentikasi terpusat untuk seluruh civitas pondok. Masuk menggunakan identitas yang telah terdaftar di sistem.
            </p>
          </div>

          {/* Bottom: highlight cards */}
          <div className="grid gap-2.5 lg:grid-cols-3 max-[900px]:grid-cols-1 max-[900px]:gap-2">
            {loginHighlights.map((item, index) => (
              <article
                key={item.title}
                className="group rounded-xl border border-white/8 bg-white/5 p-3.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/8 motion-safe:animate-auth-fade-up"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <div className="mb-2.5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-forest-500 transition group-hover:border-forest-500/30 group-hover:bg-forest-500/12">
                  {item.icon}
                </div>
                <h2 className="mb-1 text-[0.8rem] font-bold text-mist-50/90">
                  {item.title}
                </h2>
                <p className="text-[0.72rem] leading-normal text-mist-100/60">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Right panel — login form */}
        <section className="relative z-10 flex h-full min-w-0 items-center p-4 max-sm:p-3">
          <div
            className="relative w-full overflow-hidden rounded-[1.6rem] border border-forest-800/14 bg-[linear-gradient(160deg,rgba(252,254,253,0.99)_0%,rgba(242,248,244,0.97)_100%)] p-7 text-forest-900 shadow-[0_24px_64px_rgba(15,40,26,0.14),0_0_0_1px_rgba(255,255,255,0.7)_inset] motion-safe:animate-auth-fade-up max-sm:p-5"
            aria-labelledby="auth-card-title"
          >
            {/* Decorative glows */}
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(72,140,103,0.1),transparent_65%)]" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(45,122,86,0.07),transparent_65%)]" aria-hidden="true" />

            {/* Shimmer top strip */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden" aria-hidden="true">
              <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(72,144,107,0.5),transparent)] motion-safe:animate-auth-shimmer" />
            </div>

            {/* Card header */}
            <div className="relative mb-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-700/12 bg-forest-700/6 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-forest-700/80">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest-600" />
                  Secure Access
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-forest-700/10 bg-forest-700/5 px-2.5 py-1 text-[0.65rem] font-semibold text-forest-700/60">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path d="M8 1a5 5 0 0 1 5 5v1h.5A1.5 1.5 0 0 1 15 8.5v5A1.5 1.5 0 0 1 13.5 15h-11A1.5 1.5 0 0 1 1 13.5v-5A1.5 1.5 0 0 1 2.5 7H3V6a5 5 0 0 1 5-5Zm0 1.5a3.5 3.5 0 0 0-3.5 3.5v1h7V6A3.5 3.5 0 0 0 8 2.5Z" />
                  </svg>
                  KH2 System
                </span>
              </div>

              <h2
                id="auth-card-title"
                className="font-display text-[clamp(1.7rem,3.2vw,2.15rem)] leading-[0.95] tracking-[-0.04em] text-forest-900"
              >
                Masuk ke workspace
              </h2>
              <p className="mt-2.5 text-[0.87rem] leading-[1.58] text-forest-900/65">
                Gunakan identitas akun aktif untuk mengakses sistem manajemen pondok.
              </p>
            </div>

            <LoginForm
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
              onSubmit={handleLogin}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

