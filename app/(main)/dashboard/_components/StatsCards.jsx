"use client";

import { motion } from "framer-motion";
import { FileText, Bot, Trophy, PenTool } from "lucide-react";

export default function StatsCards({ resumes = [], coverLetters = [], interviews = [] }) {
  const safeResumes = Array.isArray(resumes) ? resumes : [];
  const safeCoverLetters = Array.isArray(coverLetters) ? coverLetters : [];
  const safeInterviews = Array.isArray(interviews) ? interviews : [];

  const bestAtsScore = Math.max(
    0,
    ...safeResumes.map((r) => r.atsScore || 0),
    ...safeResumes.map((r) => r.score || 0)
  );

  const getAtsColor = (score) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (score > 0) return "text-red-500 bg-red-500/10 border-red-500/20";
    return "text-muted-foreground bg-muted/20 border-border";
  };

  const stats = [
    { 
      label: "Resumes", 
      value: safeResumes.length, 
      icon: FileText,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    { 
      label: "Interviews", 
      value: safeInterviews.length, 
      icon: Bot,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
    },
    { 
      label: "Top ATS", 
      value: bestAtsScore > 0 ? `${bestAtsScore}%` : "0%",
      icon: Trophy,
      color: getAtsColor(bestAtsScore)
    },
    { 
      label: "Letters", 
      value: safeCoverLetters.length, 
      icon: PenTool,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative z-10 flex flex-col gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </motion.div>
        );
      })}
    </div>
  );
}
