import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, MapPin, Camera, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { GlassCard } from "../components/glass-card";

const slides = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "Track your vehicle in real-time with complete transparency. Know exactly where your car is at all times.",
    color: "from-[#00C2A8] to-[#33d4bb]",
  },
  {
    icon: MapPin,
    title: "Live GPS Tracking",
    description: "Monitor your car's journey with precise GPS tracking. Get alerts for any suspicious activity instantly.",
    color: "from-[#0B1F3A] to-[#1a3a5c]",
  },
  {
    icon: Camera,
    title: "Parking Proof",
    description: "Receive verified photos and location stamps when your car is parked. Complete peace of mind.",
    color: "from-[#00C2A8] to-[#0B1F3A]",
  },
];

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/login");
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0B1F3A] via-[#0d2847] to-[#00C2A8] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#00C2A8] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#00C2A8] rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="text-white/80">
          {currentSlide + 1} / {slides.length}
        </div>
        {currentSlide < slides.length - 1 && (
          <button
            onClick={handleSkip}
            className="text-white/80 hover:text-white transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center max-w-md"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-32 h-32 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-2xl`}
            >
              <Icon className="w-16 h-16 text-white" />
            </motion.div>

            {/* Title */}
            <h1 className="text-white mb-4 text-center">{slide.title}</h1>

            {/* Description */}
            <p className="text-white/80 text-center leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div className="relative z-10 flex justify-center gap-2 mb-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Next Button */}
      <div className="relative z-10 p-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full bg-white text-[#0B1F3A] rounded-xl py-4 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <span>{currentSlide < slides.length - 1 ? "Next" : "Get Started"}</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
