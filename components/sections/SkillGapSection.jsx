"use client";

import { motion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/motion";

const skills = [
  { name: "Technical", current: 85, target: 95 },
  { name: "Leadership", current: 65, target: 85 },
  { name: "Communication", current: 78, target: 90 },
  { name: "Strategy", current: 60, target: 80 },
  { name: "Innovation", current: 72, target: 88 },
];

export function SkillGapSection() {
  const maxScore = 100;
  const center = 80;
  const radius = 60;

  const polarToCart = (angle, r) => ({
    x: center + r * Math.cos(angle - Math.PI / 2),
    y: center + r * Math.sin(angle - Math.PI / 2),
  });

  const angleStep = (2 * Math.PI) / skills.length;

  const currentPoints = skills.map((s, i) =>
    polarToCart(i * angleStep, (s.current / maxScore) * radius)
  );
  const targetPoints = skills.map((s, i) =>
    polarToCart(i * angleStep, (s.target / maxScore) * radius)
  );

  const currentPath = currentPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`)
    .join(" ") + "Z";
  const targetPath = targetPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`)
    .join(" ") + "Z";

  return (
    <section id="skill-gap" className="relative py-32 md:py-48 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <FadeUp className="max-w-3xl mx-auto text-center mb-20 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary">
            Skill Analysis
          </span>
          <h2 className="text-3xl md:text-6xl font-bold tracking-tight text-foreground">
            Close Your{" "}
            <span className="text-gradient-primary">Skill Gaps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Understand where you stand and what you need to reach your career goals.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-full max-w-xs h-auto">
              {/* Target ring */}
              <circle cx={center} cy={center} r={radius} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={center} cy={center} r={radius * 0.75} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="oklch(var(--border) / 0.1)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Axis lines */}
              {skills.map((_, i) => {
                const p = polarToCart(i * angleStep, radius);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={p.x}
                    y2={p.y}
                    stroke="oklch(var(--border) / 0.15)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Target area */}
              <motion.path
                d={targetPath}
                fill="#3b82f610"
                stroke="#3b82f680"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              />

              {/* Current area */}
              <motion.path
                d={currentPath}
                fill="#3b82f620"
                stroke="#3b82f6"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Labels */}
              {skills.map((s, i) => {
                const p = polarToCart(i * angleStep, radius + 15);
                return (
                  <text
                    key={s.name}
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#94a3b8"
                    fontSize="6"
                    fontWeight="700"
                  >
                    {s.name}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="space-y-5">
            <StaggerContainer>
              {skills.map((s) => {
                const gap = s.target - s.current;
                return (
                  <StaggerItem key={s.name}>
                    <div className="glass rounded-xl p-5 border border-border/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-foreground">{s.name}</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground">Current: {s.current}%</span>
                          <span className="text-primary">Target: {s.target}%</span>
                          <span className={`font-bold ${gap > 0 ? "text-orange-500" : "text-emerald-500"}`}>
                            Gap: {gap > 0 ? `+${gap}` : gap}%
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2.5 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div
                          className="absolute inset-0 rounded-full bg-muted/20"
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${s.target}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        />
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 relative z-10"
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${s.current}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            <FadeUp delay={0.4}>
              <div className="flex items-center gap-4 justify-center pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-primary" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-primary/30 border border-dashed border-primary/50" />
                  <span>Target</span>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
