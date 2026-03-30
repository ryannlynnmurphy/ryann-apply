"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Job } from "@/lib/types";
import { loadState, updateState } from "@/lib/storage";
import { scoreJob } from "@/lib/scorer";
import SwipeDeck from "@/components/SwipeDeck";
import FilterBar from "@/components/FilterBar";
import MatchBadge from "@/components/MatchBadge";
import JobForm from "@/components/JobForm";

export default function DiscoveryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showNewOnly, setShowNewOnly] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [expandedJob, setExpandedJob] = useState<Job | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);

  useEffect(() => {
    const state = loadState();
    setJobs(state.jobs);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(jobs.map((j) => j.category));
    return Array.from(cats).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((j) => j.status === "new");

    if (activeCategory !== "All") {
      result = result.filter((j) => j.category === activeCategory);
    }
    if (showNewOnly) {
      result = result.filter((j) => j.source === "seed" || j.source === "scraped");
    }
    if (minScore > 0) {
      result = result.filter((j) => j.matchScore >= minScore);
    }

    return result.sort((a, b) => b.matchScore - a.matchScore);
  }, [jobs, activeCategory, showNewOnly, minScore]);

  const updateJobStatus = useCallback(
    (job: Job, status: Job["status"]) => {
      const next = updateState((state) => ({
        ...state,
        jobs: state.jobs.map((j) => (j.id === job.id ? { ...j, status } : j)),
      }));
      setJobs(next.jobs);
    },
    [],
  );

  const handleSwipeRight = useCallback(
    (job: Job) => updateJobStatus(job, "queued"),
    [updateJobStatus],
  );
  const handleSwipeLeft = useCallback(
    (job: Job) => updateJobStatus(job, "skipped"),
    [updateJobStatus],
  );
  const handleSwipeUp = useCallback(
    (job: Job) => updateJobStatus(job, "saved"),
    [updateJobStatus],
  );

  const handleAddJob = useCallback((job: Job) => {
    const state = loadState();
    const scored = { ...job, matchScore: scoreJob(job, state.profile) };
    const next = updateState((s) => ({
      ...s,
      jobs: [...s.jobs, scored],
    }));
    setJobs(next.jobs);
    setShowJobForm(false);
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-medium">
            Discovery
          </span>
          <h2 className="font-display text-2xl font-bold text-charcoal">
            Find Your Next Role
          </h2>
        </div>
        <button
          onClick={() => setShowJobForm(true)}
          className="px-4 py-2 text-xs uppercase tracking-wide border border-gold text-gold rounded hover:bg-gold/10 transition-colors"
        >
          Add Job URL
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          showNewOnly={showNewOnly}
          onToggleNewOnly={() => setShowNewOnly((v) => !v)}
          minScore={minScore}
          onMinScoreChange={setMinScore}
          resultCount={filteredJobs.length}
        />
      </div>

      {/* Swipe deck */}
      <SwipeDeck
        jobs={filteredJobs}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
        onSwipeUp={handleSwipeUp}
        onExpand={setExpandedJob}
      />

      {/* Expanded job modal */}
      {expandedJob && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4"
          onClick={() => setExpandedJob(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl font-bold text-charcoal leading-tight">
                  {expandedJob.title}
                </h3>
                <p className="text-sm text-charcoal-light">{expandedJob.company}</p>
              </div>
              <MatchBadge score={expandedJob.matchScore} />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {expandedJob.location && (
                <span className="rounded-full text-xs px-2 py-0.5 bg-cream border border-border text-charcoal-light">
                  {expandedJob.location}
                </span>
              )}
              {expandedJob.remote && (
                <span className="rounded-full text-xs px-2 py-0.5 bg-hzl-teal-bg text-hzl-teal border border-hzl-teal/30">
                  Remote
                </span>
              )}
              {expandedJob.salary && (
                <span className="rounded-full text-xs px-2 py-0.5 bg-cream border border-border text-charcoal-light">
                  {expandedJob.salary}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1">
                Description
              </h4>
              <p className="text-sm text-charcoal leading-relaxed">
                {expandedJob.description}
              </p>
            </div>

            {/* Requirements */}
            {expandedJob.requirements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1">
                  Requirements
                </h4>
                <ul className="space-y-1">
                  {expandedJob.requirements.map((req, i) => (
                    <li key={i} className="text-sm text-charcoal pl-3 border-l-2 border-border">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Why You */}
            {expandedJob.whyYou.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1">
                  Why You?
                </h4>
                <ul className="space-y-1">
                  {expandedJob.whyYou.map((bullet, i) => (
                    <li key={i} className="text-sm text-charcoal pl-3 border-l-2 border-gold">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cover letter preview */}
            {expandedJob.generatedMaterials?.coverLetter && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1">
                  Cover Letter Preview
                </h4>
                <p className="text-sm text-charcoal leading-relaxed bg-cream rounded-lg p-3 border border-border">
                  {expandedJob.generatedMaterials.coverLetter.slice(0, 300)}
                  {expandedJob.generatedMaterials.coverLetter.length > 300 ? "..." : ""}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <a
                href={expandedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-hzl-blue hover:underline"
              >
                View Application {"\u2197"}
              </a>
              <button
                onClick={() => {
                  updateJobStatus(expandedJob, "queued");
                  setExpandedJob(null);
                }}
                className="ml-auto rounded-full bg-charcoal text-cream text-sm px-4 py-2 hover:bg-charcoal-mid transition-colors"
              >
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Job modal */}
      {showJobForm && (
        <JobForm onAdd={handleAddJob} onClose={() => setShowJobForm(false)} />
      )}
    </div>
  );
}
