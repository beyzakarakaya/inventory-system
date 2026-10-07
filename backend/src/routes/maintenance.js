const express = require("express");
const { requireAuth } = require("../middleware/auth");

module.exports = function maintenanceRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  // Tüm bakım kayıtları (cihaz adıyla birlikte) - en yeni bakımlar önce
  router.get("/", async (req, res) => {
    const { device_id = "" } = req.query;
    const conditions = [];
    const params = [];
    if (device_id) { conditions.push("m.device_id = ?"); params.push(device_id); }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    try {
      const logs = await db.all(
        `SELECT m.*, d.name as device_name
         FROM maintenance_logs m
         JOIN devices d ON d.id = m.device_id
         ${whereClause}
         ORDER BY m.date DESC`,
        params
      );
      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Bakım geçmişi alınamadı." });
    }
  });

  // Manuel bakım kaydı ekle (örn. periyodik bakım, parça değişimi)
  router.post("/", async (req, res) => {
    const { device_id, type, description, technician } = req.body;
    if (!device_id || !type || !description) {
      return res.status(400).json({ message: "Cihaz, bakım türü ve açıklama zorunludur." });
    }
    try {
      const result = await db.run(
        `INSERT INTO maintenance_logs (device_id, type, description, technician)
         VALUES (?, ?, ?, ?)`,
        [device_id, type, description, technician || req.user.full_name]
      );
      res.status(201).json({ message: "Bakım kaydı eklendi.", id: result.lastID });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Bakım kaydı eklenemedi." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await db.run("DELETE FROM maintenance_logs WHERE id = ?", [req.params.id]);
      res.json({ message: "Bakım kaydı silindi." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Bakım kaydı silinemedi." });
    }
  });

  return router;
};
