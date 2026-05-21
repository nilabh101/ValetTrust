import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Car,
  Star,
  Navigation,
  Camera,
  Bell,
  Menu,
  Moon,
  Sun,
  Shield,
  Clock,
  CheckCircle,
  Plus,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router";
import { GlassCard } from "../components/glass-card";
import { useTheme } from "../components/theme-provider";
import { useAuthStore } from "../lib/store";
import api from "../lib/api";
import { toast } from "sonner";

export function CustomerHome() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const { data } = await api.get('/sessions');
      // Just get the most recent active session
      if (data && data.length > 0) {
        setSession(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestValet = async () => {
    try {
      const { data } = await api.post('/sessions', {
        vehicleDetails: { make: "Toyota", model: "Camry", plateNumber: "ABC 123" } // Default for MVP
      });
      setSession(data);
      toast.success("Valet requested successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request valet");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "parked":
        return "bg-green-500/20 text-green-500";
      case "in-transit":
      case "handover":
      case "returning":
        return "bg-yellow-500/20 text-yellow-500";
      case "returned":
        return "bg-gray-500/20 text-gray-500";
      default:
        return "bg-blue-500/20 text-blue-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Waiting for Valet";
      case "handover": return "Handing Over";
      case "in-transit": return "Valet Driving";
      case "parked": return "Safely Parked";
      case "returning": return "Valet Returning";
      case "returned": return "Vehicle Returned";
      default: return "Unknown";
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#00C2A8] text-white p-6 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C2A8] rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm opacity-80">Welcome back</div>
                <div className="font-semibold">{user?.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-6 z-50 bg-card border border-border rounded-xl shadow-xl p-2 w-48"
          >
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-muted rounded-lg text-destructive">
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="px-6 -mt-24 relative z-10 pb-24">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-[#00C2A8]" />
          </div>
        ) : session ? (
          <>
            {/* Status Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <GlassCard className="p-6 bg-card border-l-4 border-l-[#00C2A8]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00C2A8] to-[#33d4bb] flex items-center justify-center shadow-md">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">Your Vehicle</div>
                      <div className="font-semibold">{session.vehicleDetails?.make} {session.vehicleDetails?.model}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(session.status)}`}>
                    <CheckCircle className="w-3 h-3" />
                    {getStatusText(session.status)}
                  </div>
                </div>

                <div className="h-px bg-border my-4"></div>

                {/* Valet Info */}
                {session.valet ? (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-[#00C2A8] bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                      {session.valet.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{session.valet.name}</span>
                        <div className="flex items-center gap-1 text-[#f59e0b]">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-medium">4.9</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Assigned Valet
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mb-4 italic">Waiting for valet assignment...</div>
                )}

                {/* Parking Details */}
                {(session.status === 'parked' || session.status === 'returned') && (
                  <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-[#00C2A8]" />
                      <span>{session.parkingSlot || "Valet Zone"}</span>
                    </div>
                    {session.parkedAt && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-[#00C2A8]" />
                        <span>Parked at {new Date(session.parkedAt).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Live Location Action */}
            {(session.status === 'in-transit' || session.status === 'returning') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
                <GlassCard className="p-4 bg-card border border-[#00C2A8]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-[#00C2A8]">Live Tracking Active</h3>
                      <p className="text-sm text-muted-foreground">Tap to view your vehicle's live location</p>
                    </div>
                    <button
                      onClick={() => navigate("/customer/tracking")}
                      className="w-10 h-10 rounded-full bg-[#00C2A8] text-white flex items-center justify-center shadow-lg hover:bg-[#33d4bb] transition-colors"
                    >
                      <Navigation className="w-5 h-5" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="mb-3 font-semibold px-1">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <GlassCard hover onClick={() => navigate("/customer/tracking")} className="p-4 bg-card flex flex-col items-center text-center cursor-pointer transition-transform active:scale-95">
                  <div className="w-12 h-12 rounded-full bg-[#00C2A8]/10 flex items-center justify-center mb-2">
                    <Navigation className="w-6 h-6 text-[#00C2A8]" />
                  </div>
                  <span className="text-sm font-medium">Track Car</span>
                </GlassCard>

                <GlassCard hover onClick={() => navigate("/customer/parking-proof")} className="p-4 bg-card flex flex-col items-center text-center cursor-pointer transition-transform active:scale-95">
                  <div className="w-12 h-12 rounded-full bg-[#00C2A8]/10 flex items-center justify-center mb-2">
                    <Camera className="w-6 h-6 text-[#00C2A8]" />
                  </div>
                  <span className="text-sm font-medium">View Proof</span>
                </GlassCard>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Car className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Active Session</h2>
            <p className="text-muted-foreground mb-8">Request a valet to park your vehicle safely.</p>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button for New Request */}
      {(!session || session.status === 'returned') && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={requestValet}
          className="fixed bottom-6 right-6 px-6 h-14 rounded-full bg-gradient-to-br from-[#00C2A8] to-[#33d4bb] text-white font-semibold shadow-2xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Request Valet
        </motion.button>
      )}
    </div>
  );
}
