"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SettingsBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <motion.div
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full bg-primary/6 blur-[120px]"
      />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 30% 40%, rgba(139,92,246,0.05) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(6,182,212,0.05) 0%, transparent 50%)",
        }}
      />
      <div className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
    </div>
  );
}
