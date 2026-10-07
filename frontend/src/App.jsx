import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import Faults from "./pages/Faults";
import Maintenance from "./pages/Maintenance";
import MapView from "./pages/MapView";
import Users from "./pages/Users";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/cihazlar" element={<Devices />} />
        <Route path="/cihazlar/:id" element={<DeviceDetail />} />
        <Route path="/arizalar" element={<Faults />} />
        <Route path="/bakim" element={<Maintenance />} />
        <Route path="/harita" element={<MapView />} />
        <Route
          path="/kullanicilar"
          element={
            <ProtectedRoute roles={["Yonetici"]}>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
