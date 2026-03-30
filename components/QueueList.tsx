"use client";

import { useState, useCallback } from "react";
import type { Job, Profile } from "@/lib/types";
import MatchBadge from "./MatchBadge";
import CoverLetterEditor from "./CoverLetterEditor";

interface QueueListProps {
  jobs: Job[];
  profile: Profile;
  appliedJobIds: Set<string>;
  onSelectJob: (job: Job) => void;
  onUpdateCoverLetter: (jobId: string, coverLetter: string) => void;
  onApplyNow: (job: Job) => void;
}

const TIER_LABELS: Record<string, { label: string; className: string }> = {
  "full-auto": { label: "Auto", className: "bg-hzl-green-bg text-hzl-green border-hzl-green" },
  "one-click": { label: "1-Click", className: "bg-hzl-blue/10 text-hzl-blue border-hzl-blue" },
  guided: { label: "Guided", className: "bg-gold-dim text-gold border-gold" },
};

function isDeadlineSoon(deadline?: string): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

function BriefingCard({
  job,
  profile,
  applied,
  onCustomize,
  onUpdateCoverLetter,
  onApplyNow,
}: {
  job: Job;
  profile: Profile;
  applied: boolean;
  onCustomize: () => void;
  onUpdateCoverLetter: (coverLetter: string) => void;
  onApplyNow: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const tier = TIER_LABELS[job.applyTier];
  const deadlineSoon = isDeadlineSoon(job.deadline);
  const coverLetter = job.generatedMaterials?.coverLetter || "";

  const handleCoverLetterChange = useCallback(
    (value: string) => {
      onUpdateCoverLetter(value);
    },
    [onUpdateCoverLetter]
  );

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-cream-dark flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-charcoal">
              {job.company.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-charcoal leading-tight">
              {job.title}
            </h3>
            <p className="text-sm text-charcoal-light">{job.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
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
          {tier && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono font-bold ${tier.className}`}
            >
              {tier.label}
            </span>
          )}
          <MatchBadge score={job.matchScore} />
        </div>
      </div>

      {/* Application Preview */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-3">
          Your Application
        </h4>

        {/* Profile fields summary */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
          <div>
            <span className="text-xs text-charcoal-light">Name</span>
            <p className="text-sm text-charcoal">{profile.name}</p>
          </div>
          <div>
            <span className="text-xs text-charcoal-light">Email</span>
            <p className="text-sm text-charcoal">{profile.email}</p>
          </div>
          <div>
            <span className="text-xs text-charcoal-light">LinkedIn</span>
            <p className="text-sm text-charcoal truncate">{profile.linkedin || "--"}</p>
          </div>
          <div>
            <span className="text-xs text-charcoal-light">Website</span>
            <p className="text-sm text-charcoal truncate">{profile.website || "--"}</p>
          </div>
        </div>

        {/* Cover letter */}
        {coverLetter ? (
          expanded ? (
            <div className="space-y-2">
              <CoverLetterEditor
                value={coverLetter}
                onChange={handleCoverLetterChange}
              />
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-xs text-charcoal-light hover:text-gold transition-colors"
              >
                collapse
              </button>
            </div>
          ) : (
            <div
              className="bg-cream-dark rounded p-4 max-h-64 overflow-y-auto cursor-pointer"
              onClick={() => setExpanded(true)}
            >
              <p className="text-xs text-charcoal-light uppercase tracking-wide mb-1.5">
                Cover Letter
              </p>
              <p className="text-sm leading-relaxed text-charcoal whitespace-pre-wrap">
                {coverLetter}
              </p>
            </div>
          )
        ) : (
          <div className="bg-cream-dark rounded p-4">
            <p className="text-sm text-charcoal-light italic">
              No cover letter generated yet.
            </p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        {!applied && (
          <button
            type="button"
            onClick={onApplyNow}
            className="bg-gold text-white px-6 py-3 rounded-lg font-medium hover:bg-gold/90 transition-colors"
          >
            Apply Now
          </button>
        )}
        <button
          type="button"
          onClick={onCustomize}
          className="text-charcoal-light hover:text-gold text-sm transition-colors"
        >
          Customize
        </button>
      </div>
    </div>
  );
}

export default function QueueList({
  jobs,
  profile,
  appliedJobIds,
  onSelectJob,
  onUpdateCoverLetter,
  onApplyNow,
}: QueueListProps) {
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
    <div className="space-y-4">
      {jobs.map((job) => {
        const applied = appliedJobIds.has(job.id);

        return (
          <BriefingCard
            key={job.id}
            job={job}
            profile={profile}
            applied={applied}
            onCustomize={() => onSelectJob(job)}
            onUpdateCoverLetter={(cl) => onUpdateCoverLetter(job.id, cl)}
            onApplyNow={() => onApplyNow(job)}
          />
        );
      })}
    </div>
  );
}
