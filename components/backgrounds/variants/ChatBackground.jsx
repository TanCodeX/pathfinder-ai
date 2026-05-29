"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ChatBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.12, 0.18, 0.12],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-[140px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.08, 0.14, 0.08],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/3 right-1/4 h-[20rem] w-[20rem] rounded-full bg-cyan-500/10 blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.06, 0.12, 0.06],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/3 left-1/4 h-[18rem] w-[18rem] rounded-full bg-violet-500/10 blur-[90px]"
      />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(6,182,212,0.1) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
    </div>
  );
}
