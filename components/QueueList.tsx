"use client";

import { useState, useCallback } from "react";
import type { Job, Profile } from "@/lib/types";
import { downloadPdf } from "@/lib/pdf/download";
import MatchBadge from "./MatchBadge";
import CoverLetterEditor from "./CoverLetterEditor";

interface QueueListProps {
  jobs: Job[];
  profile: Profile;
  appliedJobIds: Set<string>;
  onSelectJob: (job: Job) => void;
  onUpdateCoverLetter: (jobId: string, coverLetter: string) => void;
  onUpdateResume: (jobId: string, resume: string) => void;
  onRegenerateResume: (jobId: string) => void;
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

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function BriefingCard({
  job,
  profile,
  applied,
  onCustomize,
  onUpdateCoverLetter,
  onUpdateResume,
  onRegenerateResume,
  onApplyNow,
}: {
  job: Job;
  profile: Profile;
  applied: boolean;
  onCustomize: () => void;
  onUpdateCoverLetter: (coverLetter: string) => void;
  onUpdateResume: (resume: string) => void;
  onRegenerateResume: () => void;
  onApplyNow: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"cover-letter" | "resume">("cover-letter");
  const tier = TIER_LABELS[job.applyTier];
  const deadlineSoon = isDeadlineSoon(job.deadline);
  const coverLetter = job.generatedMaterials?.coverLetter || "";
  const resume = job.generatedMaterials?.resume || "";
  const clWords = wordCount(coverLetter);
  const coverLetterShort = coverLetter.length > 0 && clWords < 250;

  const handleCoverLetterChange = useCallback(
    (value: string) => {
      onUpdateCoverLetter(value);
    },
    [onUpdateCoverLetter]
  );

  const handleResumeChange = useCallback(
    (value: string) => {
      onUpdateResume(value);
    },
    [onUpdateResume]
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

        {/* Tab switcher */}
        <div className="flex gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab("cover-letter")}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              activeTab === "cover-letter"
                ? "bg-gold text-white"
                : "bg-cream-dark text-charcoal-light hover:text-charcoal"
            }`}
          >
            Cover Letter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resume")}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              activeTab === "resume"
                ? "bg-gold text-white"
                : "bg-cream-dark text-charcoal-light hover:text-charcoal"
            }`}
          >
            Resume
          </button>
        </div>

        {/* Cover letter tab */}
        {activeTab === "cover-letter" && (
          <>
            {coverLetterShort && (
              <p className="text-xs text-hzl-amber mb-2">
                This cover letter may be too short ({clWords} words). Consider regenerating.
              </p>
            )}
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
                <div>
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
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(coverLetter)}
                    className="text-xs text-charcoal-light hover:text-charcoal transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadPdf("cover-letter", coverLetter, profile)}
                    className="text-xs border border-gold text-gold px-3 py-1 rounded hover:bg-gold/10 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
              )
            ) : (
              <div className="bg-cream-dark rounded p-4">
                <p className="text-sm text-charcoal-light italic">
                  No cover letter generated yet.
                </p>
              </div>
            )}
          </>
        )}

        {/* Resume tab */}
        {activeTab === "resume" && (
          <>
            {!resume ? (
              <div className="bg-cream-dark rounded p-4">
                <p className="text-xs text-hzl-amber mb-2">
                  Resume not generated yet.
                </p>
                <button
                  type="button"
                  onClick={onRegenerateResume}
                  className="text-xs px-3 py-1.5 rounded border border-gold text-gold hover:bg-gold/10 transition-colors"
                >
                  Generate Resume
                </button>
              </div>
            ) : expanded ? (
              <div className="space-y-2">
                <div className="border border-border rounded p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-charcoal-light">
                      Resume
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExpanded(false)}
                        className="text-xs text-charcoal-light hover:text-charcoal transition-colors"
                      >
                        done
                      </button>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(resume)}
                        className="text-xs text-charcoal-light hover:text-charcoal transition-colors"
                      >
                        copy
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPdf("resume", resume, profile)}
                        className="text-xs border border-gold text-gold px-3 py-1 rounded hover:bg-gold/10 transition-colors"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={20}
                    value={resume}
                    onChange={(e) => handleResumeChange(e.target.value)}
                    className="w-full text-sm leading-relaxed border border-border rounded p-2 bg-cream font-mono resize-y focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="bg-cream-dark rounded p-4 max-h-64 overflow-y-auto cursor-pointer"
                  onClick={() => setExpanded(true)}
                >
                  <p className="text-xs text-charcoal-light uppercase tracking-wide mb-1.5">
                    Resume
                  </p>
                  <pre className="text-sm leading-relaxed text-charcoal whitespace-pre-wrap font-sans">
                    {resume}
                  </pre>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(resume)}
                    className="text-xs text-charcoal-light hover:text-charcoal transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadPdf("resume", resume, profile)}
                    className="text-xs border border-gold text-gold px-3 py-1 rounded hover:bg-gold/10 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </>
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
  onUpdateResume,
  onRegenerateResume,
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
            onUpdateResume={(r) => onUpdateResume(job.id, r)}
            onRegenerateResume={() => onRegenerateResume(job.id)}
            onApplyNow={() => onApplyNow(job)}
          />
        );
      })}
    </div>
  );
}
