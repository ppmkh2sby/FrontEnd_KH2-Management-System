import type { DashboardMetric, SectionCardProps } from "@/shared/types/dashboard";

export const metricCards: DashboardMetric[] = [
  {
    label: "Layer utama",
    value: 4,
    hint: "app, pages, widgets, shared",
  },
  {
    label: "Contoh komponen",
    value: 3,
    hint: "shell, overview, reusable card",
  },
  {
    label: "Alias import",
    value: 1,
    hint: "gunakan @/ untuk import yang konsisten",
  },
];

export const moduleCards: SectionCardProps[] = [
  {
    title: "app",
    description: "Tempat konfigurasi global aplikasi dan provider utama.",
    badge: "01",
    items: [
      { label: "providers/", meta: "Context, theme, query client" },
      { label: "styles/", meta: "Global CSS, token, reset" },
      { label: "App.tsx", meta: "Komposisi root aplikasi" },
    ],
  },
  {
    title: "pages",
    description: "Layar per halaman yang menyusun widget dan fitur bisnis.",
    badge: "02",
    items: [
      { label: "home/", meta: "Dashboard atau landing page" },
      { label: "users/", meta: "Halaman manajemen pengguna" },
      { label: "reports/", meta: "Halaman pelaporan" },
    ],
  },
  {
    title: "widgets",
    description: "Blok UI menengah yang dipakai untuk menyusun halaman.",
    badge: "03",
    items: [
      { label: "app-shell/", meta: "Sidebar, header, area konten" },
      { label: "dashboard-overview/", meta: "Ringkasan metrik halaman" },
      { label: "tables/", meta: "Tabel reusable level halaman" },
    ],
  },
  {
    title: "shared",
    description: "Aset reusable lintas modul: utilitas, tipe, config, UI kecil.",
    badge: "04",
    items: [
      { label: "config/", meta: "Konstanta navigasi dan data statis" },
      { label: "lib/", meta: "Helper formatter dan utilities" },
      { label: "ui/", meta: "Komponen kecil reusable" },
    ],
  },
];
