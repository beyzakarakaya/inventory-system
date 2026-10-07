const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { DISTRICTS } = require("../database");

// İlçe merkezine yakın, haritada üst üste binmesin diye küçük rastgele sapma
function jitterCoord(base) {
  const delta = () => (Math.random() - 0.5) * 0.02; // ~1km civarı sapma
  return { lat: base.lat + delta(), lng: base.lng + delta() };
}

module.exports = function deviceRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  // Cihaz listesi: arama + kategori/durum/ilçe filtreleme + sayfalama
  router.get("/", async (req, res) => {
    const {
      search = "",
      category = "",
      status = "",
      district = "",
      page = 1,
      pageSize = 10,
    } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("(name LIKE ? OR assetNo LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (district) {
      conditions.push("district = ?");
      params.push(district);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    try {
      const total = await db.get(
        `SELECT COUNT(*) as count FROM devices ${whereClause}`,
        params
      );
      const offset = (Number(page) - 1) * Number(pageSize);
      const devices = await db.all(
        `SELECT * FROM devices ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [...params, Number(pageSize), offset]
      );
      res.json({
        data: devices,
        total: total.count,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total.count / Number(pageSize)),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Cihazlar getirilirken hata oluştu." });
    }
  });

  // Harita için tüm cihazlar (sayfalamasız, konum bilgisiyle)
  router.get("/map", async (req, res) => {
    try {
      const devices = await db.all(
        "SELECT id, name, category, status, district, building, room, lat, lng FROM devices WHERE lat IS NOT NULL AND lng IS NOT NULL"
      );
      res.json(devices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Harita verisi alınamadı." });
    }
  });

  // İlçe listesi (dropdown için)
  router.get("/districts", (req, res) => {
    res.json(Object.keys(DISTRICTS));
  });

  // Tek cihaz detayı (arıza + bakım geçmişiyle birlikte)
  router.get("/:id", async (req, res) => {
    try {
      const device = await db.get("SELECT * FROM devices WHERE id = ?", [req.params.id]);
      if (!device) return res.status(404).json({ message: "Cihaz bulunamadı." });

      const faults = await db.all(
        "SELECT * FROM faults WHERE device_id = ? ORDER BY created_at DESC",
        [req.params.id]
      );
      const maintenance = await db.all(
        "SELECT * FROM maintenance_logs WHERE device_id = ? ORDER BY date DESC",
        [req.params.id]
      );
      res.json({ ...device, faults, maintenance });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Cihaz detayı alınamadı." });
    }
  });

  // Yeni cihaz ekle
  router.post("/", async (req, res) => {
    const {
      assetNo, name, category, status, district, building, room,
      purchase_date, warranty_end, notes,
    } = req.body;

    if (!name || !category || !district) {
      return res.status(400).json({ message: "Cihaz adı, kategori ve ilçe zorunludur." });
    }

    const base = DISTRICTS[district];
    const coord = base ? jitterCoord(base) : { lat: null, lng: null };

    try {
      const result = await db.run(
        `INSERT INTO devices
          (assetNo, name, category, status, district, building, room, lat, lng, purchase_date, warranty_end, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          assetNo || null, name, category, status || "Aktif", district,
          building || null, room || null, coord.lat, coord.lng,
          purchase_date || null, warranty_end || null, notes || null,
        ]
      );
      res.status(201).json({ message: "Cihaz eklendi.", id: result.lastID });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Cihaz eklenemedi (demirbaş no tekil olmalı)." });
    }
  });

  // Cihaz güncelle
  router.put("/:id", async (req, res) => {
    const {
      assetNo, name, category, status, district, building, room,
      purchase_date, warranty_end, notes,
    } = req.body;

    const base = DISTRICTS[district];
    const coord = base ? jitterCoord(base) : { lat: null, lng: null };

    try {
      await db.run(
        `UPDATE devices SET
          assetNo = ?, name = ?, category = ?, status = ?, district = ?,
          building = ?, room = ?, lat = COALESCE(?, lat), lng = COALESCE(?, lng),
          purchase_date = ?, warranty_end = ?, notes = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [
          assetNo || null, name, category, status, district, building || null,
          room || null, coord.lat, coord.lng, purchase_date || null,
          warranty_end || null, notes || null, req.params.id,
        ]
      );
      res.json({ message: "Cihaz güncellendi." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Cihaz güncellenemedi." });
    }
  });

  // Cihaz sil
  router.delete("/:id", async (req, res) => {
    try {
      await db.run("DELETE FROM devices WHERE id = ?", [req.params.id]);
      res.json({ message: "Cihaz silindi." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Cihaz silinemedi." });
    }
  });

  // CSV olarak dışa aktar
  router.get("/export/csv", async (req, res) => {
    try {
      const devices = await db.all("SELECT * FROM devices ORDER BY id");
      const header = "id,assetNo,name,category,status,district,building,room,purchase_date,warranty_end\n";
      const rows = devices
        .map((d) =>
          [d.id, d.assetNo, d.name, d.category, d.status, d.district, d.building, d.room, d.purchase_date, d.warranty_end]
            .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=cihaz-envanteri.csv");
      res.send(header + rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Dışa aktarma başarısız." });
    }
  });

  return router;
};
