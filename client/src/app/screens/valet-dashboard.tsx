import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Car,
  CheckCircle,
  Camera,
  MapPin,
  Clock,
  Navigation,
  Upload,
  User,
  Menu,
  Loader2,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router";
import { GlassCard } from "../components/glass-card";
import { useAuthStore } from "../lib/store";
import api from "../lib/api";
import { socket } from "../lib/socket";
import { toast } from "sonner";

export function ValetDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [step, setStep] = useState<"accept" | "navigate" | "upload" | "complete">("accept");
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tracking Simulation State
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchSession();
    return () => stopTracking();
  }, []);

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/sessions');
      if (data && data.length > 0) {
        setSession(data[0]);
        // Set step based on status
        if (data[0].status === 'pending') setStep('accept');
        else if (data[0].status === 'handover' || data[0].status === 'in-transit') setStep('navigate');
        else if (data[0].status === 'parked' && !data[0].parkingProof?.images?.length) setStep('upload');
        else setStep('complete');
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!session) return;
    try {
      const { data } = await api.put(`/sessions/${session._id}/accept`);
      setSession(data);
      setStep("navigate");
      toast.success("Assignment accepted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept");
    }
  };

  const startJourney = async () => {
    if (!session) return;
    try {
      const { data } = await api.put(`/sessions/${session._id}/status`, { status: 'in-transit' });
      setSession(data);
      toast.success("Journey started");
      
      // Simulate Tracking
      let lat = 28.6139; // Starting center
      let lng = 77.2090;
      
      trackingInterval.current = setInterval(() => {
        lat += (Math.random() - 0.5) * 0.001;
        lng += (Math.random() - 0.5) * 0.001;
        const speed = Math.floor(Math.random() * 40) + 10;
        
        socket.emit('updateLocation', {
          sessionId: session._id,
          lat,
          lng,
          speed
        });
      }, 3000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const stopTracking = () => {
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
    }
  };

  const handleReachedSpot = async () => {
    stopTracking();
    setStep("upload");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  const handleUpload = async () => {
    if (!session || photos.length === 0) {
      toast.error("Please add at least one photo");
      return;
    }
    
    try {
      setIsLoading(true);
      const formData = new FormData();
      photos.forEach(photo => formData.append('images', photo));
      formData.append('parkingSlot', 'Level 2, Zone A, Slot 15');
      formData.append('coordinates', JSON.stringify({ lat: 28.6145, lng: 77.2095 }));
      
      await api.post(`/sessions/${session._id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await api.put(`/sessions/${session._id}/status`, { status: 'parked' });
      setStep("complete");
      toast.success("Vehicle safely parked");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload proof");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading && !session) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-[#00C2A8]" /></div>;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#00C2A8] text-white p-6 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C2A8] rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm opacity-80">Valet</div>
                <div className="font-semibold">{user?.name}</div>
              </div>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-16 right-0 z-50 bg-card border border-border rounded-xl shadow-xl p-2 w-48"
              >
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-muted rounded-lg text-destructive flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-3">
            <GlassCard className="p-3 bg-white/10 text-center">
              <div className="text-2xl font-medium">12</div>
              <div className="text-xs opacity-80">Today</div>
            </GlassCard>
            <GlassCard className="p-3 bg-white/10 text-center">
              <div className="text-2xl font-medium">{session ? 1 : 0}</div>
              <div className="text-xs opacity-80">Active</div>
            </GlassCard>
            <GlassCard className="p-3 bg-white/10 text-center">
              <div className="text-2xl font-medium">4.9</div>
              <div className="text-xs opacity-80">Rating</div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-16 relative z-10 pb-6">
        {session ? (
          <>
            {/* Progress Steps */}
            <GlassCard className="p-4 bg-card mb-6 shadow-sm">
              <div className="flex justify-between mb-2">
                {[
                  { key: "accept", label: "Accept", icon: CheckCircle },
                  { key: "navigate", label: "Navigate", icon: Navigation },
                  { key: "upload", label: "Upload", icon: Camera },
                  { key: "complete", label: "Complete", icon: Car },
                ].map((s, index) => {
                  const Icon = s.icon;
                  const isActive = step === s.key;
                  const stepsOrder = ["accept", "navigate", "upload", "complete"];
                  const isCompleted = stepsOrder.indexOf(step) > stepsOrder.indexOf(s.key);

                  return (
                    <div key={s.key} className="flex flex-col items-center flex-1 relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors ${
                          isActive
                            ? "bg-[#00C2A8] text-white shadow-md"
                            : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs text-center font-medium ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Current Assignment */}
            <GlassCard className="p-6 bg-card mb-6 shadow-sm border-l-4 border-l-[#00C2A8]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Current Assignment</h3>
                <div className="px-3 py-1 bg-[#00C2A8]/10 text-[#00C2A8] rounded-full text-xs font-bold uppercase tracking-wider">
                  {session.status}
                </div>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B1F3A] to-[#00C2A8] flex items-center justify-center text-white font-bold text-xl">
                    {session.customer?.name?.charAt(0) || <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="font-semibold text-base">{session.customer?.name}</div>
                    <div className="text-sm text-muted-foreground">{session.customer?.phone}</div>
                  </div>
                </div>

                <div className="h-px bg-border"></div>

                {/* Vehicle Info */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Vehicle Details</div>
                  <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-[#00C2A8]" />
                      <span className="font-medium">{session.vehicleDetails?.make} {session.vehicleDetails?.model}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 ml-0.5" />
                      <span className="text-sm">{session.vehicleDetails?.plateNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border"></div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Requested at {new Date(session.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </GlassCard>

            {/* Actions */}
            {step === "accept" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAccept}
                  className="w-full bg-gradient-to-r from-[#00C2A8] to-[#33d4bb] text-white rounded-xl py-4 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Accept Assignment
                </motion.button>
              </motion.div>
            )}

            {step === "navigate" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <GlassCard className="p-4 bg-card">
                  <div className="aspect-video w-full bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <Navigation className="w-12 h-12 text-[#00C2A8] animate-pulse mb-2" />
                      <span className="text-white font-medium">Tracking Active</span>
                    </div>
                  </div>
                </GlassCard>
                {session.status === 'handover' ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startJourney}
                    className="w-full bg-gradient-to-r from-[#00C2A8] to-[#33d4bb] text-white rounded-xl py-4 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Driving (Simulate)
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReachedSpot}
                    className="w-full bg-yellow-500 text-white rounded-xl py-4 font-semibold shadow-lg hover:bg-yellow-600 transition-all"
                  >
                    I've Reached the Spot
                  </motion.button>
                )}
              </motion.div>
            )}

            {step === "upload" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <GlassCard className="p-6 bg-card">
                  <h4 className="mb-4 font-semibold text-lg">Upload Parking Proof</h4>
                  <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {photos.length > 0 ? photos.map((file, i) => (
                      <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                         <img src={URL.createObjectURL(file)} alt="proof" className="w-full h-full object-cover" />
                      </div>
                    )) : (
                      <div onClick={() => fileInputRef.current?.click()} className="col-span-2 aspect-video border-2 border-dashed border-[#00C2A8] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#00C2A8]/5 transition-colors">
                        <Camera className="w-10 h-10 text-[#00C2A8] mb-2" />
                        <span className="text-sm font-medium">Tap to Take Photos</span>
                      </div>
                    )}
                  </div>
                  {photos.length > 0 && (
                     <button onClick={() => fileInputRef.current?.click()} className="text-sm text-[#00C2A8] mb-2 font-medium w-full text-center">+ Add more photos</button>
                  )}
                  <p className="text-xs text-muted-foreground text-center">Take photos from all angles to verify parking condition.</p>
                </GlassCard>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={isLoading || photos.length === 0}
                  className="w-full bg-gradient-to-r from-[#00C2A8] to-[#33d4bb] text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span>{isLoading ? "Uploading..." : "Submit Proof & Complete"}</span>
                </motion.button>
              </motion.div>
            )}

            {step === "complete" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Task Completed!</h2>
                <p className="text-muted-foreground mb-8 text-lg">Vehicle safely parked and customer notified.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSession(null); fetchSession(); }}
                  className="bg-gradient-to-r from-[#0B1F3A] to-[#0d2847] text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all"
                >
                  Find Next Assignment
                </motion.button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Active Assignments</h3>
            <p className="text-muted-foreground">You're all caught up. Wait for new requests.</p>
            <button onClick={fetchSession} className="mt-6 text-[#00C2A8] font-medium flex items-center gap-2">
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
