import { useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Tentang", href: "#tentang" },
  { label: "Fitur", href: "#fitur" },
  { label: "Galeri", href: "#galeri" },
] as const;

const stats = [
  { value: "43", label: "Santri aktif", detail: "pembinaan terdata dalam satu sistem" },
  { value: "4 Role", label: "Akses terpisah", detail: "santri, wali, pengurus, dan guru" },
  { value: "24/7", label: "Monitoring data", detail: "aktivitas dan progres lebih mudah dipantau" },
] as const;

const features = [
  {
    title: "Monitoring Presensi",
    description: "Lihat status hadir, izin, dan alfa setiap sesi dengan rekap yang mudah dibaca.",
    tone: "from-emerald-500/20 to-emerald-400/5",
    symbol: "01",
  },
  {
    title: "Progress Keilmuan",
    description: "Catat dan evaluasi perkembangan hafalan, materi, serta capaian akademik santri.",
    tone: "from-teal-500/20 to-teal-400/5",
    symbol: "02",
  },
  {
    title: "Akses Wali Terarah",
    description: "Wali santri mendapat informasi aktivitas dan progres tanpa harus menunggu laporan manual.",
    tone: "from-sky-400/20 to-cyan-400/5",
    symbol: "03",
  },
  {
    title: "Riwayat Terdokumentasi",
    description: "Semua perubahan data tersimpan rapi agar audit dan evaluasi lebih akurat.",
    tone: "from-emerald-400/20 to-lime-400/5",
    symbol: "04",
  },
] as const;

const aboutHighlights = [
  {
    value: "1 Dashboard",
    description: "Integrasi data dan aktivitas seluruh peran dalam satu sistem terpadu.",
  },
  {
    value: "Role-based",
    description: "Tampilan disesuaikan dengan kebutuhan pengguna.",
  },
] as const;

