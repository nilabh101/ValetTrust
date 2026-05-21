import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  X,
  ZoomIn,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router";
import { GlassCard } from "../components/glass-card";

const parkingPhotos = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
    timestamp: "2:35 PM",
    type: "Front View",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
    timestamp: "2:35 PM",
    type: "Side View",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80",
    timestamp: "2:35 PM",
    type: "Parking Spot",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1574445934998-f6c131fb1c29?w=800&q=80",
    timestamp: "2:35 PM",
    type: "Surroundings",
  },
];

export function ParkingProof() {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

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
            <h2>Parking Proof</h2>
            <div className="text-sm opacity-80">Verified Documentation</div>
          </div>
        </div>

        {/* Verification Badge */}
        <GlassCard className="p-4 bg-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>Verified Parking</div>
              <div className="text-sm opacity-80">
                All photos verified and timestamped
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Location & Time Info */}
        <GlassCard className="p-4 mb-6 bg-card">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#00C2A8] mt-0.5" />
              <div>
                <div className="font-medium">Parking Location</div>
                <div className="text-sm text-muted-foreground">
                  Level 2, Zone A, Slot 15
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Riyadh Park Mall, Riyadh
                </div>
              </div>
            </div>
            <div className="h-px bg-border"></div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#00C2A8]" />
              <div>
                <div className="font-medium">Parked At</div>
                <div className="text-sm text-muted-foreground">
                  Today, 2:35 PM (May 21, 2026)
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Photo Gallery */}
        <h3 className="mb-4">Photo Evidence ({parkingPhotos.length})</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {parkingPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPhoto(index)}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
            >
              <img
                src={photo.url}
                alt={photo.type}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                <div className="text-sm font-medium">{photo.type}</div>
                <div className="text-xs opacity-80">{photo.timestamp}</div>
              </div>
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Valet Info */}
        <GlassCard className="p-4 bg-card">
          <div className="flex items-center gap-3 mb-3">
            <Camera className="w-5 h-5 text-[#00C2A8]" />
            <div>
              <div className="font-medium">Documented by Valet</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
              alt="Ahmed Hassan"
              className="w-10 h-10 rounded-full border-2 border-[#00C2A8]"
            />
            <div>
              <div>Ahmed Hassan</div>
              <div className="text-sm text-muted-foreground">ID: VT-2847</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Full Screen Photo Viewer */}
      <AnimatePresence>
        {selectedPhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="absolute top-6 left-6 text-white">
              <div className="text-sm opacity-60">
                {selectedPhoto + 1} / {parkingPhotos.length}
              </div>
              <div className="mt-2">{parkingPhotos[selectedPhoto].type}</div>
              <div className="text-sm opacity-80">
                {parkingPhotos[selectedPhoto].timestamp}
              </div>
            </div>

            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={parkingPhotos[selectedPhoto].url}
              alt={parkingPhotos[selectedPhoto].type}
              className="max-w-full max-h-[80vh] rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {parkingPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedPhoto ? "w-8 bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // Mock download
              }}
              className="absolute bottom-6 right-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white flex items-center gap-2 hover:bg-white/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
