"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl"
        >
          <Sparkles className="h-8 w-8" />
        </motion.div>
        
        {/* Orbiting Blobs */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 -m-4"
        >
          <div className="h-3 w-3 rounded-full bg-primary/40 blur-sm absolute top-0 left-1/2" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 -m-6"
        >
          <div className="h-2 w-2 rounded-full bg-purple-500/40 blur-sm absolute bottom-0 right-1/2" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 space-y-2 text-center"
      >
        <p className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Initializing</p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Neural Career Engine</p>
      </motion.div>
    </div>
  );
}
