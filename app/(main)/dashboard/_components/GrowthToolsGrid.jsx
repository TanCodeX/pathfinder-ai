"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ScanSearch, Mic, FileText, Mail, Bot, Briefcase, ChevronRight } from "lucide-react";

const TOOLS = [
  {
    name: "ATS Analyzer",
    desc: "Score resume vs JD",
    icon: ScanSearch,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    href: "/ats-analyzer",
  },
  {
    name: "Mock Interview",
    desc: "AI-powered practice",
    icon: Mic,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    href: "/interview/mock",
  },
  {
    name: "AI Assistant",
    desc: "Personal career coach",
    icon: Bot,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    href: "/ai-assistant",
  },
  {
    name: "Resume Builder",
    desc: "Professional templates",
    icon: FileText,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    href: "/resume",
  },
  {
    name: "Cover Letter",
    desc: "Tailored for success",
    icon: Mail,
    color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    href: "/ai-cover-letter",
  },
  {
    name: "Interview Prep",
    desc: "Reviews and insights",
    icon: Briefcase,
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    href: "/interview",
  },
];

export default function GrowthToolsGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Growth Tools</h3>
        <div className="h-px bg-border flex-grow" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Link href={tool.href} className="block h-full">
                <div className="relative h-full p-5 rounded-3xl border border-border bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 transition-transform group-hover:scale-110 duration-300 ${tool.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground flex items-center gap-1">
                      {tool.name}
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                  </div>

                  {/* Hover background effect */}
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-20 h-20 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
