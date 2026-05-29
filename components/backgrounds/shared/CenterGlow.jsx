"use client";

export default function CenterGlow({ className = "", size = "lg" }) {
  const sizeMap = {
    sm: "h-48 w-48",
    md: "h-64 w-64",
    lg: "h-[32rem] w-[32rem]",
    xl: "h-[40rem] w-[40rem]",
  };

  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none ${sizeMap[size] || sizeMap.lg} bg-gradient-radial from-cyan-500/10 via-violet-500/5 to-transparent blur-3xl opacity-70 ${className}`}
    />
  );
}
