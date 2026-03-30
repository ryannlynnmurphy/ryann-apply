"use client";

interface MatchBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export default function MatchBadge({ score, size = "md" }: MatchBadgeProps) {
  const colorClass =
    score >= 75
      ? "border-hzl-green text-hzl-green bg-hzl-green-bg"
      : score >= 50
        ? "border-gold text-gold bg-gold-dim"
        : "border-hzl-red text-hzl-red bg-hzl-red-bg";

  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span
      className={`font-mono font-bold rounded-full border ${colorClass} ${sizeClass} inline-flex items-center`}
    >
      {score}%
    </span>
  );
}
