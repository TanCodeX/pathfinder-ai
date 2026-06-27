"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";

// ─── Pure evaluation function (also exported for unit tests) ───────────────
/**
 * Evaluates password strength against 5 criteria.
 * @param {string} password
 * @returns {{ score: number, criteria: Record<string,boolean>, label: string, color: string }}
 */
export function evaluatePassword(password) {
  const criteria = {
    length:  password.length >= 8,
    upper:   /[A-Z]/.test(password),
    lower:   /[a-z]/.test(password),
    number:  /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(criteria).filter(Boolean).length;

  const levels = [
    { label: "Too short",  color: "#ef4444" },   // 0
    { label: "Very weak",  color: "#f97316" },   // 1
    { label: "Weak",       color: "#eab308" },   // 2
    { label: "Fair",       color: "#84cc16" },   // 3
    { label: "Strong",     color: "#22c55e" },   // 4
    { label: "Very strong",color: "#10b981" },   // 5
  ];

  return { score, criteria, ...levels[score] };
}

// ─── Checklist item ────────────────────────────────────────────────────────
function Requirement({ met, text }) {
  return (
    <li
      className={`flex items-center gap-2 text-xs transition-all duration-300 ${
        met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
      }`}
    >
      <span
        className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-300 ${
          met
            ? "bg-emerald-500 border-emerald-500 text-white scale-110"
            : "border-border bg-muted/50"
        }`}
      >
        {met ? (
          <Check className="w-2.5 h-2.5" strokeWidth={3} />
        ) : (
          <X className="w-2.5 h-2.5 text-muted-foreground/50" strokeWidth={2.5} />
        )}
      </span>
      {text}
    </li>
  );
}

// ─── Strength bar segment ──────────────────────────────────────────────────
function StrengthSegment({ filled, color }) {
  return (
    <div
      className="h-1.5 rounded-full flex-1 transition-all duration-500 ease-out"
      style={{
        backgroundColor: filled ? color : undefined,
      }}
      data-filled={filled}
      // Use CSS custom property trick so Tailwind doesn't purge the class
      // We fall back to a muted background when not filled
      {...(!filled && { className: "h-1.5 rounded-full flex-1 transition-all duration-500 ease-out bg-muted" })}
    />
  );
}

// ─── Main exported component ───────────────────────────────────────────────
/**
 * Renders a password strength indicator below a password input.
 * @param {{ password: string }} props
 */
export function PasswordStrength({ password }) {
  const { score, criteria, label, color } = useMemo(
    () => evaluatePassword(password),
    [password]
  );

  if (!password) return null;

  const requirements = [
    { key: "length",  met: criteria.length,  text: "At least 8 characters" },
    { key: "upper",   met: criteria.upper,   text: "One uppercase letter (A–Z)" },
    { key: "lower",   met: criteria.lower,   text: "One lowercase letter (a–z)" },
    { key: "number",  met: criteria.number,  text: "One number (0–9)" },
    { key: "special", met: criteria.special, text: "One special character (!@#…)" },
  ];

  return (
    <div
      className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300"
      role="status"
      aria-live="polite"
      aria-label={`Password strength: ${label}`}
    >
      {/* ── Strength bar ── */}
      <div className="space-y-1.5">
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <StrengthSegment key={i} filled={i < score} color={color} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span
            className="text-xs font-semibold transition-colors duration-300"
            style={{ color }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* ── Requirements checklist ── */}
      <ul className="grid grid-cols-1 gap-1.5 p-3 rounded-lg bg-muted/40 border border-border/50">
        {requirements.map(({ key, met, text }) => (
          <Requirement key={key} met={met} text={text} />
        ))}
      </ul>
    </div>
  );
}
