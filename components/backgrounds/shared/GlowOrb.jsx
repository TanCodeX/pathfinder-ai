"use client";

import { motion } from "framer-motion";

export default function GlowOrb({
  className = "",
  color = "cyan",
  size = "lg",
  blur = "xl",
  animate = true,
}) {
  const colorMap = {
    cyan: "bg-cyan-500/10",
    violet: "bg-violet-500/10",
    purple: "bg-purple-500/10",
    blue: "bg-blue-500/10",
    emerald: "bg-emerald-500/10",
    pink: "bg-pink-500/10",
    orange: "bg-orange-500/10",
    primary: "bg-primary/10",
  };

  const sizeMap = {
    sm: "h-48 w-48",
    md: "h-64 w-64",
    lg: "h-[32rem] w-[32rem]",
    xl: "h-[42rem] w-[42rem]",
  };

  const blurMap = {
    sm: "blur-[60px]",
    md: "blur-[100px]",
    lg: "blur-[130px]",
    xl: "blur-[140px]",
  };

  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${colorMap[color] || colorMap.cyan} ${sizeMap[size] || sizeMap.lg} ${blurMap[blur] || blurMap.xl} ${className}`}
      {...(animate
        ? {
            animate: {
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.6, 0.4],
            },
            transition: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }
        : {})}
    />
  );
}
