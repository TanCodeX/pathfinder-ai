"use client";

import { motion } from "framer-motion";

export default function FloatingElement({
  children,
  className = "",
  delay = 0,
  duration = 5,
  y = 20,
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{ y: [0, -y, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
