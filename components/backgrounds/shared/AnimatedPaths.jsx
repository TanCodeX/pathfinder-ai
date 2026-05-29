"use client";

import { motion } from "framer-motion";

const GRADIENTS = {
  career: (
    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
      <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
    </linearGradient>
  ),
};

export default function AnimatedPaths({
  className = "",
  gradientId = "pathGradient",
  paths = [],
}) {
  const defaultPaths = [
    {
      d: "M 0 300 Q 400 100 800 300 T 1600 300",
      strokeWidth: "2",
      duration: 6,
      repeatType: "loop",
    },
    {
      d: "M 0 500 Q 500 250 1000 500 T 1800 500",
      strokeWidth: "1.5",
      duration: 8,
      repeatType: "loop",
    },
  ];

  const pathData = paths.length > 0 ? paths : defaultPaths;

  return (
    <svg
      className={`absolute inset-0 h-full w-full opacity-20 pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {GRADIENTS[gradientId] || GRADIENTS.career}
      {pathData.map((p, i) => (
        <motion.path
          key={i}
          d={p.d}
          stroke={`url(#${gradientId})`}
          strokeWidth={p.strokeWidth || "2"}
          fill="transparent"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: p.duration || 6,
            repeat: Infinity,
            ease: p.ease || "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}