const galleryItems = [
  {
    title: "Belajar",
    description: "Suasana belajar dengan pembinaan yang terstruktur.",
    src: "/assets/images/landing/gallery-belajar.jpg",
  },
  {
    title: "Keakraban",
    description: "Momen kebersamaan untuk menjaga keakraban antar santri.",
    src: "/assets/images/landing/gallery-keakraban.jpg",
  },
  {
    title: "ORUMAWA",
    description: "Kegiatan olahraga rutin untuk menjaga kebugaran dan kekompakan.",
    src: "/assets/images/landing/gallery-orumawa.jpeg",
  },
] as const;

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(45,122,86,0.24),transparent_32%),radial-gradient(ellipse_at_bottom_right,rgba(72,144,107,0.16),transparent_36%),linear-gradient(180deg,#081e14_0%,#0b2117_42%,#081e14_100%)] text-mist-50">
      <div className="pointer-events-none fixed inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:4.75rem_4.75rem]" />

      <header className="sticky top-0 z-50 border-b border-white/8 bg-forest-950/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/7 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
              <img src="/assets/images/logo_ppm.png" alt="Logo KH2" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-mist-100/50">PPM KH2</p>
              <p className="font-display text-[1.02rem] leading-none tracking-[-0.03em] text-mist-50">
                KH2 Management System
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.88rem] font-medium text-mist-100/62 transition-colors hover:text-mist-50"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.82rem] font-semibold text-mist-100/80 transition hover:border-white/18 hover:bg-white/8 hover:text-mist-50"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#174c34,#2d7a56)] px-5 py-2.5 text-[0.84rem] font-bold text-white shadow-[0_16px_40px_rgba(16,53,37,0.36)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(16,53,37,0.46)]"
            >
              Masuk Sistem
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-mist-50 md:hidden"
          >
            {isMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-white/8 bg-forest-950/92 px-5 py-4 backdrop-blur-xl sm:px-8 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-mist-100/76 transition hover:border-white/8 hover:bg-white/5 hover:text-mist-50"
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#174c34,#2d7a56)] px-4 py-3 text-sm font-bold text-white"
              >
                Login ke Sistem
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <section id="home" className="relative">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-16">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-forest-400">
              <span className="h-2 w-2 rounded-full bg-forest-500" />
              Platform Digitalisasi KH2
            </span>

            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.9rem,7vw,5.6rem)] leading-[0.9] tracking-[-0.055em] text-mist-50">
              Pusat Manajemen Data{" "}
              <span className="bg-[linear-gradient(135deg,#7bc39b,#dceadf)] bg-clip-text text-transparent">
                PPM Khoirul
              </span>{" "}
              Huda 2
            </h1>

            <p className="mt-6 max-w-2xl text-[1rem] leading-[1.78] text-mist-100/68 md:text-[1.04rem]">
              Menghadirkan sistem manajemen terpadu untuk memudahkan civitas KH2 dalam mengelola data dan
              aktivitas pesantren secara efisien.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#fitur"
                className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#174c34,#2d7a56)] px-6 py-3.5 text-[0.92rem] font-bold text-white shadow-[0_18px_42px_rgba(16,53,37,0.38)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(16,53,37,0.48)]"
              >
                Lihat Fitur
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-[0.92rem] font-semibold text-mist-50/82 backdrop-blur-sm transition hover:border-white/16 hover:bg-white/8 hover:text-mist-50"
              >
                Masuk Dashboard
              </Link>
            </div>
          </div>

          <div className="relative z-10 lg:pl-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-3 shadow-[0_40px_90px_rgba(4,14,9,0.42)] backdrop-blur-2xl">
              <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(72,144,107,0.56),transparent)]" />
              <div className="overflow-hidden rounded-[1.55rem] border border-white/8">
                <img
                  src="/assets/images/landing/hero.jpg"
                  alt="Kegiatan bersama santri KH2"
                  className="h-[320px] w-full object-cover sm:h-[430px] lg:h-[520px]"
                />
              </div>
              <div className="pointer-events-none absolute inset-3 rounded-[1.55rem] bg-[linear-gradient(to_top,rgba(8,30,20,0.68),transparent_45%)]" />

              <div className="absolute left-6 top-6 max-w-[14rem] rounded-2xl border border-white/10 bg-forest-950/72 p-4 backdrop-blur-xl">
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-forest-400">Presensi</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-mist-50">Rekap harian realtime</p>
              </div>

              <div className="absolute -bottom-4 right-5 w-[15rem] rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(8,30,20,0.92),rgba(18,54,38,0.88))] p-4 shadow-[0_20px_50px_rgba(4,14,9,0.42)] backdrop-blur-xl sm:w-[18rem]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-forest-400">Progres</p>
                    <p className="mt-1 text-sm font-semibold text-mist-50">Pantau perkembangan setiap santri</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
                    <img src="/assets/images/logo_ppm.png" alt="Logo KH2" className="h-7 w-7 object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/7 bg-black/10 py-6">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/8 px-0 sm:px-8 lg:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="bg-forest-950/86 px-6 py-6 text-center backdrop-blur-sm">
              <p className="font-display text-[clamp(1.9rem,4vw,3rem)] leading-none tracking-[-0.05em] text-mist-50">
                {item.value}
              </p>
              <p className="mt-2 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-forest-400">{item.label}</p>
              <p className="mt-1 text-[0.76rem] leading-6 text-mist-100/50">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tentang" className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
          <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-7 shadow-[0_20px_56px_rgba(4,14,9,0.22)] backdrop-blur-xl sm:p-9">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-500/24 bg-forest-700/10 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-forest-400">
              Tentang KH2
            </span>
            <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] tracking-[-0.05em] text-mist-50">
              Satu Platform untuk Operasional Pesantren yang Lebih Terkelola
            </h2>
            <p className="mt-5 max-w-3xl text-[0.98rem] leading-[1.86] text-mist-100/64">
              KH2 mengintegrasikan administrasi, pembinaan, dan pelaporan dalam satu sistem terpadu untuk
              mendukung pengambilan keputusan, pemantauan wali, serta evaluasi santri secara terstruktur.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {aboutHighlights.map((item) => (
              <article
                key={item.value}
                className="rounded-[1.75rem] border border-white/8 bg-white/5 p-5 backdrop-blur-xl transition hover:border-forest-500/24 hover:bg-white/7"
              >
                <h3 className="font-display text-[1.7rem] leading-none tracking-[-0.04em] text-forest-400">
                  {item.value}
                </h3>
                <p className="mt-3 text-[0.84rem] leading-7 text-mist-100/62">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="fitur" className="border-t border-white/6 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-500/24 bg-forest-700/10 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-forest-400">
              Fitur Utama
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] tracking-[-0.05em] text-mist-50">
              Dirancang untuk Efisiensi, Kejelasan, dan Kecepatan Kerja
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((item) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-6 shadow-[0_16px_40px_rgba(4,14,9,0.16)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/14"
              >
                <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${item.tone} blur-2xl`} />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 font-display text-[1.05rem] font-bold text-forest-400">
                    {item.symbol}
                  </div>
                  <h3 className="mt-5 text-[1rem] font-bold text-mist-50/92">{item.title}</h3>
                  <p className="mt-3 text-[0.84rem] leading-[1.72] text-mist-100/60">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="galeri" className="border-t border-white/6 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-forest-500/24 bg-forest-700/10 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-forest-400">
                Galeri Kegiatan
              </span>
              <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] tracking-[-0.05em] text-mist-50">
                Potret Aktivitas Santri KH2
              </h2>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.82rem] font-semibold text-mist-100/78 transition hover:border-white/16 hover:bg-white/8 hover:text-mist-50"
            >
              Masuk dan jelajahi sistem
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="group relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/5 shadow-[0_28px_72px_rgba(4,14,9,0.22)]">
              <img
                src={galleryItems[0].src}
                alt={galleryItems[0].title}
                className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-[500px]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,30,20,0.82),rgba(8,30,20,0.08)_55%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-forest-400">Galeri Kegiatan</p>
                <h3 className="mt-2 font-display text-[1.8rem] leading-none tracking-[-0.04em] text-mist-50">
                  {galleryItems[0].title}
                </h3>
                <p className="mt-3 max-w-lg text-[0.9rem] leading-7 text-mist-100/70">{galleryItems[0].description}</p>
              </div>
            </article>

            <div className="grid gap-5">
              {galleryItems.slice(1).map((item) => (
                <article
                  key={item.title}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/5 shadow-[0_20px_52px_rgba(4,14,9,0.18)]"
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    className="h-[200px] w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-[240px]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,30,20,0.78),rgba(8,30,20,0.08)_55%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-[1.35rem] leading-none tracking-[-0.04em] text-mist-50">{item.title}</h3>
                    <p className="mt-2 text-[0.82rem] leading-6 text-mist-100/68">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-forest-500/18 bg-[linear-gradient(135deg,rgba(23,76,52,0.72),rgba(8,30,20,0.92))] px-7 py-12 shadow-[0_36px_84px_rgba(4,14,9,0.36)] sm:px-10 sm:py-14">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(72,144,107,0.18),transparent_35%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(45,122,86,0.15),transparent_30%)]" />
            </div>
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-forest-400">
                  Mulai Sekarang
                </span>
                <h2 className="mt-5 font-display text-[clamp(2.1rem,4.4vw,3.7rem)] leading-[0.94] tracking-[-0.05em] text-mist-50">
                  Optimalkan Manajemen Pesantren dari Satu Tempat
                </h2>
                <p className="mt-4 max-w-xl text-[0.96rem] leading-[1.8] text-mist-100/66">
                  Platform KH2 membantu civitas KH2 bekerja dengan alur yang lebih cepat dan data yang lebih
                  akurat.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-mist-50 px-6 py-3.5 text-[0.9rem] font-bold text-forest-900 transition hover:bg-white"
                >
                  Login ke Sistem
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href="#home"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-[0.9rem] font-semibold text-mist-50/84 transition hover:border-white/16 hover:bg-white/8 hover:text-mist-50"
                >
                  Kembali ke atas
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-sm text-mist-100/52 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>(c) {new Date().getFullYear()} WebDev KH2. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#home" className="transition hover:text-mist-50">
              Home
            </a>
            <a href="#tentang" className="transition hover:text-mist-50">
              Tentang
            </a>
            <a href="#galeri" className="transition hover:text-mist-50">
              Galeri
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
