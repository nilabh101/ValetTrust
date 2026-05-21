import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, UserCircle, Shield, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { GlassCard } from "./glass-card";

const modes = [
  {
    id: "customer",
    label: "Customer",
    icon: UserCircle,
    path: "/customer/home",
    color: "from-[#00C2A8] to-[#33d4bb]",
  },
  {
    id: "valet",
    label: "Valet",
    icon: Users,
    path: "/valet",
    color: "from-[#0B1F3A] to-[#1a3a5c]",
  },
  {
    id: "admin",
    label: "Admin",
    icon: Shield,
    path: "/admin",
    color: "from-[#00C2A8] to-[#0B1F3A]",
  },
];

export function ModeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on onboarding/login
  if (location.pathname === "/onboarding" || location.pathname === "/login") {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#0B1F3A] to-[#00C2A8] text-white shadow-2xl flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Users className="w-6 h-6" />}
      </motion.button>

      {/* Mode Selector Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 left-6 z-50"
            >
              <GlassCard className="p-4 bg-card min-w-[200px]">
                <div className="mb-3 text-sm text-muted-foreground">Switch Mode</div>
                <div className="space-y-2">
                  {modes.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = location.pathname.startsWith(
                      mode.path.split("/").slice(0, 2).join("/")
                    );

                    return (
                      <motion.button
                        key={mode.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          navigate(mode.path);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-gradient-to-r " + mode.color + " text-white"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{mode.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
