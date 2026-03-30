"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Job, Profile } from "@/lib/types";
import { loadState, updateState } from "@/lib/storage";
import QueueList from "@/components/QueueList";
import WizardPanel from "@/components/WizardPanel";

interface Toast {
  id: string;
  message: string;
}

export default function QueuePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const state = loadState();
    setJobs(state.jobs);
    setProfile(state.profile);
  }, []);

  const showToast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const queuedJobs = useMemo(() => {
    return jobs
      .filter(
        (j) =>
          j.status === "swiped-right" ||
          j.status === "queued" ||
          j.status === "applied"
      )
      .sort((a, b) => {
        const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (aDeadline !== bDeadline) return aDeadline - bDeadline;
        return b.matchScore - a.matchScore;
      });
  }, [jobs]);

  const appliedJobIds = useMemo(() => {
    const state = loadState();
    const ids = new Set<string>();
    state.applications.forEach((app) => ids.add(app.jobId));
    jobs.forEach((j) => {
      if (j.status === "applied") ids.add(j.id);
    });
    return ids;
  }, [jobs]);

  const appliedCount = appliedJobIds.size;
  const queuedCount = queuedJobs.filter(
    (j) => !appliedJobIds.has(j.id)
  ).length;

  const handleSelectJob = useCallback((job: Job) => {
    setSelectedJob(job);
  }, []);

  const handleUpdateCoverLetter = useCallback(
    (jobId: string, coverLetter: string) => {
      const next = updateState((state) => ({
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === jobId
            ? {
                ...j,
                generatedMaterials: {
                  ...(j.generatedMaterials ?? {
                    coverLetter: "",
                    bioVariantUsed: "",
                    resumePresetUsed: "",
                    customAnswers: [],
                  }),
                  coverLetter,
                },
              }
            : j
        ),
      }));
      setJobs(next.jobs);
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(next.jobs.find((j) => j.id === jobId) ?? null);
      }
    },
    [selectedJob]
  );

  const handleWizardUpdateMaterials = useCallback(
    (coverLetter: string) => {
      if (!selectedJob) return;
      handleUpdateCoverLetter(selectedJob.id, coverLetter);
    },
    [selectedJob, handleUpdateCoverLetter]
  );

  const handleApplyNow = useCallback(
    (job: Job) => {
      const coverLetter = job.generatedMaterials?.coverLetter || "";

      if (job.applyTier === "full-auto") {
        // Full-auto: mark as applied, show toast
        const next = updateState((state) => ({
          ...state,
          jobs: state.jobs.map((j) =>
            j.id === job.id ? { ...j, status: "applied" as const } : j
          ),
          applications: [
            ...state.applications.filter((a) => a.jobId !== job.id),
            {
              jobId: job.id,
              status: "submitted" as const,
              appliedAt: new Date().toISOString(),
              notes: "",
            },
          ],
        }));
        setJobs(next.jobs);
        showToast(`Application submitted to ${job.company}`);
      } else if (job.applyTier === "one-click") {
        // One-click: open URL, copy cover letter, show toast
        if (coverLetter) {
          navigator.clipboard.writeText(coverLetter);
        }
        window.open(job.url, "_blank", "noopener,noreferrer");
        showToast(
          `Browser opened with form for ${job.company} -- cover letter copied`
        );
      } else {
        // Guided: open URL + copy cover letter + show toast
        if (coverLetter) {
          navigator.clipboard.writeText(coverLetter);
        }
        window.open(job.url, "_blank", "noopener,noreferrer");
        showToast("Cover letter copied -- paste it in the application");
      }
    },
    [showToast]
  );

  const handleMarkApplied = useCallback(() => {
    if (!selectedJob) return;
    const next = updateState((state) => ({
      ...state,
      jobs: state.jobs.map((j) =>
        j.id === selectedJob.id
          ? { ...j, status: "applied" as const }
          : j
      ),
      applications: [
        ...state.applications.filter((a) => a.jobId !== selectedJob.id),
        {
          jobId: selectedJob.id,
          status: "submitted" as const,
          appliedAt: new Date().toISOString(),
          notes: "",
        },
      ],
    }));
    setJobs(next.jobs);
    setSelectedJob(null);
  }, [selectedJob]);

  const handleCloseWizard = useCallback(() => {
    setSelectedJob(null);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className={`flex h-[calc(100vh-4rem)]`}>
        {/* Left: Queue list */}
        <div
          className={`overflow-y-auto p-6 ${
            selectedJob ? "w-[60%] border-r border-border" : "w-full"
          }`}
        >
          <div className={`${selectedJob ? "" : "max-w-3xl mx-auto"}`}>
            {/* Header */}
            <div className="mb-6">
              <p className="text-xs font-mono uppercase tracking-wider text-gold mb-1">
                Queue
              </p>
              <h2 className="font-display text-2xl font-bold text-charcoal">
                Ready to Apply
              </h2>
              <p className="text-sm text-charcoal-light mt-1">
                {queuedCount} jobs queued &middot; {appliedCount} applied
              </p>
            </div>

            {profile && (
              <QueueList
                jobs={queuedJobs}
                profile={profile}
                appliedJobIds={appliedJobIds}
                onSelectJob={handleSelectJob}
                onUpdateCoverLetter={handleUpdateCoverLetter}
                onApplyNow={handleApplyNow}
              />
            )}
          </div>
        </div>

        {/* Right: Wizard panel */}
        {selectedJob && profile && (
          <div className="w-[40%]">
            <WizardPanel
              job={selectedJob}
              profile={profile}
              onUpdateMaterials={handleWizardUpdateMaterials}
              onMarkApplied={handleMarkApplied}
              onClose={handleCloseWizard}
            />
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-charcoal text-cream px-6 py-3 rounded-lg shadow-xl text-sm animate-in fade-in slide-in-from-bottom-2"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
