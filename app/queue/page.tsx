"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Job, Profile, Application, ApplicationStatus } from "@/lib/types";
import { loadState, updateState } from "@/lib/storage";
import { generateResume } from "@/lib/resume";
import QueueList from "@/components/QueueList";
import AppliedList from "@/components/AppliedList";
import WizardPanel from "@/components/WizardPanel";
import PreSubmitChecklist from "@/components/PreSubmitChecklist";

type QueueTab = "ready" | "applied" | "all";

interface Toast {
  id: string;
  message: string;
}

export default function QueuePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [checklistJob, setChecklistJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<QueueTab>("ready");

  useEffect(() => {
    const state = loadState();
    setJobs(state.jobs);
    setApplications(state.applications);
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
    const ids = new Set<string>();
    applications.forEach((app) => ids.add(app.jobId));
    jobs.forEach((j) => {
      if (j.status === "applied") ids.add(j.id);
    });
    return ids;
  }, [jobs, applications]);

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
                    resume: "",
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

  const handleUpdateResume = useCallback(
    (jobId: string, resume: string) => {
      const next = updateState((state) => ({
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === jobId
            ? {
                ...j,
                generatedMaterials: {
                  ...(j.generatedMaterials ?? {
                    coverLetter: "",
                    resume: "",
                    bioVariantUsed: "",
                    resumePresetUsed: "",
                    customAnswers: [],
                  }),
                  resume,
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

  const handleRegenerateResume = useCallback(
    (jobId: string) => {
      if (!profile) return;
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;
      const resume = generateResume(job, profile);
      handleUpdateResume(jobId, resume);
    },
    [jobs, profile, handleUpdateResume]
  );

  const handleWizardUpdateMaterials = useCallback(
    (coverLetter: string) => {
      if (!selectedJob) return;
      handleUpdateCoverLetter(selectedJob.id, coverLetter);
    },
    [selectedJob, handleUpdateCoverLetter]
  );

  const handleWizardUpdateResume = useCallback(
    (resume: string) => {
      if (!selectedJob) return;
      handleUpdateResume(selectedJob.id, resume);
    },
    [selectedJob, handleUpdateResume]
  );

  const handleApplyNowRequest = useCallback(
    (job: Job) => {
      setChecklistJob(job);
    },
    []
  );

  const handleApplyConfirmed = useCallback(
    (job: Job) => {
      setChecklistJob(null);
      const coverLetter = job.generatedMaterials?.coverLetter || "";

      if (job.applyTier === "full-auto") {
        // Full-auto: mark as applied, show toast
        const appliedAt = new Date().toISOString();
        const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
              appliedAt,
              notes: "",
              followUps: [],
            },
          ],
        }));
        setJobs(next.jobs);
        setApplications(next.applications);
        showToast(`Applied to ${job.company} -- follow-up reminder set for ${followUpDate}`);
      } else if (job.applyTier === "one-click") {
        // One-click: open URL, copy cover letter, mark applied
        if (coverLetter) {
          navigator.clipboard.writeText(coverLetter);
        }
        window.open(job.url, "_blank", "noopener,noreferrer");
        const appliedAt = new Date().toISOString();
        const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
              appliedAt,
              notes: "",
              followUps: [],
            },
          ],
        }));
        setJobs(next.jobs);
        setApplications(next.applications);
        showToast(
          `Applied to ${job.company} -- follow-up reminder set for ${followUpDate}`
        );
      } else {
        // Guided: open URL + copy cover letter + mark applied
        if (coverLetter) {
          navigator.clipboard.writeText(coverLetter);
        }
        window.open(job.url, "_blank", "noopener,noreferrer");
        const appliedAt = new Date().toISOString();
        const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
              appliedAt,
              notes: "",
              followUps: [],
            },
          ],
        }));
        setJobs(next.jobs);
        setApplications(next.applications);
        showToast(`Applied to ${job.company} -- follow-up reminder set for ${followUpDate}`);
      }
    },
    [showToast]
  );

  const handleMarkApplied = useCallback(() => {
    if (!selectedJob) return;
    const appliedAt = new Date().toISOString();
    const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
          appliedAt,
          notes: "",
          followUps: [],
        },
      ],
    }));
    setJobs(next.jobs);
    setApplications(next.applications);
    setSelectedJob(null);
    showToast(`Applied to ${selectedJob.company} -- follow-up reminder set for ${followUpDate}`);
  }, [selectedJob, showToast]);

  const handleMarkFollowedUp = useCallback(
    (jobId: string, type: "email" | "linkedin" | "other") => {
      const next = updateState((state) => ({
        ...state,
        applications: state.applications.map((a) =>
          a.jobId === jobId
            ? {
                ...a,
                followUps: [
                  ...(a.followUps ?? []),
                  { date: new Date().toISOString(), type, notes: "" },
                ],
              }
            : a
        ),
      }));
      setApplications(next.applications);
      showToast("Follow-up recorded");
    },
    [showToast]
  );

  const handleUpdateAppStatus = useCallback(
    (jobId: string, status: ApplicationStatus) => {
      const next = updateState((state) => ({
        ...state,
        applications: state.applications.map((a) =>
          a.jobId === jobId ? { ...a, status } : a
        ),
      }));
      setApplications(next.applications);
      showToast(`Status updated to ${status}`);
    },
    [showToast]
  );

  const handleCopyFollowUpEmail = useCallback(
    (job: Job, app: Application) => {
      const daysAgo = app.appliedAt
        ? Math.floor(
            (Date.now() - new Date(app.appliedAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;
      const keySkill =
        profile?.skills?.[0] || "software development";
      const email = `Subject: Following up -- ${job.title} application

Hi ${job.company} team,

I applied for the ${job.title} role ${daysAgo} days ago and wanted to follow up. I remain very interested in this position and would welcome the chance to discuss how my background in ${keySkill} could contribute to your team.

I'm happy to provide any additional information. Thank you for your time.

Best,
Ryann Lynn Murphy
ryannlynncontact@gmail.com
ryannlynnmurphy.com`;
      navigator.clipboard.writeText(email);
      showToast("Follow-up email copied to clipboard");
    },
    [profile, showToast]
  );

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
                {activeTab === "ready"
                  ? "Ready to Apply"
                  : activeTab === "applied"
                  ? "Applied"
                  : "All Jobs"}
              </h2>
              <p className="text-sm text-charcoal-light mt-1">
                {queuedCount} jobs queued &middot; {appliedCount} applied
              </p>
            </div>

            {/* Tab switcher */}
            <nav className="flex gap-1 border-b border-border mb-6">
              {([
                { key: "ready" as QueueTab, label: "Ready to Apply" },
                { key: "applied" as QueueTab, label: "Applied" },
                { key: "all" as QueueTab, label: "All" },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-2 text-xs font-mono whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? "border-gold text-charcoal"
                      : "border-transparent text-charcoal-light hover:text-charcoal hover:border-border-dark"
                  }`}
                >
                  {tab.label}
                  {tab.key === "applied" && appliedCount > 0 && (
                    <span className="ml-1.5 text-[10px] bg-gold-dim text-gold rounded-full px-1.5 py-0.5">
                      {appliedCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Ready to Apply tab */}
            {(activeTab === "ready" || activeTab === "all") && profile && (
              <QueueList
                jobs={
                  activeTab === "ready"
                    ? queuedJobs.filter((j) => !appliedJobIds.has(j.id))
                    : queuedJobs
                }
                profile={profile}
                appliedJobIds={appliedJobIds}
                onSelectJob={handleSelectJob}
                onUpdateCoverLetter={handleUpdateCoverLetter}
                onUpdateResume={handleUpdateResume}
                onRegenerateResume={handleRegenerateResume}
                onApplyNow={handleApplyNowRequest}
              />
            )}

            {/* Applied tab */}
            {activeTab === "applied" && profile && (
              <AppliedList
                jobs={jobs}
                applications={applications}
                onMarkFollowedUp={handleMarkFollowedUp}
                onUpdateStatus={handleUpdateAppStatus}
                onCopyFollowUpEmail={handleCopyFollowUpEmail}
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
              onUpdateResume={handleWizardUpdateResume}
              onMarkApplied={handleMarkApplied}
              onClose={handleCloseWizard}
            />
          </div>
        )}
      </div>

      {/* Pre-submit checklist modal */}
      {checklistJob && profile && (
        <PreSubmitChecklist
          job={checklistJob}
          profile={profile}
          onApply={() => handleApplyConfirmed(checklistJob)}
          onClose={() => setChecklistJob(null)}
        />
      )}

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
