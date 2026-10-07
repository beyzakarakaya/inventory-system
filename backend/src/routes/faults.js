const express = require("express");
const { requireAuth } = require("../middleware/auth");

module.exports = function faultRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  // Arıza listesi (cihaz adıyla birlikte), durum/öncelik filtreleme
  router.get("/", async (req, res) => {
    const { status = "", priority = "", device_id = "" } = req.query;
    const conditions = [];
    const params = [];

    if (status) { conditions.push("f.status = ?"); params.push(status); }
    if (priority) { conditions.push("f.priority = ?"); params.push(priority); }
    if (device_id) { conditions.push("f.device_id = ?"); params.push(device_id); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    try {
      const faults = await db.all(
        `SELECT f.*, d.name as device_name, d.category as device_category, d.district
         FROM faults f
         JOIN devices d ON d.id = f.device_id
         ${whereClause}
         ORDER BY
           CASE f.priority WHEN 'Kritik' THEN 0 WHEN 'Yuksek' THEN 1 WHEN 'Orta' THEN 2 ELSE 3 END,
           f.created_at DESC`,
        params
      );
      res.json(faults);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Arızalar getirilemedi." });
    }
  });

  // Yeni arıza kaydı oluştur
  router.post("/", async (req, res) => {
    const { device_id, title, description, priority, reported_by } = req.body;
    if (!device_id || !title) {
      return res.status(400).json({ message: "Cihaz ve arıza başlığı zorunludur." });
    }
    try {
      const result = await db.run(
        `INSERT INTO faults (device_id, title, description, priority, reported_by, status)
         VALUES (?, ?, ?, ?, ?, 'Acik')`,
        [device_id, title, description || null, priority || "Orta", reported_by || req.user.full_name]
      );
      // Kritik/yüksek öncelikli arızalarda cihaz durumu otomatik "Arizali" yapılır
      if (priority === "Kritik" || priority === "Yuksek") {
        await db.run("UPDATE devices SET status = 'Arizali' WHERE id = ?", [device_id]);
      }
      res.status(201).json({ message: "Arıza kaydı oluşturuldu.", id: result.lastID });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Arıza kaydı oluşturulamadı." });
    }
  });

  // Arıza durumunu güncelle (İşlemde / Çözüldü / İptal)
  router.put("/:id", async (req, res) => {
    const { status, assigned_to, resolution_note, priority } = req.body;
    try {
      const fault = await db.get("SELECT * FROM faults WHERE id = ?", [req.params.id]);
      if (!fault) return res.status(404).json({ message: "Arıza bulunamadı." });

      const resolvedAt = status === "Cozuldu" ? new Date().toISOString() : fault.resolved_at;

      await db.run(
        `UPDATE faults SET status = ?, assigned_to = ?, resolution_note = ?, priority = ?, resolved_at = ?
         WHERE id = ?`,
        [
          status || fault.status,
          assigned_to ?? fault.assigned_to,
          resolution_note ?? fault.resolution_note,
          priority || fault.priority,
          resolvedAt,
          req.params.id,
        ]
      );

      // Arıza çözüldüğünde otomatik olarak bakım geçmişine kayıt düşülür
      // ve cihaz durumu tekrar "Aktif" yapılır.
      if (status === "Cozuldu") {
        await db.run(
          `INSERT INTO maintenance_logs (device_id, fault_id, type, description, technician)
           VALUES (?, ?, 'Ariza Onarimi', ?, ?)`,
          [fault.device_id, fault.id, resolution_note || fault.title, assigned_to || req.user.full_name]
        );
        await db.run("UPDATE devices SET status = 'Aktif' WHERE id = ?", [fault.device_id]);
      }

      res.json({ message: "Arıza güncellendi." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Arıza güncellenemedi." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await db.run("DELETE FROM faults WHERE id = ?", [req.params.id]);
      res.json({ message: "Arıza kaydı silindi." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Arıza silinemedi." });
    }
  });

  return router;
};
