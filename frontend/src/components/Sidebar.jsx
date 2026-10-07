import { NavLink } from "react-router-dom";
import {
  FaChartPie, FaDesktop, FaTools, FaMapMarkedAlt, FaHistory, FaUsersCog, FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Gösterge Paneli", icon: FaChartPie, end: true },
  { to: "/cihazlar", label: "Cihazlar", icon: FaDesktop },
  { to: "/arizalar", label: "Arıza Takip", icon: FaTools },
  { to: "/bakim", label: "Bakım Geçmişi", icon: FaHistory },
  { to: "/harita", label: "Harita", icon: FaMapMarkedAlt },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-panel min-h-screen p-5 flex flex-col justify-between border-r border-gray-800">
      <div>
        <div className="mb-8">
          <h1 className="text-lg font-bold text-cyan-400 leading-tight">
            Kocaeli BB
          </h1>
          <p className="text-xs text-gray-400">
            Envanter &amp; Arıza Takip Sistemi
          </p>
        </div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`
              }
            >
              <Icon /> {label}
            </NavLink>
          ))}
          {user?.role === "Yonetici" && (
            <NavLink
              to="/kullanicilar"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`
              }
            >
              <FaUsersCog /> Kullanıcılar
            </NavLink>
          )}
        </nav>
      </div>

      <div className="border-t border-gray-800 pt-4">
        <p className="text-sm font-semibold">{user?.full_name}</p>
        <p className="text-xs text-gray-500 mb-3">
          {user?.role === "Yonetici" ? "Yönetici" : "Teknisyen"}
        </p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
        >
          <FaSignOutAlt /> Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
