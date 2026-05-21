import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ModeSelector } from "./components/mode-selector";
import { Onboarding } from "./screens/onboarding";
import { Login } from "./screens/login";
import { CustomerHome } from "./screens/customer-home";
import { LiveTracking } from "./screens/live-tracking";
import { ParkingProof } from "./screens/parking-proof";
import { Alerts } from "./screens/alerts";
import { TripPlayback } from "./screens/trip-playback";
import { ValetDashboard } from "./screens/valet-dashboard";
import { AdminDashboard } from "./screens/admin-dashboard";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <Routes>
          {/* Onboarding & Auth */}
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />

          {/* Customer Routes */}
          <Route path="/customer/home" element={<CustomerHome />} />
          <Route path="/customer/tracking" element={<LiveTracking />} />
          <Route path="/customer/parking-proof" element={<ParkingProof />} />
          <Route path="/customer/alerts" element={<Alerts />} />
          <Route path="/customer/trip-playback" element={<TripPlayback />} />

          {/* Valet Routes */}
          <Route path="/valet" element={<ValetDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>

        {/* Mode Selector - appears on all screens except onboarding/login */}
        <ModeSelector />
        <Toaster position="top-center" />
      </BrowserRouter>
    </ThemeProvider>
  );
}