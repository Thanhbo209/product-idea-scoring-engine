"use client";

import { useEffect, useRef } from "react";

interface ScoreCardProps {
  clarityScore: number;
  marketScore: number;
  riskScore: number;
  totalScore: number;
  feedback?: string | null;
  compact?: boolean;
}

interface BarProps {
  label: string;
  value: number;
  max?: number;
  colorClass: string;
  delay?: number;
}

function ScoreBar({ label, value, max = 10, colorClass, delay = 0 }: BarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-foreground">
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{
            width: `${pct}%`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

// Animated SVG arc ring for the total score
function ScoreRing({ value, max = 10 }: { value: number; max?: number }) {
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  // Color stops based on score
  const ringColor = value >= 7 ? "#22c55e" : value >= 5 ? "#f59e0b" : "#ef4444";

  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Start at 0 then animate to target
    el.style.strokeDashoffset = String(circumference);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "stroke-dashoffset 900ms cubic-bezier(.4,0,.2,1)";
        el.style.strokeDashoffset = String(offset);
      });
    });
  }, [value, circumference, offset]);

  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg width="80" height="80" className="-rotate-90">
        {/* Track */}
        <circle
          cx="40"
          cy="40"
          r={normalizedRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-secondary"
        />
        {/* Progress */}
        <circle
          ref={ref}
          cx="40"
          cy="40"
          r={normalizedRadius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums text-foreground leading-none">
          {value.toFixed(1)}
        </span>
        <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
          / 10
        </span>
      </div>
    </div>
  );
}

export function ScoreCard({
  clarityScore,
  marketScore,
  riskScore,
  totalScore,
  feedback,
  compact = false,
}: ScoreCardProps) {
  if (compact) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-4">
          <ScoreRing value={totalScore} />
          <div className="flex-1 space-y-2.5">
            <ScoreBar
              label="Clarity"
              value={clarityScore}
              colorClass="bg-blue-500"
              delay={0}
            />
            <ScoreBar
              label="Market fit"
              value={marketScore}
              colorClass="bg-violet-500"
              delay={100}
            />
            <ScoreBar
              label="Risk"
              value={riskScore}
              colorClass="bg-amber-500"
              delay={200}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Validation Score
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Ring + bars */}
        <div className="flex items-center gap-5">
          <ScoreRing value={totalScore} />
          <div className="flex-1 space-y-3">
            <ScoreBar
              label="Clarity"
              value={clarityScore}
              colorClass="bg-blue-500"
              delay={0}
            />
            <ScoreBar
              label="Market fit"
              value={marketScore}
              colorClass="bg-violet-500"
              delay={120}
            />
            <ScoreBar
              label="Risk"
              value={riskScore}
              colorClass="bg-amber-500"
              delay={240}
            />
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="bg-secondary/40 rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
