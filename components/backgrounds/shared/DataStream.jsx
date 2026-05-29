"use client";

import { motion } from "framer-motion";

const LINES = [
  { x1: "0%", x2: "100%", y: "20%", delay: 0 },
  { x1: "0%", x2: "100%", y: "40%", delay: 0.5 },
  { x1: "0%", x2: "100%", y: "60%", delay: 1 },
  { x1: "0%", x2: "100%", y: "80%", delay: 1.5 },
];

export default function DataStream({
  className = "",
  color = "rgba(6, 182, 212, 0.06)",
  strokeWidth = 1,
}) {
  return (
    <svg
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {LINES.map((line, i) => (
        <motion.line
          key={i}
          x1={line.x1}
          y1={line.y}
          x2={line.x2}
          y2={line.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            delay: line.delay,
          }}
        />
      ))}
    </svg>
  );
}
