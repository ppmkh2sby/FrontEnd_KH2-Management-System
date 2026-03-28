import { useState } from "react";
import { Link } from "react-router-dom";
import "@/frontend-static-demo/frontendStaticDemo.css";

const navLinks = [
  { label: "Tentang", href: "#tentang" },
  { label: "Fitur", href: "#fitur" },
  { label: "Galeri", href: "#galeri" },
] as const;

const miniStats = [
  { title: "4 Role", detail: "Santri, wali, pengurus, guru" },
  { title: "Static Ready", detail: "Tanpa build step tambahan" },
  { title: "Vercel Friendly", detail: "Clean route untuk landing dan login" },
] as const;

const bandStats = [
  { title: "1 Dashboard", detail: "Pusat navigasi untuk kebutuhan operasional pondok." },
  { title: "Responsive", detail: "Tetap nyaman di mobile, tablet, dan desktop." },
  { title: "Demo Safe", detail: "Interaksi login disimulasikan untuk presentasi cepat." },
] as const;

const aboutCards = [
  {
    title: "Self-contained",
    detail: "Implementasi demo sudah dipindahkan menjadi bagian dari aplikasi utama.",
  },
  {
    title: "Clean Routing",
    detail: "Route demo sekarang hidup di dalam src dan ikut dikelola oleh React Router.",
  },
  {
    title: "Reusable Visual",
    detail: "Tetap memakai identitas visual dan aset KH2 yang sudah ada di proyek.",
  },
] as const;

const featureCards = [
  {
    index: "01",
    title: "Hero landing yang fokus",
    detail: "Menonjolkan manfaat platform, identitas KH2, dan call to action langsung ke login demo.",
  },
  {
    index: "02",
    title: "Login interaktif",
    detail: "Ada validasi ringan, pilihan akun demo, dan feedback sukses tanpa backend.",
  },
  {
    index: "03",
    title: "Siap host via app utama",
    detail: "Tidak perlu root folder terpisah. Demo ikut ter-deploy bersama aplikasi Vite sekarang.",
  },
] as const;

const galleryCards = [
  {
    title: "Belajar",
    detail: "Pembinaan dengan suasana yang tertata dan fokus.",
    src: "/assets/images/landing/gallery-belajar.jpg",
  },
  {
    title: "Keakraban",
    detail: "Hubungan antar santri yang kuat dan terjaga.",
    src: "/assets/images/landing/gallery-keakraban.jpg",
  },
  {
    title: "ORUMAWA",
    detail: "Kegiatan lapangan yang memperkuat kebugaran dan disiplin.",
    src: "/assets/images/landing/gallery-orumawa.jpeg",
  },
] as const;

export function FrontendStaticDemoLandingPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="fsd-shell">
      <header className="fsd-header">
        <div className="fsd-container fsd-headerInner">
          <a className="fsd-brand" href="#home">
            <span className="fsd-brandMark">
              <img src="/assets/images/logo_ppm.png" alt="Logo PPM KH2" />
            </span>
            <span className="fsd-brandCopy">
              <strong>PPM KH2</strong>
              <span>KH2 Management System</span>
            </span>
          </a>

          <button
            type="button"
            className="fsd-navToggle"
            aria-expanded={isNavOpen}
            onClick={() => setIsNavOpen((current) => !current)}
          >
            Menu
          </button>

          <nav className={`fsd-nav${isNavOpen ? " fsd-navOpen" : ""}`}>
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setIsNavOpen(false)}>
                {item.label}
              </a>
            ))}
            <Link to="/frontend-static-demo/login" onClick={() => setIsNavOpen(false)}>
              Login
            </Link>
            <Link
              className="fsd-button fsd-buttonPrimary fsd-buttonCompact"
              to="/frontend-static-demo/login"
              onClick={() => setIsNavOpen(false)}
            >
              Masuk Demo
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="fsd-section" id="home">
          <div className="fsd-container fsd-heroGrid">
            <div className="fsd-heroCopy">
              <span className="fsd-eyebrow">Frontend Static Demo</span>
              <h1>Landing page dan login page KH2 yang siap dipresentasikan.</h1>
              <p className="fsd-heroLead">
                Tampilan demo sekarang berada di dalam `src`, sehingga ikut di-host bersama
                aplikasi utama tanpa folder deploy terpisah.
              </p>
              <div className="fsd-heroActions">
                <Link className="fsd-button fsd-buttonPrimary" to="/frontend-static-demo/login">
                  Buka Login Demo
                </Link>
                <a className="fsd-button fsd-buttonSecondary" href="#fitur">
                  Lihat Fitur
                </a>
              </div>
              <div className="fsd-miniStats">
                {miniStats.map((item) => (
                  <article key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="fsd-visualCard">
                <img src="/assets/images/landing/hero.jpg" alt="Aktivitas santri KH2" />
                <div className="fsd-visualOverlay" />
                <div className="fsd-visualNote fsd-topNote">
                  <span>Realtime Recap</span>
                  <strong>Monitoring aktivitas harian lebih terarah</strong>
                </div>
                <div className="fsd-visualNote fsd-bottomNote">
                  <span>Hosted via Src</span>
                  <strong>Demo sekarang hidup sebagai route React di aplikasi utama</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fsd-statsBand">
          <div className="fsd-container fsd-statGrid">
            {bandStats.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="fsd-section" id="tentang">
          <div className="fsd-container fsd-splitSection">
            <div className="fsd-sectionCopy">
              <span className="fsd-eyebrow">Tentang Demo</span>
              <h2>Folder demo dipindah ke dalam source aplikasi.</h2>
              <p>
                Implementasi ini tidak lagi bergantung pada folder HTML statis terpisah.
                Semua halaman demo sekarang dirender lewat React Router sehingga satu alur
                dengan hosting utama aplikasi.
              </p>
            </div>

            <div className="fsd-featureStack">
              {aboutCards.map((item) => (
                <article key={item.title} className="fsd-softCard">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="fsd-section" id="fitur">
          <div className="fsd-container">
            <div className="fsd-sectionHeading">
              <span className="fsd-eyebrow">Fitur Demo</span>
              <h2>Disusun untuk terlihat presentable tanpa menunggu backend aktif.</h2>
            </div>

            <div className="fsd-featureGrid">
              {featureCards.map((item) => (
                <article key={item.index} className="fsd-glassCard">
                  <span className="fsd-cardIndex">{item.index}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="fsd-section" id="galeri">
          <div className="fsd-container">
            <div className="fsd-sectionHeading">
              <span className="fsd-eyebrow">Galeri KH2</span>
              <h2>Visual pendukung untuk membuat halaman demo terasa hidup.</h2>
            </div>

            <div className="fsd-galleryGrid">
              <article className="fsd-galleryCard fsd-galleryLarge">
                <img src={galleryCards[0].src} alt={galleryCards[0].title} />
                <div className="fsd-galleryCopy">
                  <strong>{galleryCards[0].title}</strong>
                  <span>{galleryCards[0].detail}</span>
                </div>
              </article>
              <div className="fsd-featureStack">
                {galleryCards.slice(1).map((item) => (
                  <article key={item.title} className="fsd-galleryCard">
                    <img src={item.src} alt={item.title} />
                    <div className="fsd-galleryCopy">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fsd-ctaSection">
          <div className="fsd-container">
            <div className="fsd-ctaPanel">
              <div>
                <span className="fsd-eyebrow">Demo CTA</span>
                <h2>Masuk ke halaman login dan gunakan akun demo yang sudah disiapkan.</h2>
              </div>
              <Link className="fsd-button fsd-buttonLight" to="/frontend-static-demo/login">
                Masuk ke Login Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="fsd-footer">
        <div className="fsd-container fsd-footerInner">
          <p>(c) {new Date().getFullYear()} KH2 Management System Demo</p>
          <Link to="/frontend-static-demo/login">Login Page</Link>
        </div>
      </footer>
    </div>
  );
}
