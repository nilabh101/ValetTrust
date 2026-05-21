import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Car,
  MapPin,
  Clock,
  Gauge,
} from "lucide-react";
import { useNavigate } from "react-router";
import { GlassCard } from "../components/glass-card";

const tripStops = [
  { time: "2:30:00", lat: 20, lng: 80, speed: 0, event: "Vehicle Handover" },
  { time: "2:30:30", lat: 25, lng: 75, speed: 15, event: null },
  { time: "2:31:00", lat: 35, lng: 65, speed: 25, event: null },
  { time: "2:31:30", lat: 45, lng: 55, speed: 30, event: null },
  { time: "2:32:00", lat: 55, lng: 50, speed: 35, event: null },
  { time: "2:32:30", lat: 65, lng: 45, speed: 28, event: null },
  { time: "2:33:00", lat: 70, lng: 42, speed: 20, event: "Entering Parking Zone" },
  { time: "2:34:00", lat: 73, lng: 40, speed: 10, event: null },
  { time: "2:35:00", lat: 75, lng: 40, speed: 0, event: "Parked" },
];

export function TripPlayback() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const currentStop = tripStops[currentStep];
  const duration = tripStops.length - 1;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStep(parseInt(e.target.value));
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentStep === duration) {
      setCurrentStep(0);
    }
  };

  const handleSkipBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
    setIsPlaying(false);
  };

  const handleSkipForward = () => {
    setCurrentStep(Math.min(duration, currentStep + 1));
    setIsPlaying(false);
  };

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
            <h2>Trip Playback</h2>
            <div className="text-sm opacity-80">Replay your journey</div>
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="relative h-[50vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-[#0d2847] to-[#00C2A8]">
          {/* Grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-white/10"></div>
              ))}
            </div>
          </div>

          {/* Route trail */}
          <svg className="absolute inset-0 w-full h-full">
            <motion.path
              d={tripStops
                .slice(0, currentStep + 1)
                .map((stop, i) => `${i === 0 ? "M" : "L"} ${stop.lat}% ${stop.lng}%`)
                .join(" ")}
              stroke="#00C2A8"
              strokeWidth="3"
              fill="none"
              opacity="0.8"
            />
          </svg>

          {/* Previous positions */}
          {tripStops.slice(0, currentStep).map((stop, index) => (
            <div
              key={index}
              className="absolute w-2 h-2 rounded-full bg-white/40"
              style={{
                left: `${stop.lat}%`,
                top: `${stop.lng}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

          {/* Current position */}
          <motion.div
            className="absolute"
            style={{
              left: `${currentStop.lat}%`,
              top: `${currentStop.lng}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-2xl">
              <Car className="w-6 h-6 text-[#0B1F3A]" />
            </div>
            <motion.div
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-white"
            />
          </motion.div>

          {/* Event markers */}
          {tripStops
            .filter((stop) => stop.event)
            .map((stop, index) => (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${stop.lat}%`,
                  top: `${stop.lng}%`,
                  transform: "translate(-50%, calc(-100% - 10px))",
                }}
              >
                <div className="bg-white/90 dark:bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs whitespace-nowrap">
                  {stop.event}
                </div>
              </div>
            ))}
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 z-10 space-y-2">
          <GlassCard className="p-3 bg-white/90 dark:bg-black/50">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#00C2A8]" />
              <div>
                <div className="text-xs text-muted-foreground">Speed</div>
                <div className="font-medium">{currentStop.speed} km/h</div>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-3 bg-white/90 dark:bg-black/50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00C2A8]" />
              <div>
                <div className="text-xs text-muted-foreground">Time</div>
                <div className="font-medium">{currentStop.time}</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="px-6 py-6">
        <GlassCard className="p-6 bg-card">
          {/* Timeline Slider */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{tripStops[0].time}</span>
              <span>{tripStops[tripStops.length - 1].time}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentStep}
              onChange={handleSliderChange}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00C2A8] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#00C2A8] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
              style={{
                background: `linear-gradient(to right, #00C2A8 0%, #00C2A8 ${
                  (currentStep / duration) * 100
                }%, var(--color-muted) ${(currentStep / duration) * 100}%, var(--color-muted) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Step {currentStep + 1}</span>
              <span>{duration + 1} total points</span>
            </div>
          </div>

          {/* Event display */}
          {currentStop.event && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-[#00C2A8]/10 dark:bg-[#00C2A8]/20 rounded-lg flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#00C2A8]" />
              <span className="text-sm">{currentStop.event}</span>
            </motion.div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSkipBack}
              disabled={currentStep === 0}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00C2A8] to-[#33d4bb] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSkipForward}
              disabled={currentStep === duration}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Playback speed */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Speed:</span>
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  playbackSpeed === speed
                    ? "bg-[#00C2A8] text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Trip Summary */}
        <div className="mt-6">
          <h3 className="mb-3">Trip Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            <GlassCard className="p-3 bg-card text-center">
              <Clock className="w-5 h-5 text-[#00C2A8] mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="font-medium">5 min</div>
            </GlassCard>
            <GlassCard className="p-3 bg-card text-center">
              <Gauge className="w-5 h-5 text-[#00C2A8] mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Max Speed</div>
              <div className="font-medium">35 km/h</div>
            </GlassCard>
            <GlassCard className="p-3 bg-card text-center">
              <MapPin className="w-5 h-5 text-[#00C2A8] mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Stops</div>
              <div className="font-medium">3</div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
