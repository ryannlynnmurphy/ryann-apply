"use client";

import { useState, useCallback } from "react";

interface CoverLetterEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CoverLetterEditor({ value, onChange }: CoverLetterEditorProps) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <div className="border border-border rounded p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-charcoal-light">
          Cover Letter
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="text-xs text-charcoal-light hover:text-charcoal transition-colors"
          >
            {editing ? "done" : "edit"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-charcoal-light hover:text-charcoal transition-colors"
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          rows={15}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm leading-relaxed border border-border rounded p-2 bg-cream font-sans resize-y focus:outline-none focus:border-gold"
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap leading-relaxed text-charcoal">
          {value || "(no cover letter generated)"}
        </p>
      )}
    </div>
  );
}
