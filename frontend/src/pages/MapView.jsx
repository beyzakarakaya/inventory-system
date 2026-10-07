import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_LABELS = { Aktif: "Aktif", Pasif: "Pasif", Bakimda: "Bakımda", Arizali: "Arızalı" };
const STATUS_COLORS = { Aktif: "#22c55e", Pasif: "#6b7280", Bakimda: "#eab308", Arizali: "#ef4444" };

// Kocaeli il merkezi
const KOCAELI_CENTER = [40.83, 29.75];

export default function MapView() {
  const [devices, setDevices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    api.get("/devices/map").then((res) => setDevices(res.data));
  }, []);

  const filtered = statusFilter ? devices.filter((d) => d.status === statusFilter) : devices;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Cihaz Konum Haritası</h1>
        <div className="flex gap-2">
          {["", "Aktif", "Pasif", "Bakimda", "Arizali"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm ${statusFilter === s ? "bg-cyan-500 text-white" : "bg-gray-800 text-gray-400"}`}
            >
              {s === "" ? "Tümü" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <MapContainer center={KOCAELI_CENTER} zoom={10} style={{ height: "600px", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap katkıda bulunanları'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((d) => (
            <CircleMarker
              key={d.id}
              center={[d.lat, d.lng]}
              radius={9}
              pathOptions={{ color: STATUS_COLORS[d.status], fillColor: STATUS_COLORS[d.status], fillOpacity: 0.8 }}
            >
              <Popup>
                <div className="text-sm text-gray-900">
                  <p className="font-bold">{d.name}</p>
                  <p>{d.category} · {STATUS_LABELS[d.status]}</p>
                  <p className="text-gray-600">{d.district} {d.building ? `/ ${d.building}` : ""}</p>
                  <Link to={`/cihazlar/${d.id}`} className="text-cyan-600 underline">
                    Detayları gör
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        * Konumlar, cihazın kayıtlı olduğu ilçe merkezine göre yaklaşık olarak
        gösterilmektedir; kesin GPS koordinatı değildir.
      </p>
    </div>
  );
}
