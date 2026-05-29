"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function InterviewBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[38rem] w-[38rem] rounded-full bg-primary/8 blur-[140px]"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[30rem] rounded-full border border-primary/5 opacity-30"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[22rem] w-[22rem] rounded-full border border-cyan-500/5 opacity-20"
      />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          background: "radial-gradient(ellipse at bottom, rgba(6,182,212,0.08) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
    </div>
  );
}
