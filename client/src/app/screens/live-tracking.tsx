import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Car, Navigation, Gauge, MapPin, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { GlassCard } from "../components/glass-card";
import { socket } from "../lib/socket";
import api from "../lib/api";

const journeySteps = [
  { time: "Now", event: "Live Tracking Started", location: "Valet Zone" }
];

export function LiveTracking() {
  const navigate = useNavigate();
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [carPos, setCarPos] = useState({ x: 50, y: 50 }); // percentages
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const { data } = await api.get('/sessions');
      if (data && data.length > 0) {
        const activeSession = data[0];
        setSession(activeSession);
        
        if (activeSession.status === 'in-transit' || activeSession.status === 'returning') {
           // Join socket room
           socket.emit('joinSession', activeSession._id);
           
           socket.on('locationUpdated', (locData: any) => {
              setCurrentSpeed(locData.speed);
              // Simple mapping from lat/lng to percentage for mock UI
              // lat/lng vary by small amounts. We'll map (lat % 0.01) to 0-100%
              const xPos = Math.abs((locData.lng * 10000) % 100);
              const yPos = Math.abs((locData.lat * 10000) % 100);
              setCarPos({ x: xPos, y: yPos });
           });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      socket.off('locationUpdated');
    };
  }, []);

  if (isLoading) {
     return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-[#00C2A8]" /></div>;
  }

  const isTrackingActive = session?.status === 'in-transit' || session?.status === 'returning';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#00C2A8] text-white p-6 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2>Live Tracking</h2>
            <div className="text-sm opacity-80">{session?.vehicleDetails?.make} {session?.vehicleDetails?.model}</div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[60vh]">
        {/* Mock Map */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-[#0d2847] to-[#00C2A8]">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-white/10"></div>
              ))}
            </div>
          </div>

          {!isTrackingActive ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white font-medium">
                 {session?.status === 'parked' ? 'Vehicle is safely parked.' : 'Live tracking not active yet.'}
              </div>
            </div>
          ) : (
            <>
              {/* End marker (current position) */}
              <div
                className="absolute transition-all duration-1000 ease-linear"
                style={{ left: `${carPos.x}%`, top: `${carPos.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative"
                >
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl z-10 relative">
                    <Car className="w-7 h-7 text-[#0B1F3A]" />
                  </div>
                  {/* Pulse rings */}
                  <motion.div
                    animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-white"
                  ></motion.div>
                </motion.div>
              </div>

              {/* Speed indicator */}
              <div className="absolute top-4 right-4 z-10">
                <GlassCard className="p-3 bg-white/90 dark:bg-black/50">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-[#00C2A8]" />
                    <div>
                      <div className="text-xs text-muted-foreground">Speed</div>
                      <div className="font-medium text-lg">{currentSpeed.toFixed(0)} <span className="text-xs">km/h</span></div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </>
          )}
        </div>

        {/* Location info */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <GlassCard className="p-4 bg-white/90 dark:bg-black/50 shadow-xl border-t border-white/20">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00C2A8] to-[#33d4bb] flex items-center justify-center flex-shrink-0 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="font-semibold text-lg">{isTrackingActive ? "En Route to Parking Slot" : (session?.parkingSlot || "Valet Zone")}</div>
                <div className="text-sm text-muted-foreground">
                  Status: <span className="font-medium text-foreground uppercase text-xs">{session?.status}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Action Button */}
      {session?.status === 'parked' && (
        <div className="px-6 py-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/customer/parking-proof")}
            className="w-full bg-gradient-to-r from-[#00C2A8] to-[#33d4bb] text-white rounded-xl py-4 font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            View Parking Proof
          </motion.button>
        </div>
      )}
    </div>
  );
}
