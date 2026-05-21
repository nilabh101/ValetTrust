import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Car,
  Users,
  AlertTriangle,
  MapPin,
  Star,
  Shield,
  Menu,
  Search,
  Filter,
  Bell,
  LogOut,
  Loader2
} from "lucide-react";
import { GlassCard } from "../components/glass-card";
import { useTheme } from "../components/theme-provider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../lib/api";
import { socket } from "../lib/socket";
import { useAuthStore } from "../lib/store";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function AdminDashboard() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("today");

  const [stats, setStats] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carPositions, setCarPositions] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    fetchData();

    socket.emit('joinAdmin');

    socket.on('adminLocationUpdated', (data: any) => {
       setCarPositions(prev => ({
         ...prev,
         [data.sessionId]: { 
           x: Math.abs((data.lng * 10000) % 100), 
           y: Math.abs((data.lat * 10000) % 100) 
         }
       }));
    });

    socket.on('newAlert', (alert: any) => {
       toast.error(`New Alert: ${alert.message}`);
       setAlerts(prev => [alert, ...prev]);
       fetchData(); // Refresh stats
    });

    return () => {
      socket.off('adminLocationUpdated');
      socket.off('newAlert');
    };
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, sessionsRes, alertsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/sessions'),
        api.get('/admin/alerts')
      ]);

      setStats({
        activeSessions: statsRes.data.activeSessions,
        totalSessions: statsRes.data.totalSessions,
        totalAlerts: statsRes.data.totalAlerts,
        valets: 5 // Mock static for now
      });
      setActiveSessions(sessionsRes.data.filter((s: any) => s.status !== 'returned'));
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "parked": return "bg-green-500/10 text-green-500";
      case "in-transit": 
      case "handover":
      case "returning": return "bg-yellow-500/10 text-yellow-500";
      default: return "bg-muted/10 text-muted-foreground";
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
     return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-[#00C2A8]" /></div>;
  }

  const statCards = [
    { label: "Active Sessions", value: stats?.activeSessions || 0, icon: Car, color: "text-[#00C2A8]" },
    { label: "Total Sessions", value: stats?.totalSessions || 0, icon: Users, color: "text-[#0B1F3A]" },
    { label: "Alerts", value: stats?.totalAlerts || 0, icon: AlertTriangle, color: "text-red-500" },
    { label: "Avg. Rating", value: "4.8", icon: Star, color: "text-yellow-500" },
  ];

  const activityData = [
    { time: "09:00", sessions: 2 },
    { time: "10:00", sessions: 5 },
    { time: "11:00", sessions: 8 },
    { time: "12:00", sessions: 12 },
    { time: "13:00", sessions: stats?.totalSessions || 15 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40 backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C2A8] to-[#33d4bb] flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold">ValetTrust Admin</h2>
                <p className="text-sm text-muted-foreground">Real-time monitoring</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors relative">
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>}
            </button>
            <button onClick={handleLogout} className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <GlassCard className="p-6 bg-card border border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center shadow-inner`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Sessions Table */}
            <GlassCard className="p-6 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold">Active Sessions</h3>
                  <p className="text-sm text-muted-foreground">Live vehicles in the system</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valet</th>
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle</th>
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSessions.length > 0 ? activeSessions.map((session) => (
                      <tr key={session._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 text-sm font-medium">{session.customer?.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{session.valet?.name || 'Unassigned'}</td>
                        <td className="py-3 text-sm">{session.vehicleDetails?.make} {session.vehicleDetails?.model}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{session.parkingSlot || '-'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No active sessions</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

             {/* Alerts Table */}
             <GlassCard className="p-6 bg-card border-l-4 border-l-red-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold">Recent Alerts</h3>
                  <p className="text-sm text-muted-foreground">Geofencing & Speed anomalies</p>
                </div>
              </div>
              <div className="space-y-3">
                 {alerts.length > 0 ? alerts.slice(0, 5).map(alert => (
                    <div key={alert._id} className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                       <AlertTriangle className="w-5 h-5 text-destructive" />
                       <div className="flex-1">
                          <div className="font-medium text-sm">{alert.message}</div>
                          <div className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleString()} • {alert.type}</div>
                       </div>
                    </div>
                 )) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">No recent alerts</div>
                 )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Live Map Preview */}
            <GlassCard className="p-6 bg-card">
              <h3 className="mb-4 font-bold">Live Vehicle Map</h3>
              <div className="aspect-square w-full bg-slate-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Simulated Vehicles */}
                {Object.entries(carPositions).map(([id, pos]) => (
                  <div
                    key={id}
                    className="absolute w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg transition-all duration-1000 ease-linear"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <Car className="w-4 h-4 text-[#0B1F3A]" />
                    <span className="absolute -top-6 text-[10px] bg-black/80 text-white px-1 py-0.5 rounded whitespace-nowrap">Valet</span>
                  </div>
                ))}

                {Object.keys(carPositions).length === 0 && (
                   <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                      No moving vehicles
                   </div>
                )}
              </div>
            </GlassCard>
            
            {/* Activity Chart */}
            <GlassCard className="p-6 bg-card">
              <h3 className="mb-4 font-bold">Session Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="sessions" stroke="#00C2A8" strokeWidth={3} dot={{ fill: "#00C2A8", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>

          </div>
        </div>
      </div>
    </div>
  );
}
