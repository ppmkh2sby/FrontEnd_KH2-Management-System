import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";
import { Link } from "react-router-dom";

import { fetchPublicSantriTotal } from "@/shared/lib/santri-data";

const features = [
  ["Presensi", "Rekap kehadiran yang jelas untuk setiap sesi."],
  ["Progress", "Perkembangan santri tersusun dalam satu tempat."],
  ["Akses wali", "Informasi penting mudah dipantau dari akun wali."],
] as const;

const aboutPillars = [
  ["01", "Administrasi"],
  ["02", "Pembinaan"],
  ["03", "Laporan"],
] as const;

const galleryItems = [
  ["Belajar", "/assets/images/landing/gallery-belajar.webp", 960, 720],
  ["Kebersamaan", "/assets/images/landing/gallery-keakraban.webp", 960, 720],
  ["Kegiatan", "/assets/images/landing/gallery-orumawa.webp", 960, 540],
] as const;

export function LandingPage() {
  const [santriTotal, setSantriTotal] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void fetchPublicSantriTotal(controller.signal)
      .then((total) => setSantriTotal(Math.max(0, total)))
      .catch(() => {
        if (!controller.signal.aborted) {
          setSantriTotal(0);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfcfa] text-forest-950">
      <header className="sticky top-0 z-30 border-b border-forest-900/8 bg-[#fbfcfa]/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#home" className="flex items-center gap-3" aria-label="PPM KH2">
            <img src="/assets/images/logo_ppm.webp" alt="Logo PPM KH2" width="36" height="36" className="h-9 w-9 object-contain" />
            <span className="text-sm font-bold tracking-[-0.03em]">PPM Khoirul Huda 2</span>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-forest-900/62 md:flex" aria-label="Navigasi utama">
            <a href="#tentang" className="transition hover:text-forest-800">Tentang</a>
            <a href="#fitur" className="transition hover:text-forest-800">Fitur</a>
            <a href="#galeri" className="transition hover:text-forest-800">Galeri</a>
          </nav>

          <Link to="/login" className="rounded-full bg-forest-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-forest-700 sm:px-5 sm:text-sm">
            Masuk
          </Link>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-36 h-[32rem] w-[32rem] rounded-full bg-emerald-200/45 blur-3xl" />
        <div className="pointer-events-none absolute -left-36 bottom-0 h-72 w-72 rounded-full bg-lime-100/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-10 sm:px-8 sm:pb-14 sm:pt-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-16 lg:pb-16 lg:pt-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">KH2 Management System</p>
            <h1 className="mt-6 max-w-xl font-display text-[clamp(3rem,5vw,5.4rem)] leading-[0.92] tracking-[-0.055em] text-forest-950">
              <>
                Pusat Manajemen
                <br />
                Data PPM
                <br />
                Khoirul Huda 2
              </>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-forest-900/65">
              Kelola data, pantau perkembangan, dan dukung aktivitas santri dalam satu sistem terintegrasi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-700">
                Masuk ke sistem <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a href="#fitur" className="inline-flex items-center rounded-full border border-forest-900/12 bg-white/70 px-6 py-3 text-sm font-semibold text-forest-900 transition hover:bg-white">
                Lihat fitur
              </a>
            </div>
          </div>

          <LandingHeroVisual />
        </div>
      </section>

      <section className="border-y border-forest-900/8 bg-white/70 text-forest-950">
        <div className="mx-auto grid max-w-7xl divide-y divide-forest-900/8 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          <AnimatedMetric
            target={santriTotal}
            suffix=""
            label="SANTRI AKTIF"
            description="pembinaan terdata dalam satu sistem"
          />
          <AnimatedMetric
            target={4}
            suffix=" Role"
            label="AKSES TERPISAH"
            description="santri, wali, pengurus, dan guru"
          />
          <AnimatedMetric
            target={24}
            suffix="/7"
            label="MONITORING DATA"
            description="aktivitas dan progres lebih mudah dipantau"
          />
        </div>
      </section>

      <section id="tentang" className="relative overflow-hidden border-y border-forest-900/8 bg-[#fbfcfa]">
        <div className="pointer-events-none absolute -right-48 top-1/4 h-96 w-96 rounded-full bg-emerald-100/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-[0.28fr_0.72fr] lg:gap-20 lg:py-36">
          <div className="flex items-start justify-between gap-6 lg:min-h-[22rem] lg:flex-col">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Tentang
            </p>
            <span className="text-xs font-bold tracking-[0.16em] text-forest-900/35 lg:mt-auto">01 / 03</span>
          </div>

          <div className="relative">
            <h2 className="max-w-4xl font-display text-[clamp(2.15rem,3.9vw,4rem)] leading-[1.02] tracking-[-0.055em] text-forest-950">
              Alur kerja yang lebih ringkas<br className="hidden sm:block" /> untuk civitas KH2.
            </h2>
            <p className="mt-7 max-w-xl text-base leading-7 text-forest-900/64 sm:text-lg">
              Satu sistem untuk administrasi, pembinaan, dan pelaporan.
            </p>

            <div className="mt-16 grid border-t border-forest-900/12 sm:grid-cols-3 sm:gap-8">
              {aboutPillars.map(([number, title]) => (
                <article key={title} className="flex items-baseline gap-4 border-b border-forest-900/12 py-5 last:border-b-0 sm:border-b-0 sm:py-6">
                  <p className="text-xs font-bold tracking-[0.16em] text-emerald-700">{number}</p>
                  <h3 className="text-lg font-bold tracking-[-0.03em] text-forest-950">{title}</h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="border-y border-forest-900/8 bg-[#f2f7f3]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Fitur utama</p>
              <h2 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.7rem)] leading-[0.98] tracking-[-0.05em]">Yang dibutuhkan, tanpa kerumitan.</h2>
            </div>
            <Link to="/login" className="text-sm font-bold text-emerald-700 transition hover:text-forest-950">Masuk ke sistem <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[1.5rem] border border-forest-900/10 bg-forest-900/10 md:grid-cols-3">
            {features.map(([title, description], index) => (
              <article key={title} className="bg-[#f2f7f3] p-6 sm:p-8">
                <p className="text-xs font-bold text-emerald-700">0{index + 1}</p>
                <h3 className="mt-8 text-xl font-bold tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-7 text-forest-900/60">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="galeri" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Galeri</p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.7rem)] leading-[0.98] tracking-[-0.05em]">Kehidupan di KH2.</h2>
          </div>
          <span className="hidden text-sm text-forest-900/52 sm:block">Memuat saat Anda mendekati bagian ini.</span>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {galleryItems.map(([title, src, width, height]) => (
            <figure key={title} className="group overflow-hidden rounded-[1.5rem] bg-[#edf4ef]">
              <img src={src} alt={title} width={width} height={height} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              <figcaption className="px-4 py-4 text-sm font-bold">{title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="flex flex-col gap-7 rounded-[2rem] bg-forest-900 px-7 py-10 text-white sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">KH2 Management System</p>
            <h2 className="mt-3 font-display text-4xl tracking-[-0.04em]">Masuk dan mulai bekerja.</h2>
          </div>
          <Link to="/login" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-forest-900 transition hover:bg-mist-100">Masuk <ArrowRightIcon className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-forest-900/8 px-5 py-7 text-sm text-forest-900/52 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>PPM KH2 Management System</p>
          <p>{new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}

function LandingHeroVisual() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({
      x: Number((normalizedY * -8).toFixed(2)),
      y: Number((normalizedX * 12).toFixed(2)),
    });
  };

  const sceneStyle = {
    "--landing-tilt-x": `${tilt.x}deg`,
    "--landing-tilt-y": `${tilt.y}deg`,
  } as CSSProperties;

  return (
    <div
      className="landing-hero-visual relative min-h-[21rem] sm:min-h-[29rem] lg:min-h-[35rem]"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="landing-hero-space" aria-hidden="true">
        <div className="landing-hero-space__glow landing-hero-space__glow--one" />
        <div className="landing-hero-space__glow landing-hero-space__glow--two" />
        <div className="landing-hero-orbit landing-hero-orbit--one" />
        <div className="landing-hero-orbit landing-hero-orbit--two" />
        <div className="landing-hero-orbit landing-hero-orbit--three" />
        <span className="landing-hero-particle landing-hero-particle--one" />
        <span className="landing-hero-particle landing-hero-particle--two" />
        <span className="landing-hero-particle landing-hero-particle--three" />
      </div>

      <div className="landing-hero-card" style={sceneStyle}>
        <figure className="relative overflow-hidden rounded-[2rem] border border-forest-900/8 bg-white/90 p-2 shadow-[0_28px_70px_rgba(8,30,20,0.14)] backdrop-blur-sm">
          <img
            src="/assets/images/landing/hero.webp"
            alt="Kegiatan santri PPM KH2"
            width="1600"
            height="1065"
            fetchPriority="high"
            decoding="async"
            className="aspect-[4/3] w-full rounded-[1.55rem] object-cover object-center"
          />
        </figure>
      </div>

    </div>
  );
}

function AnimatedMetric({
  target,
  suffix,
  label,
  description,
}: {
  target: number;
  suffix: string;
  label: string;
  description: string;
}) {
  const value = useCountUp(target);

  return (
    <div className="px-5 py-6 text-center sm:px-8 sm:py-7 md:py-8" aria-label={`${value}${suffix} — ${label}`}>
      <p className="font-display text-[clamp(2.4rem,4vw,3.8rem)] font-semibold leading-none tracking-[-0.065em] text-forest-950 tabular-nums">
        {value.toLocaleString("id-ID")}{suffix}
      </p>
      <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-forest-900">{label}</p>
      <p className="mt-2 text-xs leading-5 text-forest-900/58 sm:text-sm">{description}</p>
    </div>
  );
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    let frameId = 0;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      startTime ??= timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [duration, target]);

  return value;
}

function DotIcon() {
  return <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />;
}

function ArrowRightIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" /></svg>;
}
