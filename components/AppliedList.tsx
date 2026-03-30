"use client";

import { useMemo } from "react";
import type { Job, Application, ApplicationStatus } from "@/lib/types";

interface AppliedListProps {
  jobs: Job[];
  applications: Application[];
  onMarkFollowedUp: (jobId: string, type: "email" | "linkedin" | "other") => void;
  onUpdateStatus: (jobId: string, status: ApplicationStatus) => void;
  onCopyFollowUpEmail: (job: Job, app: Application) => void;
}

const STATUS_BADGES: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  ready: { label: "Ready", className: "bg-cream-dark text-charcoal-light border-border" },
  "in-progress": { label: "In Progress", className: "bg-cream-dark text-charcoal-light border-border" },
  submitted: { label: "Applied", className: "bg-hzl-blue-bg text-hzl-blue border-hzl-blue" },
  "phone-screen": { label: "Phone Screen", className: "bg-hzl-purple-bg text-hzl-purple border-hzl-purple" },
  interview: { label: "Interview", className: "bg-gold-dim text-gold border-gold" },
  rejected: { label: "Rejected", className: "bg-cream-dark text-charcoal-light border-border opacity-60" },
  offer: { label: "Offer", className: "bg-hzl-green-bg text-hzl-green border-hzl-green" },
};

function getFollowUpState(app: Application): {
  label: string;
  className: string;
  needsAction: boolean;
} {
  if (!app.appliedAt) {
    return { label: "No date", className: "text-charcoal-light", needsAction: false };
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const followUpCount = app.followUps?.length ?? 0;

  // Terminal statuses -- no follow-up needed
  if (app.status === "rejected" || app.status === "offer") {
    return { label: "", className: "", needsAction: false };
  }

  if (followUpCount >= 2) {
    return { label: "Followed up", className: "text-hzl-green bg-hzl-green-bg border-hzl-green", needsAction: false };
  }

  if (followUpCount === 1 && daysSince >= 14) {
    return {
      label: "2nd follow-up NOW",
      className: "text-hzl-red bg-hzl-red-bg border-hzl-red animate-pulse",
      needsAction: true,
    };
  }

  if (followUpCount === 1) {
    return { label: "Followed up", className: "text-hzl-green bg-hzl-green-bg border-hzl-green", needsAction: false };
  }

  if (daysSince >= 7) {
    return {
      label: "Follow up NOW",
      className: "text-hzl-red bg-hzl-red-bg border-hzl-red animate-pulse",
      needsAction: true,
    };
  }

  const daysLeft = 7 - daysSince;
  return {
    label: `Follow up in ${daysLeft}d`,
    className: "text-hzl-amber bg-hzl-amber-bg border-hzl-amber",
    needsAction: false,
  };
}

function AppliedCard({
  job,
  app,
  onMarkFollowedUp,
  onUpdateStatus,
  onCopyFollowUpEmail,
}: {
  job: Job;
  app: Application;
  onMarkFollowedUp: (jobId: string, type: "email" | "linkedin" | "other") => void;
  onUpdateStatus: (jobId: string, status: ApplicationStatus) => void;
  onCopyFollowUpEmail: (job: Job, app: Application) => void;
}) {
  const followUp = getFollowUpState(app);
  const badge = STATUS_BADGES[app.status];
  const appliedDate = app.appliedAt
    ? new Date(app.appliedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
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
            <p className="text-sm text-charcoal-light">
              {job.company} &middot; Applied {appliedDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status badge */}
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono font-bold ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {/* Follow-up status + actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          {/* Follow-up badge */}
          {followUp.label && (
            <span
              className={`text-xs px-2 py-1 rounded-full border font-mono ${followUp.className}`}
            >
              {followUp.label}
            </span>
          )}

          {/* Follow-up history */}
          {(app.followUps?.length ?? 0) > 0 && (
            <span className="text-[10px] text-charcoal-light font-mono">
              {app.followUps?.length ?? 0} follow-up{(app.followUps?.length ?? 0) !== 1 ? "s" : ""} sent
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy follow-up email */}
          {followUp.needsAction && (
            <button
              type="button"
              onClick={() => onCopyFollowUpEmail(job, app)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-gold text-gold hover:bg-gold-dim transition-colors font-mono"
            >
              Copy Follow-Up Email
            </button>
          )}

          {/* Mark followed up */}
          {app.status !== "rejected" && app.status !== "offer" && (
            <button
              type="button"
              onClick={() => onMarkFollowedUp(job.id, "email")}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border text-charcoal-light hover:border-hzl-green hover:text-hzl-green transition-colors font-mono"
            >
              Mark Followed Up
            </button>
          )}

          {/* Status dropdown */}
          <select
            value={app.status}
            onChange={(e) =>
              onUpdateStatus(job.id, e.target.value as ApplicationStatus)
            }
            className="text-xs px-2 py-1.5 rounded-lg border border-border text-charcoal bg-white font-mono cursor-pointer hover:border-border-dark transition-colors"
          >
            <option value="submitted">Applied</option>
            <option value="phone-screen">Phone Screen</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function AppliedList({
  jobs,
  applications,
  onMarkFollowedUp,
  onUpdateStatus,
  onCopyFollowUpEmail,
}: AppliedListProps) {
  const appliedApps = useMemo(() => {
    const appliedStatuses: ApplicationStatus[] = [
      "submitted",
      "phone-screen",
      "interview",
      "offer",
      "rejected",
    ];
    return applications
      .filter((a) => appliedStatuses.includes(a.status))
      .sort((a, b) => {
        // Active items first, rejected last
        const order: Record<string, number> = {
          interview: 0,
          "phone-screen": 1,
          submitted: 2,
          offer: 3,
          rejected: 4,
        };
        const aOrder = order[a.status] ?? 2;
        const bOrder = order[b.status] ?? 2;
        if (aOrder !== bOrder) return aOrder - bOrder;
        // Then by date, newest first
        const aDate = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const bDate = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return bDate - aDate;
      });
  }, [applications]);

  if (appliedApps.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-charcoal-light text-sm font-mono">
          No applications yet -- apply to jobs from the Ready tab to track them
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appliedApps.map((app) => {
        const job = jobs.find((j) => j.id === app.jobId);
        if (!job) return null;
        return (
          <AppliedCard
            key={app.jobId}
            job={job}
            app={app}
            onMarkFollowedUp={onMarkFollowedUp}
            onUpdateStatus={onUpdateStatus}
            onCopyFollowUpEmail={onCopyFollowUpEmail}
          />
        );
      })}
    </div>
  );
}
