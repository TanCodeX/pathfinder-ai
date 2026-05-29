"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AuthBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[35rem] w-[35rem] rounded-full bg-primary/10 blur-[140px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.06, 0.12, 0.06],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-[15%] right-[20%] h-[15rem] w-[15rem] rounded-full bg-cyan-500/8 blur-[80px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.06, 0.12, 0.06],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[15%] left-[20%] h-[15rem] w-[15rem] rounded-full bg-violet-500/8 blur-[80px]"
      />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.04) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
    </div>
  );
}
