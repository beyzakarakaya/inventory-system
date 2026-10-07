const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Oturum bulunamadı, lütfen giriş yapın." });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.user = payload; // { id, username, role, full_name }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Oturum geçersiz veya süresi dolmuş." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
