# Akıllı Envanter ve Arıza Takip Sistemi

Kocaeli Büyükşehir Belediyesi Bilgi İşlem Dairesi Başkanlığı Altyapı ve
Haberleşme Şube Müdürlüğü için geliştirilmiş, cihaz envanteri, arıza takibi,
bakım geçmişi ve harita üzerinde konum görünümü sağlayan uçtan uca web
uygulaması.

## Özellikler

1. **Cihaz Envanter Yönetimi** — cihaz ekleme/düzenleme/silme, demirbaş no,
   kategori (Bilgisayar, Yazıcı, Ağ Cihazı, Sunucu, Kamera, Santral), durum,
   ilçe/bina/oda bazlı konum
2. **QR Kod Üretimi** — her cihaz için anlık, demirbaş bilgilerini içeren QR kod
3. **Arıza Takip Sistemi** — arıza bildirme, önceliklendirme (Düşük/Orta/
   Yüksek/Kritik), durum akışı (Açık → İşlemde → Çözüldü), çözüm notu
4. **Bakım Geçmişi** — her cihaz için otomatik (arıza çözüldüğünde) ve manuel
   bakım kayıtları
5. **Harita Görünümü** — Kocaeli'nin 12 ilçesindeki cihazların Leaflet/
   OpenStreetMap üzerinde durum renkleriyle gösterimi
6. **Gösterge Paneli** — özet kartlar, durum/kategori grafikleri, 6 aylık
   arıza trendi, en çok arıza alan cihazlar listesi
7. **Kullanıcı Girişi ve Rol Yönetimi** — JWT tabanlı giriş, Yönetici /
   Teknisyen rolleri, kullanıcı yönetimi (yalnızca Yönetici)
8. **Arama, Filtreleme, Sayfalama** — cihaz ve arıza listelerinde
9. **CSV Dışa Aktarma** — cihaz envanterini indirme
10. **Duyarlı (responsive) ve karanlık temalı arayüz**

## Mimari

```
İstemci (React + Vite + Tailwind)  <──HTTP/JSON──>  Sunucu (Node.js + Express)  <──>  SQLite
```

- **Backend:** Node.js, Express.js, SQLite (sqlite/sqlite3), JWT (jsonwebtoken),
  bcryptjs
- **Frontend:** React, React Router, Axios, Tailwind CSS, Chart.js
  (react-chartjs-2), Leaflet (react-leaflet), qrcode, react-icons
- **Veritabanı:** 4 tablo — `users`, `devices`, `faults`, `maintenance_logs`

## Kurulum ve Çalıştırma

> Not: Bu proje **internet bağlantısı olan** bir bilgisayarda çalıştırılmalıdır
> (npm paketlerinin indirilmesi gerekir). Node.js 18 veya üzeri kurulu olmalıdır.

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed     # demo kullanıcı ve örnek cihaz/arıza verisi oluşturur
npm run dev       # http://localhost:5000
```

Demo giriş bilgileri (seed sonrası):
- Yönetici → kullanıcı adı: `admin`, şifre: `admin123`
- Teknisyen → kullanıcı adı: `teknisyen`, şifre: `teknisyen123`

### 2) Frontend

Yeni bir terminalde:

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Tarayıcıda `http://localhost:5173` adresini açıp demo kullanıcı ile giriş
yapabilirsiniz.

## Klasör Yapısı

```
kocaeli-envanter-sistemi/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express giriş noktası
│   │   ├── database.js       # SQLite bağlantısı ve tablo şeması
│   │   ├── seed.js           # Demo veri oluşturma scripti
│   │   ├── middleware/auth.js
│   │   └── routes/           # auth, devices, faults, maintenance, dashboard
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/             # Login, Dashboard, Devices, DeviceDetail,
    │   │                       # Faults, Maintenance, MapView, Users
    │   ├── components/        # Layout, Sidebar, QRModal, StatCard, ...
    │   ├── context/AuthContext.jsx
    │   └── api/axios.js
    └── package.json
```

## API Uç Noktaları (Özet)

| Yöntem | Yol | Açıklama |
|---|---|---|
| POST | /auth/login | Giriş yap, JWT al |
| GET | /devices | Cihaz listesi (arama/filtre/sayfalama) |
| GET | /devices/:id | Cihaz detayı + arıza + bakım geçmişi |
| POST/PUT/DELETE | /devices/:id | Cihaz ekle/güncelle/sil |
| GET | /devices/map | Harita için konum verisi |
| GET | /devices/export/csv | CSV dışa aktarma |
| GET/POST | /faults | Arıza listesi / yeni arıza |
| PUT | /faults/:id | Arıza durumu güncelle |
| GET/POST | /maintenance | Bakım geçmişi listesi / yeni kayıt |
| GET | /dashboard/summary | Gösterge paneli istatistikleri |

Tüm uç noktalar (login hariç) `Authorization: Bearer <token>` başlığı ister.

## Rapor İçin Not

Bu proje, staj raporunuzdaki "Bölüm 4 – Proje ve Yapılan İş" kısmını
genişletmek üzere tasarlanmıştır. Rapor yazarken her özelliği (4.1 Kullanılan
Teknolojiler, 4.2 Sistem Mimarisi, 4.3 Veritabanı Tasarımı, 4.4 Backend, 4.5
Frontend, 4.6 Arıza Takip Modülü, 4.7 Bakım Geçmişi Modülü, 4.8 Harita Modülü,
4.9 Kullanıcı Girişi ve Yetkilendirme, 4.10 Test Süreci gibi) ayrı bir alt
başlık altında anlatmanız sayfa sayısına doğal olarak katkı sağlar.
