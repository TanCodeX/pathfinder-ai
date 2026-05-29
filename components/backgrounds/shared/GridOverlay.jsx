"use client";

export default function GridOverlay({
  className = "",
  opacity = "opacity-[0.06]",
  size = "80px",
  mask = true,
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${opacity} ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: `${size} ${size}`,
        ...(mask
          ? {
              WebkitMaskImage:
                "radial-gradient(circle at center, black, transparent 85%)",
              maskImage:
                "radial-gradient(circle at center, black, transparent 85%)",
            }
          : {}),
      }}
    />
  );
}
