"use client";

import { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

export default function InteractiveBackground() {
  const [hasMounted, setHasMounted] = useState(false);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll();

  // Smooth motion transforms
  const rotateLeft = useTransform(scrollYProgress, [0, 1], [0, 35]);
  const rotateRight = useTransform(scrollYProgress, [0, 1], [0, -45]);

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5],
    [0.45, 0.15]
  );

  const yFloat = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -120]
  );

  const smoothY = useSpring(yFloat, {
    stiffness: 80,
    damping: 25,
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[-1] overflow-hidden bg-[#030712] pointer-events-none"
    >
      {/* ===== Main Career Glow ===== */}
      <motion.div
        style={{
          rotate: rotateLeft,
          opacity,
          y: smoothY,
        }}
        className="
          absolute 
          top-[-15%] 
          left-[-10%]
          h-[42rem]
          w-[42rem]
          rounded-full
          bg-cyan-500/10
          blur-[140px]
        "
      />

      <motion.div
        style={{
          rotate: rotateRight,
          opacity,
        }}
        className="
          absolute 
          bottom-[-20%]
          right-[-10%]
          h-[35rem]
          w-[35rem]
          rounded-full
          bg-violet-500/10
          blur-[130px]
        "
      />

      {/* ===== AI Career Grid ===== */}
      <div
        className="
          absolute inset-0
          opacity-[0.08]
          [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]
          [background-size:80px_80px]
          [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]
        "
      />

      {/* ===== Animated Career Paths ===== */}
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M 0 300 Q 400 100 800 300 T 1600 300"
          stroke="url(#careerGradient)"
          strokeWidth="2"
          fill="transparent"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.path
          d="M 0 500 Q 500 250 1000 500 T 1800 500"
          stroke="url(#careerGradient)"
          strokeWidth="1.5"
          fill="transparent"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <defs>
          <linearGradient
            id="careerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* ===== Floating Skill Nodes ===== */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-[22%]
          left-[18%]
          h-3
          w-3
          rounded-full
          bg-cyan-400
          shadow-[0_0_30px_rgba(34,211,238,0.9)]
        "
      />

      <motion.div
        animate={{
          y: [0, 18, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-[28%]
          right-[20%]
          h-4
          w-4
          rounded-full
          bg-violet-400
          shadow-[0_0_35px_rgba(167,139,250,0.9)]
        "
      />

      {/* ===== Career Center Glow ===== */}
      <div
        className="
          absolute
          left-1/2
          top-1/2
          h-[32rem]
          w-[32rem]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-gradient-radial
          from-cyan-500/10
          via-violet-500/5
          to-transparent
          blur-3xl
          opacity-70
        "
      />

      {/* ===== Noise Texture ===== */}
      <div
        className="
          absolute inset-0
          opacity-[0.03]
          mix-blend-soft-light
          bg-[url('https://grainy-gradients.vercel.app/noise.svg')]
        "
      />
    </div>
  );
}