# Deploy frontend ke Azure VM

Frontend ini dibuild sebagai static site. Container Nginx melayani aplikasi dan
meneruskan semua request `/api/` ke backend, sehingga browser cukup mengakses
satu domain dan tidak membutuhkan konfigurasi CORS.

## 1. Persiapan VM Ubuntu

Di Azure Network Security Group (NSG), izinkan inbound TCP `80` dari Internet.
Untuk HTTPS, tambahkan juga TCP `443`. Jangan membuka port backend ke Internet
jika frontend dapat menjangkaunya lewat private network.

Masuk ke VM Ubuntu dan instal Docker Engine beserta plugin Compose. Perintah
berikut menggunakan repository resmi Docker:

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

Gunakan `sudo docker compose ...` pada seluruh perintah berikut jika user SSH
Anda belum diberi akses ke Docker group.

## 2. Salin dan konfigurasi project

```bash
git clone <URL_REPOSITORY> kh2-frontend
https://github.com/ppmkh2sby/FrontEnd_KH2-Management-System.git
cd kh2-frontend
cp .env.azure.example .env.azure
nano .env.azure
```

Set `BACKEND_UPSTREAM` ke alamat backend **yang dapat dijangkau dari container
frontend**, misalnya:

```dotenv
# Backend dalam Compose/network Docker yang sama
BACKEND_UPSTREAM=http://backend:8080

# atau backend pada private IP VM lain di Azure
# BACKEND_UPSTREAM=http://10.0.0.4:8080
```

Nilai tidak boleh memiliki trailing slash. Jika backend berjalan langsung di VM
yang sama (bukan di container), gunakan alamat bridge Docker yang benar untuk
host Anda atau private IP VM, bukan `localhost`: `localhost` dari dalam
container mengacu pada container frontend itu sendiri.

## 3. Jalankan

```bash
docker compose up --build -d
docker compose ps
curl -I http://127.0.0.1/
```

Frontend tersedia pada `http://PUBLIC_IP_VM/`. Periksa log jika container tidak
berjalan:

```bash
docker compose logs --tail=100 frontend
```

Setelah mengubah source code, deploy ulang dengan:

```bash
git pull
docker compose up --build -d
```

## 4. Verifikasi API

Di browser, buka aplikasi dan lakukan login. Dari VM Anda juga dapat memastikan
Nginx dapat mencapai backend:

```bash
curl -i http://127.0.0.1/api/v1/auth/me
```

Status `401` atau `405` dari endpoint yang memerlukan autentikasi menunjukkan
proxy sudah mencapai backend; `502 Bad Gateway` berarti nilai
`BACKEND_UPSTREAM`, port backend, atau jaringan internal perlu diperbaiki.

## 5. HTTPS dan domain

Untuk production, arahkan DNS A record domain ke public IP VM dan terminasi TLS
di depan container, misalnya Azure Application Gateway, Azure Front Door, atau
reverse proxy host dengan sertifikat Let's Encrypt. Pastikan proxy tersebut
meneruskan header `X-Forwarded-Proto: https`; Nginx di container akan
meneruskannya ke backend.

Jika TLS diterminasi oleh layanan Azure, atur listener publik ke HTTPS (443)
dan teruskan trafik ke frontend pada port 80 di VM. NSG sebaiknya membatasi port
80 agar hanya dapat diakses dari layanan/proxy tersebut bila arsitektur Anda
memungkinkan.

## Catatan keamanan

- Simpan `.env.azure` hanya di VM; file ini tidak masuk Git.
- Jangan menaruh password, token, atau URL backend privat di `VITE_*`: nilai
  Vite dibundel ke JavaScript dan bisa dilihat pengguna.
- Gunakan private IP/VNet untuk koneksi frontend ke backend bila backend berada
  di Azure.
