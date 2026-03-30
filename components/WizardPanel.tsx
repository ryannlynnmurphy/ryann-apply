"use client";

import { useState, useMemo, useCallback } from "react";
import type { Job, Profile, FormField } from "@/lib/types";
import CoverLetterEditor from "./CoverLetterEditor";

interface WizardPanelProps {
  job: Job;
  profile: Profile;
  onUpdateMaterials: (coverLetter: string) => void;
  onMarkApplied: () => void;
  onClose: () => void;
}

const DEFAULT_FIELDS: FormField[] = [
  { name: "Full Name", type: "text", required: true },
  { name: "Email", type: "text", required: true },
  { name: "Phone", type: "text", required: false },
  { name: "LinkedIn URL", type: "text", required: false },
  { name: "GitHub URL", type: "text", required: false },
  { name: "Website/Portfolio", type: "text", required: false },
  { name: "Cover Letter", type: "textarea", required: false },
];

function getAutoFillValue(fieldName: string, profile: Profile): string {
  const key = fieldName.toLowerCase().replace(/[^a-z_]/g, "");
  if (key.includes("name") || key === "fullname") return profile.name;
  if (key.includes("email")) return profile.email;
  if (key.includes("phone")) return profile.phone;
  if (key.includes("linkedin")) return profile.linkedin;
  if (key.includes("github")) return profile.github;
  if (key.includes("website") || key.includes("portfolio")) return profile.website;
  if (key.includes("location") || key.includes("city")) return profile.location;
  return "";
}

export default function WizardPanel({
  job,
  profile,
  onUpdateMaterials,
  onMarkApplied,
  onClose,
}: WizardPanelProps) {
  const fields = useMemo(
    () => (job.formFields && job.formFields.length > 0 ? job.formFields : DEFAULT_FIELDS),
    [job.formFields],
  );

  const nonTextareaFields = useMemo(
    () => fields.filter((f) => f.type !== "textarea"),
    [fields],
  );

  const [completedFields, setCompletedFields] = useState<Set<string>>(() => {
    const auto = new Set<string>();
    nonTextareaFields.forEach((f) => {
      if (getAutoFillValue(f.name, profile)) auto.add(f.name);
    });
    return auto;
  });

  const [coverLetterPasted, setCoverLetterPasted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const coverLetter = job.generatedMaterials?.coverLetter ?? "";

  const totalSteps = nonTextareaFields.length + (coverLetter ? 1 : 0);
  const completedCount = completedFields.size + (coverLetterPasted ? 1 : 0);
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const toggleField = useCallback((name: string) => {
    setCompletedFields((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleCopyField = useCallback(async (name: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(name);
    setTimeout(() => setCopiedField(null), 1500);
  }, []);

  return (
    <div className="h-full flex flex-col bg-cream border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-charcoal-light">{job.company}</p>
            <h3 className="font-display text-lg font-bold text-charcoal">{job.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal text-lg leading-none"
          >
            &#10005;
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-charcoal-light mt-1 font-mono">
            {completedCount} / {totalSteps} fields
          </p>
        </div>
      </div>

      {/* Fields list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {nonTextareaFields.map((field) => {
          const autoValue = getAutoFillValue(field.name, profile);
          const isComplete = completedFields.has(field.name);

          return (
            <div
              key={field.name}
              className="flex items-center gap-3 p-2 rounded border border-border bg-white"
            >
              <button
                type="button"
                onClick={() => toggleField(field.name)}
                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center text-xs transition-colors ${
                  isComplete
                    ? "bg-hzl-green border-hzl-green text-white"
                    : "border-border-dark bg-white text-transparent"
                }`}
              >
                &#10003;
              </button>

              <div className="flex-1 min-w-0">
                <span className="text-sm text-charcoal">
                  {field.name}
                  {field.required && <span className="text-hzl-red ml-0.5">*</span>}
                </span>
                <p className="text-xs text-charcoal-light truncate">
                  {autoValue || "(empty)"}
                </p>
              </div>

              {autoValue && (
                <button
                  type="button"
                  onClick={() => handleCopyField(field.name, autoValue)}
                  className="text-xs text-charcoal-light hover:text-charcoal flex-shrink-0 transition-colors"
                >
                  {copiedField === field.name ? "copied" : "copy"}
                </button>
              )}
            </div>
          );
        })}

        {/* Cover letter section */}
        {coverLetter && (
          <div className="mt-4 space-y-2">
            <CoverLetterEditor
              value={coverLetter}
              onChange={onUpdateMaterials}
            />
            <button
              type="button"
              onClick={() => setCoverLetterPasted(true)}
              className={`w-full text-xs py-1.5 rounded border transition-colors ${
                coverLetterPasted
                  ? "bg-hzl-green-bg border-hzl-green text-hzl-green"
                  : "border-border text-charcoal-light hover:border-gold"
              }`}
            >
              {coverLetterPasted ? "Marked as pasted" : "Mark as pasted"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2 rounded bg-charcoal text-cream text-sm font-medium hover:bg-charcoal-mid transition-colors"
        >
          Open Application &#8599;
        </a>
        <button
          type="button"
          onClick={onMarkApplied}
          className="w-full py-2 rounded border border-hzl-green text-hzl-green text-sm font-medium hover:bg-hzl-green-bg transition-colors"
        >
          Mark Applied
        </button>
      </div>
    </div>
  );
}
