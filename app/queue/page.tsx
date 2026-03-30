"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Job, Profile } from "@/lib/types";
import { loadState, updateState } from "@/lib/storage";
import QueueList from "@/components/QueueList";
import WizardPanel from "@/components/WizardPanel";

export default function QueuePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const state = loadState();
    setJobs(state.jobs);
    setProfile(state.profile);
  }, []);

  const queuedJobs = useMemo(() => {
    return jobs
      .filter((j) => j.status === "swiped-right" || j.status === "queued" || j.status === "applied")
      .sort((a, b) => {
        // Deadline urgency first (jobs with sooner deadlines come first)
        const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (aDeadline !== bDeadline) return aDeadline - bDeadline;
        // Then by matchScore descending
        return b.matchScore - a.matchScore;
      });
  }, [jobs]);

  const appliedJobIds = useMemo(() => {
    const state = loadState();
    const ids = new Set<string>();
    state.applications.forEach((app) => ids.add(app.jobId));
    // Also include jobs with status "applied"
    jobs.forEach((j) => {
      if (j.status === "applied") ids.add(j.id);
    });
    return ids;
  }, [jobs]);

  const appliedCount = appliedJobIds.size;
  const queuedCount = queuedJobs.filter((j) => !appliedJobIds.has(j.id)).length;

  const handleSelectJob = useCallback((job: Job) => {
    setSelectedJob(job);
  }, []);

  const handleUpdateMaterials = useCallback(
    (coverLetter: string) => {
      if (!selectedJob) return;
      const next = updateState((state) => ({
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === selectedJob.id
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
            : j,
        ),
      }));
      setJobs(next.jobs);
      setSelectedJob(
        next.jobs.find((j) => j.id === selectedJob.id) ?? null,
      );
    },
    [selectedJob],
  );

  const handleMarkApplied = useCallback(() => {
    if (!selectedJob) return;
    const next = updateState((state) => ({
      ...state,
      jobs: state.jobs.map((j) =>
        j.id === selectedJob.id ? { ...j, status: "applied" as const } : j,
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
      <div className={`flex h-[calc(100vh-4rem)] ${selectedJob ? "" : ""}`}>
        {/* Left: Queue list */}
        <div
          className={`overflow-y-auto p-6 ${
            selectedJob ? "w-[60%] border-r border-border" : "w-full"
          }`}
        >
          <div className={`${selectedJob ? "" : "max-w-4xl mx-auto"}`}>
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

            <QueueList
              jobs={queuedJobs}
              appliedJobIds={appliedJobIds}
              onSelectJob={handleSelectJob}
            />
          </div>
        </div>

        {/* Right: Wizard panel */}
        {selectedJob && profile && (
          <div className="w-[40%]">
            <WizardPanel
              job={selectedJob}
              profile={profile}
              onUpdateMaterials={handleUpdateMaterials}
              onMarkApplied={handleMarkApplied}
              onClose={handleCloseWizard}
            />
          </div>
        )}
      </div>
    </div>
  );
}
