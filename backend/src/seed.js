require("dotenv").config();
const bcrypt = require("bcryptjs");
const { createDB, DISTRICTS } = require("./database");

function jitterCoord(base) {
  const delta = () => (Math.random() - 0.5) * 0.02;
  return { lat: base.lat + delta(), lng: base.lng + delta() };
}

const sampleDevices = [
  { name: "Sunucu Odası Ana Switch", category: "Ag Cihazi", district: "İzmit", building: "Merkez Bina", room: "Sunucu Odası" },
  { name: "İzmit Şube Yazıcısı", category: "Yazici", district: "İzmit", building: "Hizmet Binası", room: "Kat 2" },
  { name: "Gebze Kamera-14", category: "Kamera", district: "Gebze", building: "Meydan", room: "Dış Mekan" },
  { name: "Gölcük Bilgi İşlem PC-03", category: "Bilgisayar", district: "Gölcük", building: "İlçe Binası", room: "Oda 5" },
  { name: "Darıca Yedek Sunucu", category: "Sunucu", district: "Darıca", building: "Veri Merkezi", room: "Rack-2" },
  { name: "Kartepe Santral Cihazı", category: "Telefon Santrali", district: "Kartepe", building: "İlçe Binası", room: "Santral Odası" },
  { name: "Körfez Ağ Anahtarı", category: "Ag Cihazi", district: "Körfez", building: "Hizmet Binası", room: "Kat 1" },
  { name: "Derince Muhasebe PC-11", category: "Bilgisayar", district: "Derince", building: "İlçe Binası", room: "Muhasebe" },
];

async function seed() {
  const db = await createDB();

  const adminHash = await bcrypt.hash("admin123", 10);
  const teknisyenHash = await bcrypt.hash("teknisyen123", 10);

  await db.run(
    `INSERT OR IGNORE INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)`,
    ["admin", adminHash, "Sistem Yöneticisi", "Yonetici"]
  );
  await db.run(
    `INSERT OR IGNORE INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)`,
    ["teknisyen", teknisyenHash, "Saha Teknisyeni", "Teknisyen"]
  );

  for (const d of sampleDevices) {
    const base = DISTRICTS[d.district];
    const coord = jitterCoord(base);
    await db.run(
      `INSERT INTO devices (assetNo, name, category, status, district, building, room, lat, lng)
       VALUES (?, ?, ?, 'Aktif', ?, ?, ?, ?, ?)`,
      [
        `KOC-${Math.floor(1000 + Math.random() * 9000)}`,
        d.name, d.category, d.district, d.building, d.room, coord.lat, coord.lng,
      ]
    );
  }

  const firstDevice = await db.get("SELECT id FROM devices LIMIT 1");
  if (firstDevice) {
    await db.run(
      `INSERT INTO faults (device_id, title, description, priority, status, reported_by)
       VALUES (?, 'Cihaz yeniden başlatma sorunu', 'Cihaz belirli aralıklarla kendiliğinden yeniden başlıyor.', 'Yuksek', 'Acik', 'Saha Teknisyeni')`,
      [firstDevice.id]
    );
    await db.run(
      `INSERT INTO maintenance_logs (device_id, type, description, technician)
       VALUES (?, 'Periyodik Bakim', 'Yıllık genel bakım ve toz temizliği yapıldı.', 'Saha Teknisyeni')`,
      [firstDevice.id]
    );
  }

  console.log("Demo veriler eklendi. Giriş bilgileri:");
  console.log("  Yönetici -> kullanıcı adı: admin      şifre: admin123");
  console.log("  Teknisyen -> kullanıcı adı: teknisyen  şifre: teknisyen123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
