# FrontEnd_KH2-Management-System

Starter frontend dengan React + TypeScript + Vite dan struktur folder yang
rapi untuk dikembangkan menjadi aplikasi manajemen.

## Menjalankan project

```bash
npm install
npm run dev
```

## Struktur folder

```text
src
|- app
|  |- providers
|  |- styles
|  \- App.tsx
|- pages
|  \- home
|- widgets
|  |- app-shell
|  \- dashboard-overview
|- shared
|  |- config
|  |- lib
|  |- types
|  \- ui
\- main.tsx
```

## Aturan penempatan file

- `app`: konfigurasi global, provider, styles, bootstrap aplikasi.
- `pages`: halaman penuh yang menyusun widget dan flow bisnis.
- `widgets`: blok UI level menengah yang dipakai di halaman.
- `shared`: utilitas, tipe, config, dan komponen kecil reusable.

## Catatan

- Alias import `@/` sudah diarahkan ke folder `src`.
- Baseline ini cocok untuk mulai menambahkan routing, state management, atau
  API layer saat modul bisnis mulai bertambah.
