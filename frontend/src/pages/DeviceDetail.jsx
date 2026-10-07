import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaQrcode } from "react-icons/fa";
import api from "../api/axios";
import QRModal from "../components/QRModal";

const STATUS_LABELS = { Aktif: "Aktif", Pasif: "Pasif", Bakimda: "Bakımda", Arizali: "Arızalı" };
const PRIORITY_LABELS = { Dusuk: "Düşük", Orta: "Orta", Yuksek: "Yüksek", Kritik: "Kritik" };
const FAULT_STATUS_LABELS = { Acik: "Açık", Islemde: "İşlemde", Cozuldu: "Çözüldü", Iptal: "İptal" };

export default function DeviceDetail() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [maintForm, setMaintForm] = useState({ type: "Periyodik Bakim", description: "", technician: "" });

  const fetchDevice = async () => {
    const res = await api.get(`/devices/${id}`);
    setDevice(res.data);
  };

  useEffect(() => { fetchDevice(); }, [id]);

  const addMaintenance = async (e) => {
    e.preventDefault();
    await api.post("/maintenance", { device_id: id, ...maintForm });
    setMaintForm({ type: "Periyodik Bakim", description: "", technician: "" });
    fetchDevice();
  };

  if (!device) return <p className="text-gray-400">Yükleniyor...</p>;

  return (
    <div>
      <Link to="/cihazlar" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm">
        <FaArrowLeft /> Cihaz listesine dön
      </Link>

      <div className="card mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{device.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {device.assetNo} · {device.category} · {device.district}
            {device.building ? ` / ${device.building}` : ""}
            {device.room ? ` / ${device.room}` : ""}
          </p>
          <span className="badge bg-cyan-500/20 text-cyan-400 mt-2 inline-block">
            {STATUS_LABELS[device.status]}
          </span>
        </div>
        <button onClick={() => setShowQr(true)} className="btn-secondary flex items-center gap-2">
          <FaQrcode /> QR Kod Göster
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Arıza Geçmişi ({device.faults.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {device.faults.length === 0 && <p className="text-sm text-gray-500">Kayıtlı arıza yok.</p>}
            {device.faults.map((f) => (
              <div key={f.id} className="border border-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">{f.title}</span>
                  <span className="badge bg-gray-700 text-gray-300 text-xs">{FAULT_STATUS_LABELS[f.status]}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Öncelik: {PRIORITY_LABELS[f.priority]} · {new Date(f.created_at).toLocaleDateString("tr-TR")}
                </p>
                {f.description && <p className="text-sm text-gray-400 mt-1">{f.description}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Bakım Geçmişi ({device.maintenance.length})</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
            {device.maintenance.length === 0 && <p className="text-sm text-gray-500">Kayıtlı bakım yok.</p>}
            {device.maintenance.map((m) => (
              <div key={m.id} className="border-l-2 border-cyan-500 pl-3">
                <p className="text-sm font-semibold">{m.type}</p>
                <p className="text-xs text-gray-500">
                  {new Date(m.date).toLocaleDateString("tr-TR")} · {m.technician}
                </p>
                <p className="text-sm text-gray-400">{m.description}</p>
              </div>
            ))}
          </div>

          <form onSubmit={addMaintenance} className="border-t border-gray-800 pt-4 space-y-3">
            <p className="text-sm font-semibold text-gray-400">Yeni Bakım Kaydı Ekle</p>
            <select className="input" value={maintForm.type} onChange={(e) => setMaintForm({ ...maintForm, type: e.target.value })}>
              <option value="Periyodik Bakim">Periyodik Bakım</option>
              <option value="Ariza Onarimi">Arıza Onarımı</option>
              <option value="Parca Degisimi">Parça Değişimi</option>
              <option value="Yazilim Guncelleme">Yazılım Güncelleme</option>
              <option value="Diger">Diğer</option>
            </select>
            <textarea
              className="input" placeholder="Açıklama" rows={2} required
              value={maintForm.description}
              onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
            />
            <input
              className="input" placeholder="Teknisyen adı (boş bırakılırsa siz olursunuz)"
              value={maintForm.technician}
              onChange={(e) => setMaintForm({ ...maintForm, technician: e.target.value })}
            />
            <button type="submit" className="btn-primary w-full">Bakım Kaydı Ekle</button>
          </form>
        </div>
      </div>

      {showQr && <QRModal device={device} onClose={() => setShowQr(false)} />}
    </div>
  );
}
