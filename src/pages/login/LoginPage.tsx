import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LoginForm } from "@/widgets/auth/login-form/LoginForm";
import { useAuth } from "@/app/providers/AuthProvider";
import { ApiError } from "@/shared/lib/http";

const loginHighlights = [
  {
    title: "Akses fleksibel",
    detail: "Gunakan NIS, kode akun, atau email sesuai tahap sistem.",
  },
  {
    title: "Flow lanjutan siap",
    detail: "Setelah login pertama, user bisa diarahkan ke ganti password, isi email, dan verifikasi email.",
  },
  {
    title: "Tampilan profesional",
    detail: "Fullscreen, no-scroll, dan tetap fokus pada proses autentikasi.",
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
    <main className="relative grid h-dvh min-h-dvh place-items-center overflow-hidden bg-[radial-gradient(circle_at_14%_18%,rgba(68,138,100,0.34),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(241,247,243,0.18),transparent_18%),linear-gradient(112deg,#081e14_0%,#123626_26%,#28543f_48%,#dbe6df_76%,#f6faf7_100%)] p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="absolute -left-2 top-[-9rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(73,146,107,0.4),transparent_70%)] blur-xl motion-safe:animate-auth-orb-float" />
        <span className="absolute bottom-[-10rem] right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(246,250,247,0.82),transparent_72%)] blur-xl motion-safe:animate-auth-orb-float motion-safe:[animation-duration:22s]" />
        <span className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:6rem_6rem] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.72),transparent_88%)] motion-safe:animate-auth-grid-shift" />
        <div className="absolute left-[-10%] top-[11%] hidden w-max gap-3 whitespace-nowrap opacity-10 lg:flex motion-safe:animate-auth-marquee-left">
          {[...loginKeywords, ...loginKeywords].map((item, index) => (
            <span
              key={`top-${item}-${index}`}
              className="inline-flex min-h-9 items-center rounded-full border border-white/8 bg-white/4 px-3.5 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-mist-50/60"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="absolute bottom-[9%] left-[-10%] hidden w-max gap-3 whitespace-nowrap opacity-[0.08] lg:flex motion-safe:animate-auth-marquee-right">
          {[...loginKeywords.slice().reverse(), ...loginKeywords.slice().reverse()].map((item, index) => (
            <span
              key={`bottom-${item}-${index}`}
              className="inline-flex min-h-9 items-center rounded-full border border-white/8 bg-white/4 px-3.5 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-mist-50/55"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 grid h-[min(700px,calc(100dvh-2rem))] w-full max-w-[1160px] overflow-hidden rounded-[1.9rem] border border-white/12 bg-white/[0.08] shadow-[0_30px_84px_rgba(8,21,15,0.26)] backdrop-blur-xl max-lg:grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,420px)] max-md:h-[calc(100dvh-1.7rem)]">
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="absolute inset-y-0 left-0 right-[37%] bg-[radial-gradient(circle_at_20%_18%,rgba(78,151,111,0.2),transparent_28%),linear-gradient(180deg,rgba(9,30,20,0.98)_0%,rgba(17,45,31,0.94)_100%)] max-lg:right-0 max-lg:bg-[radial-gradient(circle_at_16%_16%,rgba(78,151,111,0.18),transparent_24%),linear-gradient(180deg,rgba(9,30,20,0.98)_0%,rgba(17,45,31,0.94)_42%,rgba(248,251,249,0.98)_42%,rgba(240,246,242,0.96)_100%)]" />
          <div className="absolute bottom-[1.4rem] left-[calc(63%-1px)] top-[1.4rem] w-px bg-[linear-gradient(180deg,transparent_0%,rgba(53,110,81,0.18)_15%,rgba(53,110,81,0.18)_85%,transparent_100%)] max-lg:left-[1.4rem] max-lg:right-[1.4rem] max-lg:top-[42%] max-lg:h-px max-lg:w-auto" />
        </div>

        <section
          className="relative z-10 h-full min-w-0 p-[1.45rem_1.55rem] max-lg:p-[1.2rem_1.2rem_0.95rem] max-sm:hidden"
          aria-labelledby="auth-hero-title"
        >
          <div className="grid h-full content-start grid-rows-[auto_auto_1fr] gap-4 motion-safe:animate-auth-fade-up">
            <div className="grid max-w-[30rem] gap-3">
              <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-mist-100/70">
                Pondok Pesantren Mahasiswa Khoirul Huda 2
              </p>
              <span className="inline-flex w-fit items-center justify-center rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-mist-50/85">
                Portal login utama
              </span>
              <h1
                id="auth-hero-title"
                className="m-0 max-w-[8.5ch] font-display text-[clamp(2.45rem,4.9vw,4rem)] leading-[0.92] tracking-[-0.05em] text-mist-50 drop-shadow-[0_18px_34px_rgba(3,10,7,0.12)] max-lg:max-w-[11ch] max-md:max-w-none max-md:text-[clamp(2rem,7vw,3.1rem)]"
              >
                Login sistem pondok yang rapi dan siap dipakai.
              </h1>
              <p className="m-0 max-w-[30rem] text-[0.94rem] leading-[1.58] text-mist-100/85 max-md:max-w-none max-md:text-[0.92rem] max-md:leading-[1.56]">
                Halaman ini dirancang untuk memberi kesan aplikasi yang serius,
                terstruktur, dan mudah dipahami. Fokus utama tetap pada form
                login dengan informasi seperlunya.
              </p>
            </div>

            <article className="w-full max-w-[30rem] rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm motion-safe:animate-auth-fade-up motion-safe:[animation-delay:100ms] max-[700px]:hidden">
              <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-mist-100/70">
                Informasi login
              </p>
              <p className="mt-1.5 text-[0.84rem] leading-[1.52] text-mist-100/80">
                User dapat masuk menggunakan NIS, kode akun, atau email. Setelah
                autentikasi pertama, sistem dapat melanjutkan ke flow perubahan
                password, pengisian email, atau verifikasi email.
              </p>
            </article>

            <div
              className="grid self-end gap-2 max-md:grid-cols-2 lg:grid-cols-3 max-[780px]:gap-2 max-[700px]:gap-0"
              aria-label="Keunggulan tampilan login"
            >
              {loginHighlights.map((item, index) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/6 p-3 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/8 motion-safe:animate-auth-fade-up max-[700px]:hidden"
                  style={{ animationDelay: `${140 + index * 80}ms` }}
                >
                  <p className="mb-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-mist-100/60">
                    0{index + 1}
                  </p>
                  <h2 className="mb-1.5 text-[0.86rem] font-bold text-mist-50">
                    {item.title}
                  </h2>
                  <p className="text-[0.76rem] leading-[1.45] text-mist-100/75">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 h-full min-w-0 p-3 max-md:p-[0.95rem] max-sm:p-[0.9rem]">
          <section
            className="relative grid h-full content-center rounded-3xl border border-forest-800/12 bg-[linear-gradient(180deg,rgba(251,253,252,0.98),rgba(240,246,242,0.96))] p-[1.35rem] text-forest-900 shadow-[0_22px_48px_rgba(23,55,39,0.12)] motion-safe:animate-auth-fade-up max-sm:min-h-full max-sm:rounded-[1.35rem] max-sm:p-[1.08rem]"
            aria-labelledby="auth-card-title"
          >
            <div
              className="pointer-events-none absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(72,140,103,0.12),transparent_70%)]"
              aria-hidden="true"
            />
            <div className="mb-2 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
              <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-forest-700">
                Secure Access
              </p>
              <span className="inline-flex min-h-[1.95rem] items-center justify-center rounded-full border border-forest-700/10 bg-forest-700/6 px-3 py-1 text-[0.72rem] font-bold text-forest-700">
                Backend-ready flow
              </span>
            </div>

            <h2
              id="auth-card-title"
              className="m-0 font-display text-[clamp(1.8rem,3.6vw,2.35rem)] leading-[0.96] tracking-[-0.04em] text-forest-900"
            >
              Masuk ke workspace KH2
            </h2>
            <p className="mb-3 mt-3 text-[0.9rem] leading-[1.54] text-forest-900/76">
              Login menggunakan identitas akun yang aktif. Setelah autentikasi
              berhasil, sesi user akan dimuat dan diarahkan ke flow yang sesuai.
            </p>

            <div className="mb-4 flex flex-wrap gap-1.5">
              <span className="inline-flex min-h-7 items-center rounded-full border border-forest-700/8 bg-forest-700/5 px-2.5 py-1 text-[0.68rem] font-semibold text-forest-900/72">
                NIS / kode akun / email
              </span>
              <span className="inline-flex min-h-7 items-center rounded-full border border-forest-700/8 bg-forest-700/5 px-2.5 py-1 text-[0.68rem] font-semibold text-forest-900/72">
                Flow lanjutan tersedia
              </span>
              <span className="inline-flex min-h-7 items-center rounded-full border border-forest-700/8 bg-forest-700/5 px-2.5 py-1 text-[0.68rem] font-semibold text-forest-900/72">
                Fullscreen no-scroll
              </span>
            </div>

            <LoginForm
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
              onSubmit={handleLogin}
            />

            <p className="mt-3 text-[0.76rem] leading-[1.5] text-forest-900/52 max-[700px]:hidden">
              Tampilan ini tetap mengikuti alur login frontend yang sudah
              disiapkan untuk integrasi backend.
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
