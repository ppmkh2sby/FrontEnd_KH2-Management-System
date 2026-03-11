import type { PropsWithChildren } from "react";

import { navigationItems } from "@/shared/config/navigation";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__eyebrow">React + TypeScript</span>
          <h1 className="brand__title">KH2 Frontend</h1>
          <p className="brand__text">
            Struktur yang mudah diperluas untuk dashboard, master data, dan
            workflow operasional.
          </p>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {navigationItems.map((item, index) => (
            <a
              key={item.title}
              className={`nav__item ${index === 0 ? "nav__item--active" : ""}`}
              href={item.href}
            >
              <span className="nav__title">{item.title}</span>
              <span className="nav__caption">{item.caption}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar__footer">
          Simpan aturan global di `app`, UI reusable di `shared`, dan layar
          bisnis di `pages` atau `widgets`.
        </div>
      </aside>

      <main className="page">{children}</main>
    </div>
  );
}
