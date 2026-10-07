import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaQrcode, FaEdit, FaTrash, FaFileCsv, FaPlus } from "react-icons/fa";
import api from "../api/axios";
import QRModal from "../components/QRModal";

const CATEGORIES = ["Bilgisayar", "Yazici", "Ag Cihazi", "Sunucu", "Kamera", "Telefon Santrali"];
const STATUSES = ["Aktif", "Pasif", "Bakimda", "Arizali"];
const STATUS_LABELS = { Aktif: "Aktif", Pasif: "Pasif", Bakimda: "Bakımda", Arizali: "Arızalı" };
const STATUS_CLASSES = {
  Aktif: "bg-green-500/20 text-green-400",
  Pasif: "bg-gray-500/20 text-gray-400",
  Bakimda: "bg-yellow-500/20 text-yellow-400",
  Arizali: "bg-red-500/20 text-red-400",
};

const emptyForm = {
  assetNo: "", name: "", category: "Bilgisayar", status: "Aktif",
  district: "", building: "", room: "", purchase_date: "", warranty_end: "", notes: "",
};

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [qrDevice, setQrDevice] = useState(null);

  const fetchDevices = async () => {
    const res = await api.get("/devices", {
      params: { search, category: categoryFilter, status: statusFilter, page, pageSize: 8 },
    });
    setDevices(res.data.data);
    setTotal(res.data.total);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => {
    api.get("/devices/districts").then((res) => setDistricts(res.data));
  }, []);

  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, statusFilter, page]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/devices/${editingId}`, formData);
      } else {
        await api.post("/devices", formData);
      }
      setFormOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
      fetchDevices();
    } catch (err) {
      alert(err.response?.data?.message || "İşlem başarısız.");
    }
  };

  const handleEdit = (device) => {
    setEditingId(device.id);
    setFormData({
      assetNo: device.assetNo || "", name: device.name, category: device.category,
      status: device.status, district: device.district, building: device.building || "",
      room: device.room || "", purchase_date: device.purchase_date || "",
      warranty_end: device.warranty_end || "", notes: device.notes || "",
    });
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu cihazı silmek istediğinize emin misiniz?")) return;
    await api.delete(`/devices/${id}`);
    fetchDevices();
  };

  const handleExport = () => {
    window.open("http://localhost:5000/devices/export/csv?", "_blank");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Cihazlar ({total})</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <FaFileCsv /> CSV İndir
          </button>
          <button
            onClick={() => { setFormOpen(true); setEditingId(null); setFormData(emptyForm); }}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Yeni Cihaz
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="🔍 Cihaz adı veya demirbaş no ara..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input w-auto" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">Tüm Kategoriler</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input w-auto" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Tüm Durumlar</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="card mb-6">
          <h2 className="text-lg font-bold mb-4">{editingId ? "Cihazı Düzenle" : "Yeni Cihaz Ekle"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="input" name="assetNo" placeholder="Demirbaş No (örn. KOC-1042)" value={formData.assetNo} onChange={handleChange} />
            <input className="input" name="name" placeholder="Cihaz Adı" value={formData.name} onChange={handleChange} required />
            <select className="input" name="category" value={formData.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input" name="status" value={formData.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <select className="input" name="district" value={formData.district} onChange={handleChange} required>
              <option value="">İlçe Seçiniz</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input className="input" name="building" placeholder="Bina" value={formData.building} onChange={handleChange} />
            <input className="input" name="room" placeholder="Oda / Kat" value={formData.room} onChange={handleChange} />
            <input className="input" type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} />
            <input className="input" type="date" name="warranty_end" value={formData.warranty_end} onChange={handleChange} />
          </div>
          <textarea className="input mt-4" name="notes" placeholder="Notlar" value={formData.notes} onChange={handleChange} rows={2} />
          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary">{editingId ? "Kaydet" : "Ekle"}</button>
            <button type="button" className="btn-secondary" onClick={() => { setFormOpen(false); setEditingId(null); }}>İptal</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3">Demirbaş</th>
              <th className="pb-3">Cihaz</th>
              <th className="pb-3">Kategori</th>
              <th className="pb-3">Durum</th>
              <th className="pb-3">Konum</th>
              <th className="pb-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                <td className="py-3 text-gray-400">{device.assetNo || "-"}</td>
                <td>
                  <Link to={`/cihazlar/${device.id}`} className="text-cyan-400 hover:underline">
                    {device.name}
                  </Link>
                </td>
                <td>{device.category}</td>
                <td>
                  <span className={`badge ${STATUS_CLASSES[device.status]}`}>
                    {STATUS_LABELS[device.status]}
                  </span>
                </td>
                <td>{device.district}{device.building ? ` / ${device.building}` : ""}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => setQrDevice(device)} className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 p-2 rounded-lg" title="QR Kod">
                      <FaQrcode />
                    </button>
                    <button onClick={() => handleEdit(device)} className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 p-2 rounded-lg" title="Düzenle">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(device.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 p-2 rounded-lg" title="Sil">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm ${p === page ? "bg-cyan-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <QRModal device={qrDevice} onClose={() => setQrDevice(null)} />
    </div>
  );
}
