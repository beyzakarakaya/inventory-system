const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { requireAuth, requireRole } = require("../middleware/auth");

module.exports = function authRoutes(db) {
  const router = express.Router();

  // Giriş yap
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Kullanıcı adı ve şifre zorunludur." });
    }
    try {
      const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
      if (!user) {
        return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
      }
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
      }
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", {
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      });
      res.json({ token, user: payload });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Giriş sırasında bir hata oluştu." });
    }
  });

  // Şu anki kullanıcı bilgisi
  router.get("/me", requireAuth, (req, res) => {
    res.json(req.user);
  });

  // Yeni kullanıcı oluştur (yalnızca Yönetici)
  router.post("/register", requireAuth, requireRole("Yonetici"), async (req, res) => {
    const { username, password, full_name, role } = req.body;
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ message: "Tüm alanlar zorunludur." });
    }
    try {
      const hash = await bcrypt.hash(password, 10);
      await db.run(
        `INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)`,
        [username, hash, full_name, role]
      );
      res.status(201).json({ message: "Kullanıcı oluşturuldu." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Kullanıcı oluşturulamadı (kullanıcı adı alınmış olabilir)." });
    }
  });

  // Kullanıcı listesi (yalnızca Yönetici)
  router.get("/users", requireAuth, requireRole("Yonetici"), async (req, res) => {
    const users = await db.all(
      "SELECT id, username, full_name, role, created_at FROM users ORDER BY id"
    );
    res.json(users);
  });

  return router;
};
