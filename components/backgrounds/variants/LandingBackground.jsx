"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import GridOverlay from "../shared/GridOverlay";
import NoiseTexture from "../shared/NoiseTexture";
import AnimatedPaths from "../shared/AnimatedPaths";
import ParticleField from "../shared/ParticleField";
import FloatingElement from "../shared/FloatingElement";
import CenterGlow from "../shared/CenterGlow";

export default function LandingBackground() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);

  const { scrollYProgress } = useScroll();
  const rotateLeft = useTransform(scrollYProgress, [0, 1], [0, 35]);
  const rotateRight = useTransform(scrollYProgress, [0, 1], [0, -45]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.45, 0.15]);
  const yFloat = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const smoothY = useSpring(yFloat, { stiffness: 80, damping: 25 });

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div ref={ref} className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <motion.div
        style={{ rotate: rotateLeft, opacity, y: smoothY }}
        className="absolute top-[-15%] left-[-10%] h-[42rem] w-[42rem] rounded-full bg-cyan-500/10 blur-[140px]"
      />
      <motion.div
        style={{ rotate: rotateRight, opacity }}
        className="absolute bottom-[-20%] right-[-10%] h-[35rem] w-[35rem] rounded-full bg-violet-500/10 blur-[130px]"
      />

      <GridOverlay opacity="opacity-[0.08]" />
      <AnimatedPaths />
      <ParticleField count={20} color="bg-cyan-400" glowColor="rgba(34,211,238,0.9)" />

      <FloatingElement className="top-[22%] left-[18%]" y={20} duration={5}>
        <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.9)]" />
      </FloatingElement>

      <FloatingElement className="bottom-[28%] right-[20%]" y={18} duration={6} delay={1}>
        <div className="h-4 w-4 rounded-full bg-violet-400 shadow-[0_0_35px_rgba(167,139,250,0.9)]" />
      </FloatingElement>

      <CenterGlow />
      <NoiseTexture />
    </div>
  );
}
