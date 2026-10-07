const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Kocaeli'nin 12 ilçesi ve harita gösterimi için yaklaşık merkez koordinatları.
// Cihaz eklenirken ilçe seçilir; harita ekranında bu koordinatlar (küçük bir
// rastgele sapmayla) cihazın konumunu göstermek için kullanılır.
const DISTRICTS = {
  "Başiskele": { lat: 40.6883, lng: 29.9642 },
  "Çayırova": { lat: 40.8225, lng: 29.3778 },
  "Darıca": { lat: 40.7647, lng: 29.3775 },
  "Derince": { lat: 40.7597, lng: 29.8258 },
  "Dilovası": { lat: 40.7783, lng: 29.5372 },
  "Gebze": { lat: 40.8028, lng: 29.4306 },
  "Gölcük": { lat: 40.7178, lng: 29.8203 },
  "İzmit": { lat: 40.7654, lng: 29.9408 },
  "Kandıra": { lat: 41.0708, lng: 30.1517 },
  "Karamürsel": { lat: 40.6906, lng: 29.6153 },
  "Kartepe": { lat: 40.7461, lng: 30.0367 },
  "Körfez": { lat: 40.7756, lng: 29.7883 },
};

async function createDB() {
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  await db.exec("PRAGMA foreign_keys = ON;");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('Yonetici','Teknisyen')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assetNo TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('Bilgisayar','Yazici','Ag Cihazi','Sunucu','Kamera','Telefon Santrali')),
      status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif','Pasif','Bakimda','Arizali')),
      district TEXT NOT NULL,
      building TEXT,
      room TEXT,
      lat REAL,
      lng REAL,
      purchase_date TEXT,
      warranty_end TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS faults (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'Orta' CHECK (priority IN ('Dusuk','Orta','Yuksek','Kritik')),
      status TEXT NOT NULL DEFAULT 'Acik' CHECK (status IN ('Acik','Islemde','Cozuldu','Iptal')),
      reported_by TEXT,
      assigned_to TEXT,
      resolution_note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS maintenance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      fault_id INTEGER REFERENCES faults(id) ON DELETE SET NULL,
      type TEXT NOT NULL CHECK (type IN ('Periyodik Bakim','Ariza Onarimi','Parca Degisimi','Yazilim Guncelleme','Diger')),
      description TEXT NOT NULL,
      technician TEXT,
      date TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log("SQLite bağlantısı kuruldu ve tablolar hazır.");
  return db;
}

module.exports = { createDB, DISTRICTS };
