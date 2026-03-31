# FrontEnd_KH2-Management-System

Starter frontend dengan React + TypeScript + Vite dan struktur folder yang
rapi untuk dikembangkan menjadi aplikasi manajemen.

## Menjalankan project

```bash
npm install
npm run dev
```

Untuk development lokal, frontend bisa diarahkan langsung ke backend dengan
env berikut:

```bash
VITE_API_BASE_URL=http://localhost:5132
```

## Build production

Frontend ini ditujukan untuk dibuild menjadi static files lalu dilayani oleh
Nginx.

```bash
npm install
npm run typecheck
npm run build
```

Hasil build ada di folder `dist/`.

## Konfigurasi API

`VITE_API_BASE_URL` bersifat opsional.

- Jika diisi, frontend akan memakai origin tersebut, misalnya untuk development
  lokal: `http://localhost:5132`.
- Jika tidak diisi atau dikosongkan, frontend akan memakai same-origin sehingga
  request menjadi `/api/...`.

File `.env.production` sudah disiapkan dengan nilai kosong agar build production
default ke same-origin.

## Asumsi deployment

Production diasumsikan berjalan di belakang Nginx dengan pola:

- file hasil `npm run build` diserve sebagai static files
- request `/api/` diproxy ke backend
- route SPA diarahkan kembali ke `index.html`

Contoh blok Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.example;

    root /var/www/kh2-frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5132;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
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
