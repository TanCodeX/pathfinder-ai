"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ghost, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-background">
      
      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="relative h-full w-full rounded-[2.5rem] glass border border-white/20 flex items-center justify-center text-primary shadow-2xl">
            <Ghost className="h-16 w-16 animate-float" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-8xl font-black tracking-tighter text-foreground opacity-20">404</h1>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Lost in the Matrix?</h2>
            <p className="text-muted-foreground leading-relaxed font-medium">
              The neural pathway you requested is currently unavailable or has been archived by the system.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button 
            asChild
            className="w-full sm:w-auto h-14 rounded-2xl px-8 font-bold gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            <Link href="/">
              <Home className="h-5 w-5" />
              Return to Base
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto h-14 rounded-2xl px-8 font-bold gap-2 border-border bg-background/50 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous Node
          </Button>
        </div>
      </div>

      {/* Decorative Text */}
      <div className="absolute bottom-10 left-10 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground opacity-20 vertical-text hidden lg:block">
        PathFinder Intelligent Systems
      </div>
    </div>
  );
}
