"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Job } from "@/lib/types";
import { loadState, updateState } from "@/lib/storage";
import { scoreJob } from "@/lib/scorer";
import { generateCoverLetterFromTemplate } from "@/lib/templates";
import { generateResume } from "@/lib/resume";
import SwipeDeck from "@/components/SwipeDeck";
import FilterBar from "@/components/FilterBar";
import MatchBadge from "@/components/MatchBadge";
import JobForm from "@/components/JobForm";
import { downloadPdf } from "@/lib/pdf/download";

const VALIDATION_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LAST_SCRAPE_KEY = "ryann-apply-last-scrape";
const SCRAPE_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
const TOTAL_BOARDS = 35; // approximate total boards across greenhouse + lever

export default function DiscoveryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showNewOnly, setShowNewOnly] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [expandedJob, setExpandedJob] = useState<Job | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchToast, setSearchToast] = useState<string | null>(null);
  const [findingMore, setFindingMore] = useState(false);
  const validationRan = useRef(false);

  // Scrape state
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [scanToast, setScanToast] = useState<string | null>(null);
  const scrapeInFlight = useRef(false);

  const runScrape = useCallback(async (existingJobs: Job[]) => {
    if (scrapeInFlight.current) return;
    scrapeInFlight.current = true;
    setIsScanning(true);
    setScanMessage(`Scanning ${TOTAL_BOARDS} job boards...`);
    setScanToast(null);

    try {
      const existingUrls = existingJobs.map((j) => j.url);
      const res = await fetch("/api/scrape-boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingUrls }),
      });
      const data = await res.json();

      const scannedMsg = `${data.boardsScanned ?? 0} boards scanned`;
      const failedMsg = data.boardsFailed ? `, ${data.boardsFailed} failed` : "";

      if (data.jobs && data.jobs.length > 0) {
        const next = updateState((s) => ({
          ...s,
          jobs: [...s.jobs, ...data.jobs],
        }));
        setJobs(next.jobs);
        setScanToast(`Found ${data.jobs.length} new jobs (${scannedMsg}${failedMsg})`);
      } else {
        setScanToast(`No new jobs found (${scannedMsg}${failedMsg})`);
      }

      localStorage.setItem(LAST_SCRAPE_KEY, Date.now().toString());
    } catch (err) {
      console.error("Scrape failed:", err);
      setScanToast("Scan failed -- will retry later");
    } finally {
      setIsScanning(false);
      setScanMessage("");
      scrapeInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    const state = loadState();
    setJobs(state.jobs);

    // Check if auto-scrape is needed
    const lastScrape = localStorage.getItem(LAST_SCRAPE_KEY);
    const lastScrapeTime = lastScrape ? parseInt(lastScrape, 10) : 0;
    const elapsed = Date.now() - lastScrapeTime;

    if (elapsed > SCRAPE_INTERVAL_MS) {
      runScrape(state.jobs);
    }
  }, [runScrape]);

  // Background validation on mount
  useEffect(() => {
    if (validationRan.current || jobs.length === 0) return;
    validationRan.current = true;

    const now = Date.now();
    const jobsToValidate = jobs.filter(
      (j) =>
        j.status === "new" &&
        (!j.validated ||
          !j.validatedAt ||
          now - new Date(j.validatedAt).getTime() > VALIDATION_INTERVAL_MS)
    );

    if (jobsToValidate.length === 0) return;

    const urls = jobsToValidate.map((j) => j.url);

    fetch("/api/validate-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.results) return;

        const statusMap = new Map<string, string>();
        for (const r of data.results as { url: string; status: string }[]) {
          statusMap.set(r.url, r.status);
        }

        let expired = 0;
        const next = updateState((state) => ({
          ...state,
          jobs: state.jobs.map((j) => {
            const result = statusMap.get(j.url);
            if (!result) return j;

            if (result === "expired" && j.status === "new") {
              expired++;
              return {
                ...j,
                status: "rejected" as const,
                validated: true,
                validatedAt: new Date().toISOString(),
              };
            }

            return {
              ...j,
              validated: result !== "unknown",
              validatedAt: new Date().toISOString(),
            };
          }),
        }));

        setJobs(next.jobs);
        if (expired > 0) setExpiredCount(expired);
      })
      .catch((err) => console.error("Validation failed:", err));
  }, [jobs]);

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
    (job: Job) => {
      const state = loadState();
      const profile = state.profile;

      let materials = job.generatedMaterials;
      if (!materials?.coverLetter) {
        const coverLetter = generateCoverLetterFromTemplate(job, profile);
        const preset =
          profile.resumePresets.find((p) =>
            p.label.toLowerCase().includes(job.category.toLowerCase())
          ) || profile.resumePresets[0];

        materials = {
          coverLetter,
          resume: generateResume(job, profile),
          bioVariantUsed:
            preset?.defaultBioVariant || profile.bioVariants[0]?.id || "",
          resumePresetUsed: preset?.id || "",
          customAnswers: [],
        };
      }

      const next = updateState((s) => ({
        ...s,
        jobs: s.jobs.map((j) =>
          j.id === job.id
            ? { ...j, status: "queued" as const, generatedMaterials: materials }
            : j
        ),
      }));
      setJobs(next.jobs);
    },
    [],
  );
  const handleSwipeLeft = useCallback(
    (job: Job) => updateJobStatus(job, "skipped"),
    [updateJobStatus],
  );
  const handleSwipeUp = useCallback(
    (job: Job) => updateJobStatus(job, "saved"),
    [updateJobStatus],
  );

  const generateCoverLetter = useCallback(async (job: Job) => {
    setGenerating(true);
    try {
      const state = loadState();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: job.description,
          jobTitle: job.title,
          company: job.company,
          category: job.category,
          profile: state.profile,
        }),
      });
      const data = await res.json();
      if (data.coverLetter) {
        const next = updateState((s) => ({
          ...s,
          jobs: s.jobs.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  generatedMaterials: {
                    coverLetter: data.coverLetter,
                    resume: j.generatedMaterials?.resume ?? "",
                    bioVariantUsed: j.generatedMaterials?.bioVariantUsed ?? "",
                    resumePresetUsed: j.generatedMaterials?.resumePresetUsed ?? "",
                    customAnswers: j.generatedMaterials?.customAnswers ?? [],
                  },
                }
              : j,
          ),
        }));
        setJobs(next.jobs);
        const updatedJob = next.jobs.find((j) => j.id === job.id);
        if (updatedJob) setExpandedJob(updatedJob);
      }
    } catch (err) {
      console.error("Cover letter generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, []);

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

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchToast(null);

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery.trim(),
          location: searchLocation.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!data.jobs || data.jobs.length === 0) {
        setSearchToast(`No jobs found for '${searchQuery}' -- try different keywords`);
        return;
      }

      const state = loadState();
      const existingUrls = new Set(state.jobs.map((j: Job) => j.url));
      const newJobs: Job[] = (data.jobs as Job[])
        .filter((j) => !existingUrls.has(j.url))
        .map((j) => ({
          ...j,
          matchScore: scoreJob(j, state.profile),
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      if (newJobs.length === 0) {
        setSearchToast(`No new jobs found for '${searchQuery}' -- already in your list`);
        return;
      }

      const next = updateState((s) => ({
        ...s,
        jobs: [...s.jobs, ...newJobs],
      }));
      setJobs(next.jobs);
      setSearchToast(`Found ${newJobs.length} new jobs matching '${searchQuery}'`);
      setSearchQuery("");
      setSearchLocation("");
    } catch (err) {
      console.error("Search failed:", err);
      setSearchToast("Search failed -- please try again");
    } finally {
      setSearching(false);
    }
  }, [searchQuery, searchLocation]);

  const handleFindMore = useCallback(
    async (job: Job) => {
      setFindingMore(true);
      setSearchToast(null);

      try {
        const query = `${job.title} ${job.category}`;
        const res = await fetch("/api/search-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();

        if (!data.jobs || data.jobs.length === 0) {
          setSearchToast(`No similar jobs found for '${job.title}'`);
          return;
        }

        const state = loadState();
        const existingUrls = new Set(state.jobs.map((j: Job) => j.url));
        const newJobs: Job[] = (data.jobs as Job[])
          .filter((j) => !existingUrls.has(j.url))
          .map((j) => ({
            ...j,
            matchScore: scoreJob(j, state.profile),
          }))
          .sort((a, b) => b.matchScore - a.matchScore);

        if (newJobs.length === 0) {
          setSearchToast("No new similar jobs found -- already in your list");
          return;
        }

        const next = updateState((s) => ({
          ...s,
          jobs: [...s.jobs, ...newJobs],
        }));
        setJobs(next.jobs);
        setSearchToast(`Found ${newJobs.length} jobs similar to '${job.title}'`);
      } catch (err) {
        console.error("Find more failed:", err);
        setSearchToast("Search failed -- please try again");
      } finally {
        setFindingMore(false);
      }
    },
    [],
  );

  // Dismiss toasts after 5-6 seconds
  useEffect(() => {
    if (!searchToast) return;
    const timer = setTimeout(() => setSearchToast(null), 5000);
    return () => clearTimeout(timer);
  }, [searchToast]);

  useEffect(() => {
    if (!scanToast) return;
    const timer = setTimeout(() => setScanToast(null), 6000);
    return () => clearTimeout(timer);
  }, [scanToast]);

  // Dismiss expired count after 5 seconds
  useEffect(() => {
    if (expiredCount === 0) return;
    const timer = setTimeout(() => setExpiredCount(0), 5000);
    return () => clearTimeout(timer);
  }, [expiredCount]);

  const deckIsEmpty = filteredJobs.length === 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Scanning progress bar */}
      {isScanning && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-0.5 bg-gold/20 w-full overflow-hidden">
            <div className="h-full bg-gold animate-indeterminate-bar" />
          </div>
          <div className="text-center py-1.5 bg-cream/95 border-b border-gold/20">
            <span className="text-xs tracking-wide text-charcoal-light">
              {scanMessage}
            </span>
          </div>
        </div>
      )}

      {/* Scan result toast */}
      {scanToast && !isScanning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-cream text-xs tracking-wide px-4 py-2 rounded-full shadow-lg animate-fade-in">
          {scanToast}
        </div>
      )}

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => runScrape(jobs)}
            disabled={isScanning}
            className="px-3 py-2 text-xs uppercase tracking-wide border border-charcoal/20 text-charcoal-light rounded hover:bg-charcoal/5 transition-colors disabled:opacity-40"
          >
            {isScanning ? "Scanning..." : "Refresh"}
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="px-4 py-2 text-xs uppercase tracking-wide border border-charcoal-light text-charcoal-light rounded hover:bg-charcoal/5 transition-colors"
          >
            Search Jobs
          </button>
          <button
            onClick={() => setShowJobForm(true)}
            className="px-4 py-2 text-xs uppercase tracking-wide border border-gold text-gold rounded hover:bg-gold/10 transition-colors"
          >
            Add Job URL
          </button>
        </div>
      </div>

      {/* Expired count notification */}
      {expiredCount > 0 && (
        <div className="mb-4 px-4 py-2 bg-cream border border-border rounded-lg text-sm text-charcoal-light">
          {expiredCount} expired job{expiredCount > 1 ? "s" : ""} removed
        </div>
      )}

      {/* Toast */}
      {searchToast && (
        <div className="mb-4 px-4 py-2 bg-cream border border-border rounded-lg text-sm text-charcoal">
          {searchToast}
        </div>
      )}

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

      {/* Search section -- shown when deck is empty or via button */}
      {(deckIsEmpty || showSearch) && (
        <div className="mt-6 bg-white border border-border rounded-xl p-6">
          <h3 className="font-display text-lg font-bold text-charcoal mb-1">
            Search for More Jobs
          </h3>
          <p className="text-sm text-charcoal-light mb-4">
            Find roles from remote job boards and aggregators.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="e.g. junior copywriter, AI safety, community manager..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:border-gold focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="e.g. Remote, NYC, San Francisco..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:border-gold focus:outline-none transition-colors"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-5 py-2 text-sm bg-charcoal text-cream rounded-lg hover:bg-charcoal-mid transition-colors disabled:opacity-50"
              >
                {searching ? "Searching..." : "Search"}
              </button>
              {showSearch && !deckIsEmpty && (
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-sm text-charcoal-light hover:text-charcoal transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
                {/* Unverified indicator */}
                {!expandedJob.validated && (
                  <span className="text-[10px] text-charcoal-light">unverified</span>
                )}
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

            {/* Cover letter preview or generate button */}
            {expandedJob.generatedMaterials?.coverLetter ? (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1">
                  Cover Letter Preview
                </h4>
                <p className="text-sm text-charcoal leading-relaxed bg-cream rounded-lg p-3 border border-border">
                  {expandedJob.generatedMaterials.coverLetter.slice(0, 300)}
                  {expandedJob.generatedMaterials.coverLetter.length > 300 ? "..." : ""}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => generateCoverLetter(expandedJob)}
                  className="px-4 py-2 text-sm border border-gold text-gold rounded hover:bg-gold/10 transition-colors disabled:opacity-50"
                >
                  {generating ? "Generating..." : "Generate Cover Letter"}
                </button>
              </div>
            )}

            {/* PDF Downloads */}
            {expandedJob.generatedMaterials && (
              <div className="mb-4 flex gap-2">
                {expandedJob.generatedMaterials.coverLetter && (
                  <button
                    type="button"
                    onClick={() => {
                      const state = loadState();
                      downloadPdf("cover-letter", expandedJob.generatedMaterials!.coverLetter, state.profile);
                    }}
                    className="text-xs border border-gold text-gold px-3 py-1 rounded hover:bg-gold/10 transition-colors"
                  >
                    Download Cover Letter PDF
                  </button>
                )}
                {expandedJob.generatedMaterials.resume && (
                  <button
                    type="button"
                    onClick={() => {
                      const state = loadState();
                      downloadPdf("resume", expandedJob.generatedMaterials!.resume, state.profile);
                    }}
                    className="text-xs border border-gold text-gold px-3 py-1 rounded hover:bg-gold/10 transition-colors"
                  >
                    Download Resume PDF
                  </button>
                )}
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
                onClick={() => handleFindMore(expandedJob)}
                disabled={findingMore}
                className="text-xs text-charcoal-light hover:text-gold transition-colors disabled:opacity-50"
              >
                {findingMore ? "Searching..." : "Find More Like This"}
              </button>
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
