import { useEffect, useState } from "react";
import { FaPlus, FaCheckCircle } from "react-icons/fa";
import api from "../api/axios";

const PRIORITY_LABELS = { Dusuk: "Düşük", Orta: "Orta", Yuksek: "Yüksek", Kritik: "Kritik" };
const STATUS_LABELS = { Acik: "Açık", Islemde: "İşlemde", Cozuldu: "Çözüldü", Iptal: "İptal" };
const PRIORITY_CLASSES = {
  Dusuk: "bg-gray-500/20 text-gray-400",
  Orta: "bg-blue-500/20 text-blue-400",
  Yuksek: "bg-orange-500/20 text-orange-400",
  Kritik: "bg-red-500/20 text-red-400",
};
const STATUS_CLASSES = {
  Acik: "bg-red-500/20 text-red-400",
  Islemde: "bg-yellow-500/20 text-yellow-400",
  Cozuldu: "bg-green-500/20 text-green-400",
  Iptal: "bg-gray-500/20 text-gray-400",
};

export default function Faults() {
  const [faults, setFaults] = useState([]);
  const [devices, setDevices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ device_id: "", title: "", description: "", priority: "Orta" });

  const fetchFaults = async () => {
    const res = await api.get("/faults", { params: { status: statusFilter } });
    setFaults(res.data);
  };

  useEffect(() => {
    api.get("/devices", { params: { pageSize: 500 } }).then((res) => setDevices(res.data.data));
  }, []);

  useEffect(() => { fetchFaults(); /* eslint-disable-next-line */ }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.device_id) return alert("Lütfen cihaz seçiniz.");
    await api.post("/faults", form);
    setForm({ device_id: "", title: "", description: "", priority: "Orta" });
    setFormOpen(false);
    fetchFaults();
  };

  const updateStatus = async (fault, status) => {
    const resolution_note = status === "Cozuldu" ? prompt("Çözüm notu (opsiyonel):", "") : fault.resolution_note;
    await api.put(`/faults/${fault.id}`, { status, resolution_note, assigned_to: fault.assigned_to, priority: fault.priority });
    fetchFaults();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Arıza Takip</h1>
        <button onClick={() => setFormOpen(!formOpen)} className="btn-primary flex items-center gap-2">
          <FaPlus /> Yeni Arıza Bildir
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {["", "Acik", "Islemde", "Cozuldu", "Iptal"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm ${statusFilter === s ? "bg-cyan-500 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            {s === "" ? "Tümü" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-3">
          <select className="input" value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })} required>
            <option value="">Cihaz Seçiniz</option>
            {devices.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.assetNo})</option>)}
          </select>
          <input className="input" placeholder="Arıza Başlığı" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input" placeholder="Açıklama" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button type="submit" className="btn-primary">Arızayı Kaydet</button>
        </form>
      )}

      <div className="space-y-3">
        {faults.map((f) => (
          <div key={f.id} className="card">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="text-sm text-gray-400">
                  {f.device_name} · {f.district} · {new Date(f.created_at).toLocaleString("tr-TR")}
                </p>
                {f.description && <p className="text-sm text-gray-400 mt-1">{f.description}</p>}
                {f.resolution_note && (
                  <p className="text-sm text-green-400 mt-1">Çözüm: {f.resolution_note}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${PRIORITY_CLASSES[f.priority]}`}>{PRIORITY_LABELS[f.priority]}</span>
                <span className={`badge ${STATUS_CLASSES[f.status]}`}>{STATUS_LABELS[f.status]}</span>
              </div>
            </div>
            {f.status !== "Cozuldu" && f.status !== "Iptal" && (
              <div className="flex gap-2 mt-3 border-t border-gray-800 pt-3">
                {f.status === "Acik" && (
                  <button onClick={() => updateStatus(f, "Islemde")} className="btn-secondary text-sm">İşleme Al</button>
                )}
                <button onClick={() => updateStatus(f, "Cozuldu")} className="btn-primary text-sm flex items-center gap-1">
                  <FaCheckCircle /> Çözüldü Olarak İşaretle
                </button>
                <button onClick={() => updateStatus(f, "Iptal")} className="btn-danger text-sm">İptal Et</button>
              </div>
            )}
          </div>
        ))}
        {faults.length === 0 && <p className="text-gray-500 text-center py-10">Kayıt bulunamadı.</p>}
      </div>
    </div>
  );
}
