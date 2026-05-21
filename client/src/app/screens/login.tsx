import { useState } from "react";
import { motion } from "motion/react";
import { Phone, Lock, ArrowRight, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { GlassCard } from "../components/glass-card";
import { useAuthStore } from "../lib/store";
import api from "../lib/api";
import { toast } from "sonner";

export function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name) {
          toast.error("Please enter your name");
          setIsLoading(false);
          return;
        }
        const { data } = await api.post("/auth/register", { name, phone, password, role });
        setAuth(data);
        toast.success("Registration successful!");
      } else {
        const { data } = await api.post("/auth/login", { phone, password });
        setAuth(data);
        toast.success("Login successful!");
      }

      // Redirect based on role
      const userState = useAuthStore.getState().user;
      if (userState?.role === "customer") navigate("/customer/home");
      else if (userState?.role === "valet") navigate("/valet");
      else if (userState?.role === "admin") navigate("/admin");
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0B1F3A] via-[#0d2847] to-[#00C2A8] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#00C2A8] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#00C2A8] rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
        <div className="max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C2A8] to-[#33d4bb] flex items-center justify-center shadow-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-white text-center mb-2">Welcome to ValetTrust</h1>
            <p className="text-white/70 text-center mb-8">
              {isRegister ? "Create a new account" : "Sign in to your account"}
            </p>
          </motion.div>

          <GlassCard className="p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <label className="text-white/90 block mb-2">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00C2A8]"
                    />
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="text-white/90 block mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00C2A8]"
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="text-white/90 block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00C2A8]"
                  />
                </div>
              </motion.div>

              {isRegister && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <label className="text-white/90 block mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00C2A8]"
                  >
                    <option value="customer" className="text-black">Customer</option>
                    <option value="valet" className="text-black">Valet Staff</option>
                    <option value="admin" className="text-black">Admin</option>
                  </select>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-[#00C2A8] text-white rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow"
              >
                <span>{isLoading ? "Processing..." : (isRegister ? "Sign Up" : "Sign In")}</span>
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </motion.button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-white/70 hover:text-white"
              >
                {isRegister ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
