import { motion } from "motion/react";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Gauge,
  Clock,
  CheckCircle,
  Info,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router";
import { GlassCard } from "../components/glass-card";

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "Speed Threshold Exceeded",
    description: "Vehicle exceeded 60 km/h in parking zone",
    time: "2:33 PM",
    location: "En route to parking",
    resolved: true,
    icon: Gauge,
  },
  {
    id: 2,
    type: "info",
    title: "Parking Zone Reached",
    description: "Vehicle arrived at designated parking area",
    time: "2:34 PM",
    location: "Level 2, Zone A",
    resolved: true,
    icon: MapPin,
  },
  {
    id: 3,
    type: "success",
    title: "Vehicle Safely Parked",
    description: "Parking proof uploaded and verified",
    time: "2:35 PM",
    location: "Level 2, Zone A, Slot 15",
    resolved: true,
    icon: CheckCircle,
  },
];

export function Alerts() {
  const navigate = useNavigate();

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-warning/10 dark:bg-warning/20",
          text: "text-warning",
          border: "border-warning/20",
        };
      case "error":
        return {
          bg: "bg-destructive/10 dark:bg-destructive/20",
          text: "text-destructive",
          border: "border-destructive/20",
        };
      case "success":
        return {
          bg: "bg-success/10 dark:bg-success/20",
          text: "text-success",
          border: "border-success/20",
        };
      default:
        return {
          bg: "bg-accent/10 dark:bg-accent/20",
          text: "text-accent",
          border: "border-accent/20",
        };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#00C2A8] text-white p-6 relative">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2>Activity Alerts</h2>
            <div className="text-sm opacity-80">Real-time notifications</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="p-3 bg-white/10 text-center">
            <div className="text-2xl font-medium">3</div>
            <div className="text-xs opacity-80">Total</div>
          </GlassCard>
          <GlassCard className="p-3 bg-white/10 text-center">
            <div className="text-2xl font-medium">1</div>
            <div className="text-xs opacity-80">Warnings</div>
          </GlassCard>
          <GlassCard className="p-3 bg-white/10 text-center">
            <div className="text-2xl font-medium">3</div>
            <div className="text-xs opacity-80">Resolved</div>
          </GlassCard>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Recent Alerts</h3>
          <button className="text-[#00C2A8] text-sm hover:text-[#33d4bb] transition-colors">
            Clear All
          </button>
        </div>

        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const colors = getAlertColor(alert.type);
            const Icon = alert.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  className={`p-4 bg-card border ${colors.border} relative overflow-hidden`}
                >
                  {/* Accent bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      alert.type === "warning"
                        ? "bg-warning"
                        : alert.type === "success"
                        ? "bg-success"
                        : "bg-accent"
                    }`}
                  ></div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium">{alert.title}</div>
                        {alert.resolved && (
                          <div className="px-2 py-0.5 bg-success/10 dark:bg-success/20 text-success rounded-full text-xs flex-shrink-0">
                            Resolved
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Alert Settings */}
        <div className="mt-8">
          <h3 className="mb-4">Alert Preferences</h3>
          <GlassCard className="p-4 bg-card">
            <div className="space-y-4">
              {[
                { label: "Speed Alerts", description: "Get notified when speed exceeds limit" },
                { label: "Zone Alerts", description: "Alert when car leaves parking zone" },
                { label: "Movement Alerts", description: "Notify on any vehicle movement" },
                { label: "Push Notifications", description: "Enable mobile notifications" },
              ].map((setting, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{setting.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {setting.description}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-[#00C2A8] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C2A8]"></div>
                    </label>
                  </div>
                  {index < 3 && <div className="h-px bg-border mt-4"></div>}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
