"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LandingBackground from "./variants/LandingBackground";
import DashboardBackground from "./variants/DashboardBackground";
import ChatBackground from "./variants/ChatBackground";
import ResumeBackground from "./variants/ResumeBackground";
import InterviewBackground from "./variants/InterviewBackground";
import AnalyticsBackground from "./variants/AnalyticsBackground";
import SettingsBackground from "./variants/SettingsBackground";
import AuthBackground from "./variants/AuthBackground";
import NotFoundBackground from "./variants/NotFoundBackground";

function getBackgroundForPath(pathname) {
  if (pathname === "/") return "landing";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/onboarding")) return "auth";
  if (pathname.startsWith("/ai-assistant")) return "chat";
  if (pathname.startsWith("/resume")) return "resume";
  if (pathname.startsWith("/ai-cover-letter")) return "resume";
  if (pathname.startsWith("/interview")) return "interview";
  if (pathname.startsWith("/ats-analyzer")) return "analytics";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) return "auth";
  return "not-found";
}

const BACKGROUND_MAP = {
  landing: LandingBackground,
  dashboard: DashboardBackground,
  chat: ChatBackground,
  resume: ResumeBackground,
  interview: InterviewBackground,
  analytics: AnalyticsBackground,
  settings: SettingsBackground,
  auth: AuthBackground,
  "not-found": NotFoundBackground,
};

export default function BackgroundEngine() {
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!hasMounted) return null;

  const bgKey = getBackgroundForPath(pathname);
  const BackgroundComponent = BACKGROUND_MAP[bgKey] || NotFoundBackground;

  if (prefersReducedMotion) {
    return <div className="fixed inset-0 z-[-1] bg-background pointer-events-none" />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={bgKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-[-1]"
      >
        <BackgroundComponent />
      </motion.div>
    </AnimatePresence>
  );
}
