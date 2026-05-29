"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BARS = [
  { height: "30%", delay: 0 },
  { height: "55%", delay: 0.2 },
  { height: "40%", delay: 0.4 },
  { height: "70%", delay: 0.6 },
  { height: "50%", delay: 0.8 },
  { height: "80%", delay: 1.0 },
  { height: "45%", delay: 1.2 },
  { height: "65%", delay: 1.4 },
  { height: "35%", delay: 1.6 },
  { height: "60%", delay: 1.8 },
  { height: "75%", delay: 2.0 },
  { height: "40%", delay: 2.2 },
];

export default function AnalyticsBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <motion.div
        animate={{ opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-5%] right-[-5%] h-[30rem] w-[30rem] rounded-full bg-primary/8 blur-[120px]"
      />
      <motion.div
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] left-[-5%] h-[25rem] w-[25rem] rounded-full bg-cyan-500/8 blur-[100px]"
      />
      <div className="absolute bottom-0 left-0 right-0 h-[40%] flex items-end justify-center gap-3 px-10 opacity-[0.04]">
        {BARS.map((bar, i) => (
          <motion.div
            key={i}
            className="w-3 bg-primary rounded-t-sm"
            style={{ height: bar.height }}
            animate={{ height: [bar.height, "20%", bar.height] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bar.delay,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          background: "linear-gradient(0deg, transparent 0%, rgba(6,182,212,0.03) 50%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
    </div>
  );
}
