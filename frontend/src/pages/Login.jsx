import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Giriş sırasında bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-cyan-500/20 text-cyan-400 rounded-full p-4 mb-3">
            <FaBuilding size={28} />
          </div>
          <h1 className="text-xl font-bold text-center">
            Kocaeli Büyükşehir Belediyesi
          </h1>
          <p className="text-sm text-gray-400 text-center">
            Akıllı Envanter ve Arıza Takip Sistemi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Kullanıcı Adı
            </label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Şifre</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center leading-relaxed">
          Demo giriş: <b>admin / admin123</b> (Yönetici)
          <br />
          veya <b>teknisyen / teknisyen123</b> (Teknisyen)
        </p>
      </div>
    </div>
  );
}
