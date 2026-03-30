"use client";

import type { Job, Profile } from "@/lib/types";

interface PreSubmitChecklistProps {
  job: Job;
  profile: Profile;
  onApply: () => void;
  onClose: () => void;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function PreSubmitChecklist({
  job,
  profile,
  onApply,
  onClose,
}: PreSubmitChecklistProps) {
  const coverLetter = job.generatedMaterials?.coverLetter || "";
  const resume = job.generatedMaterials?.resume || "";
  const clWords = wordCount(coverLetter);

  const checks = [
    {
      label: `Cover letter generated (${clWords} words)`,
      ok: clWords > 0,
      warn: clWords > 0 && clWords < 250 ? "May be too short" : "",
    },
    {
      label: "Resume tailored",
      ok: resume.length > 0,
      warn: resume.length === 0 ? "Resume missing" : "",
    },
    {
      label: "Name provided",
      ok: !!profile.name,
      warn: !profile.name ? "Missing name -- update in Profile tab" : "",
    },
    {
      label: "Email provided",
      ok: !!profile.email,
      warn: !profile.email ? "Missing email -- update in Profile tab" : "",
    },
    {
      label: "LinkedIn URL",
      ok: !!profile.linkedin,
      warn: !profile.linkedin ? "LinkedIn URL missing -- add in Profile" : "",
    },
  ];

  const hasWarnings = checks.some((c) => !c.ok || c.warn);

  return (
    <div
      className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg font-bold text-charcoal mb-4">
          Ready to apply to {job.company}?
        </h3>

        <div className="space-y-2 mb-6">
          {checks.map((check, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-sm flex-shrink-0 ${check.ok && !check.warn ? "text-hzl-green" : "text-hzl-amber"}`}>
                {check.ok && !check.warn ? "\u2713" : "\u2717"}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-charcoal">{check.label}</span>
                {check.warn && (
                  <p className="text-xs text-hzl-amber mt-0.5">
                    {check.warn}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onApply}
            className="bg-gold text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gold/90 transition-colors"
          >
            {hasWarnings ? "Apply Anyway" : "Apply Now"}
          </button>
          {hasWarnings && (
            <a
              href="/profile"
              className="text-charcoal-light border border-border px-4 py-2.5 rounded-lg text-sm hover:border-gold transition-colors"
            >
              Go to Profile
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-charcoal-light text-sm hover:text-charcoal transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
