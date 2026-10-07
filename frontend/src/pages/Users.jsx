import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import api from "../api/axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", full_name: "", role: "Teknisyen" });
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const res = await api.get("/auth/users");
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      setForm({ username: "", password: "", full_name: "", role: "Teknisyen" });
      setFormOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Kullanıcı oluşturulamadı.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kullanıcılar</h1>
        <button onClick={() => setFormOpen(!formOpen)} className="btn-primary flex items-center gap-2">
          <FaPlus /> Yeni Kullanıcı
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-3 max-w-md">
          <input className="input" placeholder="Kullanıcı Adı" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input className="input" placeholder="Ad Soyad" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <input className="input" type="password" placeholder="Şifre" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="Teknisyen">Teknisyen</option>
            <option value="Yonetici">Yönetici</option>
          </select>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary">Oluştur</button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3">Kullanıcı Adı</th>
              <th className="pb-3">Ad Soyad</th>
              <th className="pb-3">Rol</th>
              <th className="pb-3">Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-800">
                <td className="py-3">{u.username}</td>
                <td>{u.full_name}</td>
                <td>
                  <span className="badge bg-cyan-500/20 text-cyan-400">
                    {u.role === "Yonetici" ? "Yönetici" : "Teknisyen"}
                  </span>
                </td>
                <td className="text-gray-500">{new Date(u.created_at).toLocaleDateString("tr-TR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
