require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createDB } = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

async function startServer() {
  const db = await createDB();

  app.get("/", (req, res) => {
    res.send("Kocaeli Büyükşehir Belediyesi - Envanter ve Arıza Takip API çalışıyor 🚀");
  });

  app.use("/auth", require("./routes/auth")(db));
  app.use("/devices", require("./routes/devices")(db));
  app.use("/faults", require("./routes/faults")(db));
  app.use("/maintenance", require("./routes/maintenance")(db));
  app.use("/dashboard", require("./routes/dashboard")(db));

  // Genel hata yakalayıcı (beklenmeyen hatalar için)
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Sunucuda beklenmeyen bir hata oluştu." });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor 🚀`);
  });
}

startServer();
