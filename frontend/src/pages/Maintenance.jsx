import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const TYPE_LABELS = {
  "Periyodik Bakim": "Periyodik Bakım",
  "Ariza Onarimi": "Arıza Onarımı",
  "Parca Degisimi": "Parça Değişimi",
  "Yazilim Guncelleme": "Yazılım Güncelleme",
  "Diger": "Diğer",
};

export default function Maintenance() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/maintenance").then((res) => setLogs(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bakım Geçmişi (Tüm Kayıtlar)</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3">Tarih</th>
              <th className="pb-3">Cihaz</th>
              <th className="pb-3">Tür</th>
              <th className="pb-3">Açıklama</th>
              <th className="pb-3">Teknisyen</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((m) => (
              <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                <td className="py-3 text-gray-400">{new Date(m.date).toLocaleDateString("tr-TR")}</td>
                <td>
                  <Link to={`/cihazlar/${m.device_id}`} className="text-cyan-400 hover:underline">
                    {m.device_name}
                  </Link>
                </td>
                <td>{TYPE_LABELS[m.type] || m.type}</td>
                <td className="text-gray-400">{m.description}</td>
                <td>{m.technician}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
