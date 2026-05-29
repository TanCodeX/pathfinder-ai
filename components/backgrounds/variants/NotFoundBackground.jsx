"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const GLITCH_PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  angle: Math.random() * 360,
  speed: 20 + Math.random() * 40,
  delay: Math.random() * 2,
}));

export default function NotFoundBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <motion.div
        animate={{ opacity: [0.1, 0.18, 0.1], scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[30rem] rounded-full bg-destructive/10 blur-[130px]"
      />
      <motion.div
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[15%] h-[12rem] w-[12rem] rounded-full bg-orange-500/10 blur-[70px]"
      />
      <motion.div
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] left-[15%] h-[12rem] w-[12rem] rounded-full bg-purple-500/10 blur-[70px]"
      />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
        }}
      />
      {GLITCH_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute bg-destructive/20 rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            x: [0, Math.cos(p.angle) * p.speed, 0],
            y: [0, Math.sin(p.angle) * p.speed, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
          transform: "skewX(-20deg)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
      />
    </div>
  );
}
