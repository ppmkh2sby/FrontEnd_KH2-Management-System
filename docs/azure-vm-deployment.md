# Deploy stack KH2 ke satu Azure VM

Satu Docker Compose menjalankan tiga container pada jaringan internal: frontend
Nginx, backend ASP.NET Core, dan PostgreSQL. Hanya frontend yang membuka port
`80` ke VM. Browser mengakses frontend dan Nginx meneruskan `/api/` ke backend,
sehingga tidak membutuhkan CORS.

## 1. Siapkan VM Ubuntu

Di Azure Network Security Group (NSG), izinkan inbound TCP `80`. Tambahkan TCP
`443` saat HTTPS sudah dikonfigurasi. Jangan membuat NSG rule publik untuk
port `5432` (PostgreSQL) atau `8080` (backend).

Instal Docker Engine dan plugin Compose dari repository resmi Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo docker run hello-world
```

Gunakan `sudo docker compose` dalam semua perintah berikut bila user SSH Anda
belum memiliki akses ke Docker group.

## 2. Clone kedua repository

Kedua folder harus berada pada parent directory yang sama karena Compose
membangun backend dari folder sibling.

```bash
cd ~
git clone https://github.com/ppmkh2sby/FrontEnd_KH2-Management-System.git
git clone https://github.com/ppmkh2sby/Backend_KH2-Management-System.git
cd ~/FrontEnd_KH2-Management-System
cp .env.azure.example .env.azure
nano .env.azure
```

Isi semua placeholder di `.env.azure`. Buat password PostgreSQL dan JWT secret
dengan perintah berikut, lalu salin hasil masing-masing ke file tersebut:

```bash
openssl rand -base64 32
openssl rand -base64 48
```

`APP_ORIGIN` adalah URL yang dibuka pengguna, sedangkan `APP_HOST` adalah
hostname atau public IP tanpa `http://`/`https://`. Untuk uji awal menggunakan
HTTP, gunakan `HTTPS_ENABLED=false`. Setelah HTTPS tersedia, ubah `APP_ORIGIN`
menjadi `https://...` dan set `HTTPS_ENABLED=true`.

`FACE_SERVICE_API_KEY` wajib memakai secret berbeda dari `JWT_SECRET_KEY`.
Karena source Face Recognition belum memiliki remote Git, salin folder
`Face_Recognition_KH2` ke home directory VM sehingga posisinya menjadi sibling
repository frontend dan backend. Dari PowerShell komputer development:

```powershell
scp -r "D:\project\KH2-System-Monitoring\Face_Recognition_KH2" maestroadmin@PUBLIC_IP_VM:~/
```

## 3. Jalankan stack

```bash
sudo docker compose --env-file .env.azure up --build -d
sudo docker compose --env-file .env.azure ps
curl -I http://127.0.0.1/
```

Build pertama membutuhkan waktu karena image Python, .NET, Node, dan PostgreSQL perlu
diunduh. Backend otomatis menjalankan migration pada database baru. Database
mulai kosong dan seeding account/sample data sengaja tidak diaktifkan; impor
data produksi atau buat akun administrator melalui prosedur administrasi yang
disetujui sebelum aplikasi digunakan pengguna.

## 4. Verifikasi dan log

```bash
sudo docker compose --env-file .env.azure logs --tail=100 database backend frontend
curl -i http://127.0.0.1/api/v1/auth/me
```

Respons `401 Unauthorized` dari endpoint autentikasi menunjukkan proxy frontend
telah mencapai backend. Respons `502 Bad Gateway` menunjukkan backend belum
siap atau berhenti; lihat log service `backend`.

Untuk deploy source code terbaru:

```bash
cd ~/FrontEnd_KH2-Management-System
git pull --ff-only
cd ~/Backend_KH2-Management-System
git pull --ff-only
cd ~/FrontEnd_KH2-Management-System
sudo docker compose --env-file .env.azure up --build -d
```

## Keamanan dan data

- `.env.azure` berisi password dan JWT secret; file ini diabaikan Git dan harus
  tetap hanya berada di VM.
- Database disimpan dalam Docker volume `postgres_data`. Jangan menjalankan
  `docker compose down -v` di production karena flag `-v` menghapus database.
- Port Face Recognition, backend, dan PostgreSQL sengaja tidak dipublikasikan.
  Akses aplikasi hanya melalui frontend pada port 80/443.
