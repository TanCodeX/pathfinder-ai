"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Target,
  MapPin,
  FileText,
  Mic,
  LayoutDashboard,
} from "lucide-react";
import { useMotionValueEvent } from "framer-motion";
const stages = [
  {
    id: "goal",
    headline: "What's your career goal?",
    subheadline:
      "Tell us where you want to go, and we'll build a path to get you there.",
    icon: Target,
    stageNum: "01",
  },
  {
    id: "roadmap",
    headline: "AI generates your roadmap",
    subheadline:
      "A personalized career progression from student to industry leader.",
    icon: MapPin,
    stageNum: "02",
  },
  {
    id: "resume",
    headline: "Premium ATS-ready resume",
    subheadline:
      "Built for the modern job market. Every keyword, every section, optimized.",
    icon: FileText,
    stageNum: "03",
  },
  {
    id: "interview",
    headline: "AI interview coach",
    subheadline:
      "Practice with purpose. Get real-time feedback. Land the offer.",
    icon: Mic,
    stageNum: "04",
  },
  {
    id: "dashboard",
    headline: "Your complete career hub",
    subheadline:
      "Everything you need to accelerate your career, unified in one place.",
    icon: LayoutDashboard,
    stageNum: "05",
  },
];

function GoalStage({ progress }) {
  const [text, setText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Become a Software Engineer at Google";

  useEffect(() => {
    const len = Math.min(
      Math.floor(progress * fullText.length * 2),
      fullText.length,
    );
    setText(fullText.slice(0, len));
  }, [progress]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: progress > 0 ? 1 : 0, y: progress > 0 ? 0 : 40 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-8 max-w-3xl"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Stage 01
          </span>
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          <span className="text-[10px] font-medium text-muted-foreground">
            Goal Setting
          </span>
        </div>

        <div className="space-y-4">
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
            {stages[0].headline}
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            {stages[0].subheadline}
          </p>
        </div>

        <div className="relative mx-auto max-w-lg w-full">
          <div className="glass rounded-2xl p-6 text-left border border-border/50 shadow-xl">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse" />
              Your Career Goal
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-medium text-foreground">
                {text || (
                  <span className="text-muted-foreground/60">
                    Start typing your goal...
                  </span>
                )}
                {showCursor && (
                  <span className="inline-block w-[2px] h-[1.1em] bg-primary ml-0.5 align-middle animate-pulse" />
                )}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>AI will personalize everything</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RoadmapStage({ progress }) {
  const milestones = [
    { label: "Student", desc: "Foundation", done: progress > 0.1 },
    { label: "Intern", desc: "Experience", done: progress > 0.25 },
    { label: "Junior Dev", desc: "Building", done: progress > 0.4 },
    { label: "Engineer", desc: "Shipping", done: progress > 0.6 },
    { label: "Senior", desc: "Leading", done: progress > 0.8 },
  ];

  const drawProgress = Math.min(Math.max((progress - 0.1) / 0.8, 0), 1);
  const nodePositions = milestones.map((_, i) => ({
    x: i % 2 === 0 ? 200 : i === 1 ? 100 : 300,
    y: 50 + i * 60,
  }));

  const pathData = nodePositions
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: progress > 0.1 ? 1 : 0,
          y: progress > 0.1 ? 0 : 40,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-8 max-w-3xl w-full"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Stage 02
          </span>
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          <span className="text-[10px] font-medium text-muted-foreground">
            Career Roadmap
          </span>
        </div>

        <div className="space-y-4">
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
            {stages[1].headline}
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            {stages[1].subheadline}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <svg
            className="w-full h-72 md:h-80"
            viewBox="0 0 400 340"
            fill="none"
          >
            <defs>
              <linearGradient id="roadmapActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(var(--primary) / 1)" />
                <stop offset="100%" stopColor="oklch(var(--primary) / 0.3)" />
              </linearGradient>
              <filter id="nodeGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d={pathData}
              stroke="oklch(var(--border) / 0.3)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            <path
              d={pathData}
              stroke="url(#roadmapActive)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${drawProgress * 1200} 1200`}
              strokeDashoffset={1200 - drawProgress * 1200}
              style={{
                transition: "stroke-dasharray 0.15s, stroke-dashoffset 0.15s",
              }}
            />

            {milestones.map((m, i) => {
              const pos = nodePositions[i];
              const isActive = m.done;
              return (
                <g key={m.label}>
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill="none"
                      stroke="oklch(var(--primary) / 0.2)"
                      strokeWidth="4"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${pos.x} ${pos.y}`}
                        to={`360 ${pos.x} ${pos.y}`}
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isActive ? 12 : 8}
                    fill={
                      isActive
                        ? "oklch(var(--primary) / 1)"
                        : "oklch(var(--card) / 1)"
                    }
                    stroke={
                      isActive
                        ? "oklch(var(--primary) / 1)"
                        : "oklch(var(--border) / 0.6)"
                    }
                    strokeWidth="2"
                    style={{
                      transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    filter={isActive ? "url(#nodeGlow)" : "none"}
                  />
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="4"
                      fill="oklch(var(--card) / 1)"
                    />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y + 30}
                    textAnchor="middle"
                    fill={
                      isActive
                        ? "oklch(var(--foreground) / 1)"
                        : "oklch(var(--muted-foreground) / 0.55)"
                    }
                    fontSize="11"
                    fontWeight="700"
                    style={{ transition: "fill 0.5s" }}
                  >
                    {m.label}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 44}
                    textAnchor="middle"
                    fill={
                      isActive
                        ? "oklch(var(--muted-foreground) / 0.8)"
                        : "oklch(var(--muted-foreground) / 0.5)"
                    }
                    fontSize="9"
                    style={{ transition: "fill 0.5s" }}
                  >
                    {m.desc}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

function ResumeStage({ progress }) {
  const localProgress = Math.min(Math.max((progress - 0.4) / 0.3, 0), 1);
  const displayScore = Math.min(Math.floor(localProgress * 100), 100);

  const skills = [
    "React",
    "TypeScript",
    "Python",
    "System Design",
    "AWS",
    "Leadership",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 0.4 ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-8 max-w-5xl mx-auto w-full"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Stage 03
          </span>
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          <span className="text-[10px] font-medium text-muted-foreground">
            Resume Generation
          </span>
        </div>

        <div className="space-y-4">
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
            {stages[2].headline}
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            {stages[2].subheadline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3">
            <motion.div
              style={{
                rotateY: localProgress * 15 - 7.5,
                rotateX: localProgress * -8,
                transformStyle: "preserve-3d",
                perspective: "1200px",
              }}
              className="relative mx-auto w-full max-w-sm aspect-[3/4]"
            >
              <div className="w-full h-full glass rounded-2xl border border-border/50 p-6 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-chart-3 to-chart-4" />
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 rounded-full bg-foreground/20" />
                      <div className="h-2 w-20 rounded-full bg-muted/50" />
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full bg-muted/40" />
                    <div className="h-2 w-5/6 rounded-full bg-muted/40" />
                    <div className="h-2 w-4/6 rounded-full bg-muted/40" />
                  </div>
                  <div className="border-t border-border/30 pt-4">
                    <div className="h-2 w-20 rounded-full bg-foreground/15 mb-3" />
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <div
                          key={s}
                          className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border/30 pt-4 space-y-2">
                    <div className="h-2 w-full rounded-full bg-muted/30" />
                    <div className="h-2 w-4/5 rounded-full bg-muted/30" />
                    <div className="h-2 w-3/5 rounded-full bg-muted/30" />
                  </div>
                  <div className="border-t border-border/30 pt-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">
                        ATS Score
                      </span>
                      <span className="font-bold text-primary">
                        {displayScore}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-chart-3 to-chart-4"
                        style={{ width: `${displayScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="md:col-span-2 text-left space-y-4">
            {[
              {
                label: "ATS Score",
                value: `${displayScore}%`,
                color: "from-primary to-chart-3",
                desc: "Optimized for applicant tracking systems",
              },
              {
                label: "Keyword Match",
                value: "96%",
                color: "from-chart-1 to-chart-2",
                desc: "Aligned with target job descriptions",
              },
              {
                label: "Readability",
                value: "A+",
                color: "from-chart-2 to-chart-4",
                desc: "Clear, scannable, professional",
              },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass rounded-xl p-4 border border-border/30"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">
                    {metric.label}
                  </span>
                  <span
                    className={`text-lg font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}
                  >
                    {metric.value}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {metric.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InterviewStage({ progress }) {
  const showFeedback = progress > 0.55;
  const score = Math.min(
    Math.floor(Math.max((progress - 0.5) / 0.3, 0) * 100),
    100,
  );

  const metrics = [
    {
      label: "Clarity",
      value: Math.min(88, Math.floor(score * 0.88)),
      color: "bg-chart-2",
    },
    {
      label: "Structure",
      value: Math.min(76, Math.floor(score * 0.76)),
      color: "bg-chart-1",
    },
    {
      label: "Impact",
      value: Math.min(82, Math.floor(score * 0.82)),
      color: "bg-chart-3",
    },
    {
      label: "Confidence",
      value: Math.min(79, Math.floor(score * 0.79)),
      color: "bg-chart-5",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 0.5 ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-8 max-w-5xl mx-auto w-full"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Stage 04
          </span>
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          <span className="text-[10px] font-medium text-muted-foreground">
            Interview Coach
          </span>
        </div>

        <div className="space-y-4">
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
            {stages[3].headline}
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            {stages[3].subheadline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-5 border border-border/50 text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Live Session
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-chart-2"
                  />
                ))}
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              AI Interviewer
            </p>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-xl bg-primary/10 border border-primary/20"
            >
              <p className="text-sm text-foreground">
                Tell me about a time you led a team through a difficult project.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: progress > 0.52 ? 1 : 0 }}
              className="flex items-center gap-3 p-4"
            >
              <div className="flex gap-0.5 items-end h-8">
                {[1, 2, 3, 4, 3, 5, 2, 4, 3, 2].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-primary/60 rounded-full"
                    animate={{ height: `${h * 8}px` }}
                    transition={{
                      duration: 0.3,
                      delay: i * 0.05,
                      repeat: Infinity,
                      repeatDelay: 0.3,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground animate-pulse">
                Recording response...
              </span>
            </motion.div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <div className="flex-1 h-10 rounded-lg bg-background border border-border/50 px-4 flex items-center">
                <span className="text-xs text-muted-foreground">
                  Type your response...
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass rounded-2xl p-5 border border-border/50 space-y-4"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Live Feedback
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Interview Score
                    </span>
                    <span className="text-2xl font-black text-primary">
                      {score}/100
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3"
                      initial={{ width: "0%" }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  {metrics.map((m) => (
                    <div key={m.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-bold text-foreground">
                          {Math.min(m.value, score)}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${m.color}`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${Math.min(m.value, score)}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Great start! Focus on providing specific examples with
                    measurable outcomes to boost your score.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DashboardStage({ progress }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: progress > 0.75 ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-8 max-w-4xl mx-auto w-full"
      >
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Stage 05
          </span>
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          <span className="text-[10px] font-medium text-muted-foreground">
            Career Dashboard
          </span>
        </div>

        <div className="space-y-4">
          <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
            {stages[4].headline}
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            {stages[4].subheadline}
          </p>
        </div>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your entire career journey powered by AI — from goal to offer.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            {
              label: "Career Roadmap",
              value: "5 Stages",
              color: "from-chart-1 to-chart-1/50",
              icon: "🗺️",
            },
            {
              label: "Resume Score",
              value: "ATS 94%",
              color: "from-chart-2 to-chart-2/50",
              icon: "📄",
            },
            {
              label: "Interview Prep",
              value: "Score 85",
              color: "from-chart-3 to-chart-3/50",
              icon: "🎯",
            },
            {
              label: "Analytics",
              value: "12 Insights",
              color: "from-chart-5 to-chart-5/50",
              icon: "📊",
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass rounded-2xl p-5 border border-border/40 text-center space-y-3 hover:border-primary/30 transition-all duration-300"
            >
              <div
                className={`h-12 w-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
              >
                <span className="text-lg">{item.icon}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {item.label}
              </p>
              <p className="text-xl font-black text-foreground">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function ScrollStory() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);

  const [activeStage, setActiveStage] = useState(0);

  const animationLock = useRef(false);
  const [isScrollStoryActive, setIsScrollStoryActive] = useState(false);


  useEffect(() => {
    if (stickyRef.current) {
      const el = stickyRef.current;
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          setIsScrollStoryActive(entry.isIntersecting);
        },
        { root: null, threshold: 0.65 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }

    return undefined;
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {

      const section = containerRef.current;

      if (!section) return;

      const rect = section.getBoundingClientRect();

      // Only allow wheel-stage scrolling when the ScrollStory section is fully in view
      // (prevents triggering while user is already interacting with next sections)
      const isInsideSection =
        rect.top <= 0 && rect.bottom >= window.innerHeight * 0.95;

      if (!isInsideSection) return;


      if (animationLock.current) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0) {
        if (activeStage < 4) {
          e.preventDefault();

          animationLock.current = true;

          setActiveStage((prev) => prev + 1);

          setTimeout(() => {
            animationLock.current = false;
          }, 600);
        }
      } else {
        if (activeStage > 0) {
          e.preventDefault();

          animationLock.current = true;

          setActiveStage((prev) => prev - 1);

          setTimeout(() => {
            animationLock.current = false;
          }, 600);
        }
      }
    };

    const handleVisibilityChange = () => {
      animationLock.current = false;
    };

    window.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("wheel", handleWheel);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeStage]);

  return (
    <section id="scroll-story" className="relative h-screen">
      <div ref={containerRef} className="relative h-[500vh]">
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none z-10" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={() => {
                animationLock.current = false;
              }}
              className="relative z-20 w-full"
            >
              {activeStage === 0 && <GoalStage progress={0.5} />}
              {activeStage === 1 && <RoadmapStage progress={0.4} />}
              {activeStage === 2 && <ResumeStage progress={0.65} />}
              {activeStage === 3 && <InterviewStage progress={0.85} />}
              {activeStage === 4 && <DashboardStage progress={1} />}
            </motion.div>
          </AnimatePresence>

          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
            {stages.map((s, i) => {
              const isActive = activeStage >= i;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center gap-3 group">
                  <div
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                      isActive
                        ? "bg-primary scale-150 shadow-lg shadow-primary/30"
                        : "bg-border"
                    }`}
                  />
                  <div
                    className={`hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                      isActive ? "text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    <Icon
                      className={`h-3 w-3 ${isActive ? "text-primary" : ""}`}
                    />
                    {s.stageNum}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <motion.div
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50"
              style={{ opacity: activeStage === 0 ? 1 : 0 }}
            >
              <span>Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-4 w-4"
              >
                <ArrowRight className="h-4 w-4 rotate-90" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
