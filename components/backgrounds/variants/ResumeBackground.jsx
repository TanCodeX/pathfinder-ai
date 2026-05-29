"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ResumeBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-5%] left-[-5%] h-[25rem] w-[25rem] rounded-full bg-blue-500/8 blur-[100px]"
      />
      <motion.div
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-[-5%] right-[-5%] h-[20rem] w-[20rem] rounded-full bg-emerald-500/8 blur-[90px]"
      />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.03) 50%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
    </div>
  );
}
