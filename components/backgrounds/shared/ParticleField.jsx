"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export default function ParticleField({
  className = "",
  count = 20,
  color = "bg-cyan-400",
  minSize = 2,
  maxSize = 4,
  spread = "full",
  glowColor = "rgba(34,211,238,0.9)",
}) {
  const particles = useMemo(() => {
    const result = [];
    const area = spread === "full" ? 0.7 : 0.4;
    for (let i = 0; i < count; i++) {
      result.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: minSize + Math.random() * (maxSize - minSize),
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
        yMove: 10 + Math.random() * 25,
      });
    }
    return result;
  }, [count, minSize, maxSize, spread]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${color}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 ${p.size * 8}px ${glowColor}`,
          }}
          animate={{
            y: [0, -p.yMove, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
