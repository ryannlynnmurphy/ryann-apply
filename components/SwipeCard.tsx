"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";
import MatchBadge from "./MatchBadge";

interface SwipeCardProps {
  job: Job;
  onExpand: () => void;
}

const TIER_LABELS: Record<string, { label: string; cls: string }> = {
  "full-auto": { label: "Auto", cls: "bg-hzl-green-bg text-hzl-green border-hzl-green/30" },
  "one-click": { label: "1-Click", cls: "bg-hzl-blue-bg text-hzl-blue border-hzl-blue/30" },
  guided: { label: "Guided", cls: "bg-hzl-amber-bg text-hzl-amber border-hzl-amber/30" },
};

function CompanyLogo({ company }: { company: string }) {
  const [failed, setFailed] = useState(false);
  const slug = company.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (failed) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gold-dim flex items-center justify-center text-gold font-display font-bold text-lg">
        {company.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${slug}.com`}
      alt={company}
      className="w-10 h-10 rounded-lg object-contain bg-white border border-border"
      onError={() => setFailed(true)}
    />
  );
}

function isDeadlineSoon(deadline?: string): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

export default function SwipeCard({ job, onExpand }: SwipeCardProps) {
  const tier = TIER_LABELS[job.applyTier];

  return (
    <div
      onClick={onExpand}
      className="bg-white border border-border rounded-xl shadow-lg p-6 w-full max-w-sm cursor-pointer select-none"
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <CompanyLogo company={job.company} />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-charcoal leading-tight truncate">
            {job.title}
          </h3>
          <p className="text-xs text-charcoal-light truncate">{job.company}</p>
          {!job.validated && (
            <span className="text-[10px] text-charcoal-light">unverified</span>
          )}
        </div>
        <MatchBadge score={job.matchScore} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.location && (
          <span className="rounded-full text-xs px-2 py-0.5 bg-cream border border-border text-charcoal-light">
            {job.location}
          </span>
        )}
        {job.remote && (
          <span className="rounded-full text-xs px-2 py-0.5 bg-hzl-teal-bg text-hzl-teal border border-hzl-teal/30">
            Remote
          </span>
        )}
        {job.salary && (
          <span className="rounded-full text-xs px-2 py-0.5 bg-cream border border-border text-charcoal-light">
            {job.salary}
          </span>
        )}
        {tier && (
          <span className={`rounded-full text-xs px-2 py-0.5 border ${tier.cls}`}>
            {tier.label}
          </span>
        )}
        {isDeadlineSoon(job.deadline) && (
          <span className="rounded-full text-xs px-2 py-0.5 bg-hzl-amber-bg text-hzl-amber border border-hzl-amber/30">
            Deadline soon
          </span>
        )}
      </div>

      {/* Why You bullets */}
      {job.whyYou.length > 0 && (
        <ul className="space-y-1.5 mb-4">
          {job.whyYou.slice(0, 3).map((bullet, i) => (
            <li
              key={i}
              className="text-sm text-charcoal pl-3 border-l-2 border-gold leading-snug"
            >
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {/* Tap hint */}
      <p className="text-[10px] text-charcoal-light text-center font-mono tracking-wide">
        tap to expand
      </p>
    </div>
  );
}
