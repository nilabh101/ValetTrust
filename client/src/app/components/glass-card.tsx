import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  const Component = motion.div;

  return (
    <Component
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "backdrop-blur-xl bg-white/60 dark:bg-white/5",
        "border border-white/20 dark:border-white/10",
        "rounded-xl shadow-lg shadow-black/5 dark:shadow-black/20",
        hover && "cursor-pointer transition-shadow hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
        className
      )}
    >
      {children}
    </Component>
  );
}
