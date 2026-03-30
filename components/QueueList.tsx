"use client";

import type { Job } from "@/lib/types";
import MatchBadge from "./MatchBadge";

interface QueueListProps {
  jobs: Job[];
  appliedJobIds: Set<string>;
  onSelectJob: (job: Job) => void;
}

const TIER_LABELS: Record<string, { label: string; className: string }> = {
  "full-auto": { label: "Auto", className: "text-hzl-green" },
  "one-click": { label: "1-Click", className: "text-hzl-blue" },
  guided: { label: "Guided", className: "text-hzl-amber" },
};

function isDeadlineSoon(deadline?: string): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

export default function QueueList({ jobs, appliedJobIds, onSelectJob }: QueueListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-charcoal-light text-sm font-mono">
          Queue empty -- Swipe right on jobs in Discovery to add them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => {
        const applied = appliedJobIds.has(job.id);
        const tier = TIER_LABELS[job.applyTier];
        const deadlineSoon = isDeadlineSoon(job.deadline);

        return (
          <button
            key={job.id}
            type="button"
            disabled={applied}
            onClick={() => onSelectJob(job)}
            className={`w-full text-left p-4 rounded border border-border bg-white transition-colors ${
              applied
                ? "opacity-60 cursor-default"
                : "hover:border-gold cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-charcoal truncate">
                    {job.title}
                  </span>
                  {applied && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-hzl-green-bg text-hzl-green border border-hzl-green font-mono">
                      Applied
                    </span>
                  )}
                  {deadlineSoon && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-hzl-red-bg text-hzl-red border border-hzl-red font-mono">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal-light mt-0.5">{job.company}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {tier && (
                  <span className={`text-[10px] font-mono font-bold ${tier.className}`}>
                    {tier.label}
                  </span>
                )}
                <MatchBadge score={job.matchScore} size="sm" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
