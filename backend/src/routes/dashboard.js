const express = require("express");
const { requireAuth } = require("../middleware/auth");

module.exports = function dashboardRoutes(db) {
  const router = express.Router();
  router.use(requireAuth);

  router.get("/summary", async (req, res) => {
    try {
      const totalDevices = await db.get("SELECT COUNT(*) as c FROM devices");
      const byStatus = await db.all(
        "SELECT status, COUNT(*) as c FROM devices GROUP BY status"
      );
      const byCategory = await db.all(
        "SELECT category, COUNT(*) as c FROM devices GROUP BY category"
      );
      const byDistrict = await db.all(
        "SELECT district, COUNT(*) as c FROM devices GROUP BY district ORDER BY c DESC"
      );
      const openFaults = await db.get(
        "SELECT COUNT(*) as c FROM faults WHERE status IN ('Acik','Islemde')"
      );
      const criticalFaults = await db.get(
        "SELECT COUNT(*) as c FROM faults WHERE status IN ('Acik','Islemde') AND priority IN ('Kritik','Yuksek')"
      );
      const resolvedThisMonth = await db.get(
        `SELECT COUNT(*) as c FROM faults
         WHERE status = 'Cozuldu' AND strftime('%Y-%m', resolved_at) = strftime('%Y-%m', 'now')`
      );
      // Son 6 ay için ay bazında açılan / çözülen arıza sayısı (trend grafiği)
      const faultsPerMonth = await db.all(`
        SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as opened
        FROM faults
        WHERE created_at >= datetime('now', '-6 months')
        GROUP BY month ORDER BY month
      `);
      const resolvedPerMonth = await db.all(`
        SELECT strftime('%Y-%m', resolved_at) as month, COUNT(*) as resolved
        FROM faults
        WHERE resolved_at IS NOT NULL AND resolved_at >= datetime('now', '-6 months')
        GROUP BY month ORDER BY month
      `);
      const topFaultyDevices = await db.all(`
        SELECT d.id, d.name, COUNT(f.id) as fault_count
        FROM devices d JOIN faults f ON f.device_id = d.id
        GROUP BY d.id ORDER BY fault_count DESC LIMIT 5
      `);

      res.json({
        totalDevices: totalDevices.c,
        byStatus,
        byCategory,
        byDistrict,
        openFaults: openFaults.c,
        criticalFaults: criticalFaults.c,
        resolvedThisMonth: resolvedThisMonth.c,
        faultsPerMonth,
        resolvedPerMonth,
        topFaultyDevices,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gösterge paneli verisi alınamadı." });
    }
  });

  return router;
};
