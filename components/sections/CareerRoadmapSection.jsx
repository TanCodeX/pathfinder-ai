"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion";

const milestones = [
  {
    label: "Student",
    desc: "Foundation & Learning",
    year: "Year 1",
    x: 80,
    y: 80,
  },
  {
    label: "Intern",
    desc: "Real Experience",
    year: "Year 2",
    x: 180,
    y: 130,
  },
  {
    label: "Junior Dev",
    desc: "Building Products",
    year: "Year 3-4",
    x: 300,
    y: 100,
  },
  {
    label: "Engineer",
    desc: "Shipping at Scale",
    year: "Year 5+",
    x: 420,
    y: 170,
  },
  {
    label: "Senior",
    desc: "Leading Teams",
    year: "Year 8+",
    x: 320,
    y: 280,
  },
  {
    label: "Staff",
    desc: "Organization Impact",
    year: "Year 10+",
    x: 140,
    y: 250,
  },
];

export function CareerRoadmapSection() {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end center"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 0.7], [0, 1]);

  const pathD = `
M 80 80
Q 130 40 180 130
Q 240 200 300 100
Q 360 40 420 170
Q 400 260 320 280
Q 220 330 140 250
`;

  return (
    <section
      ref={ref}
      id="career-roadmap"
      className="relative py-24 md:py-36 overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        <FadeUp className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary">
            Career Roadmap
          </span>

          <h2 className="text-3xl md:text-6xl font-bold tracking-tight">
            Your <span className="text-gradient-primary">Career Journey</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI helps you visualize every step from student to senior leadership.
          </p>
        </FadeUp>

        <div className="max-w-5xl mx-auto">
          <svg viewBox="0 0 500 365" className="w-full h-auto">
            <defs>
              <linearGradient
                id="roadmapGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>

              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Path */}
            <path
              d={pathD}
              fill="none"
              stroke="oklch(var(--border) / 0.35)"
              strokeWidth="3"
              strokeDasharray="8 8"
            />

            {/* Animated Path */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            />
            {milestones.map((m, i) => (
              <g
                key={m.label}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Outer Node */}
                <motion.circle
                  cx={m.x}
                  cy={m.y}
                  r="18"
                  fill="rgba(255,255,255,0.08)"
                  stroke="oklch(var(--primary) / 0.8)"
                  strokeWidth="2"
                  animate={{
                    scale: hovered === i ? 1.2 : 1,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  style={{
                    filter: hovered === i ? "url(#glow)" : "none",
                  }}
                />

                {/* Inner Pulse */}
                <motion.circle
                  cx={m.x}
                  cy={m.y}
                  r="6"
                  fill="oklch(var(--primary) / 1)"
                  animate={{
                    scale: [1, 1.4, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                />

                <foreignObject
                  x={m.x - 55}
                  y={m.y + 28}
                  width="110"
                  height="60"
                >
                  <div className="flex justify-center">
                    <div
                      className={`
        rounded-xl border px-3 py-2 text-center
        bg-card/80 backdrop-blur-md
        border-border/50 shadow-lg
        transition-all duration-300
        ${hovered === i ? "border-primary shadow-primary/20" : ""}
      `}
                    >
                      <p className="text-xs font-bold text-foreground">
                        {m.label}
                      </p>

                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-19 max-w-5xl mx-auto">
          {milestones.map((m) => (
            <StaggerItem key={m.label}>
              <motion.div
                whileHover={{
                  y: -4,
                }}
                className="glass rounded-xl p-4 border border-border/30 text-center transition-all"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                  {m.year}
                </p>

                <p className="text-sm font-semibold text-foreground">
                  {m.label}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
