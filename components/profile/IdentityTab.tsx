"use client";

import { Profile } from "@/lib/types";
import { useState } from "react";

const FIELDS: { key: keyof Profile; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "website", label: "Website" },
];

interface Props {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export default function IdentityTab({ profile, onUpdate }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  function startEdit(key: string) {
    setEditing(key);
    setDraft(profile[key as keyof Profile] as string);
  }

  function saveEdit(key: string) {
    onUpdate({ ...profile, [key]: draft });
    setEditing(null);
  }

  function cancelEdit() {
    setEditing(null);
  }

  function copyField(key: string) {
    const value = profile[key as keyof Profile] as string;
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function copyAll() {
    const text = FIELDS.map(
      (f) => `${f.label}: ${profile[f.key as keyof Profile] as string}`
    ).join("\n");
    navigator.clipboard.writeText(text);
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-1">
      {FIELDS.map(({ key, label }) => (
        <div
          key={key}
          className="flex items-center gap-3 py-2.5 px-3 rounded hover:bg-cream-dark/50 transition-colors group"
        >
          <span className="w-20 shrink-0 text-xs font-mono text-charcoal-light uppercase tracking-wide">
            {label}
          </span>

          {editing === key ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                className="flex-1 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(key);
                  if (e.key === "Escape") cancelEdit();
                }}
              />
              <button
                onClick={() => saveEdit(key)}
                className="text-xs text-charcoal-light hover:text-gold transition-colors"
              >
                save
              </button>
              <button
                onClick={cancelEdit}
                className="text-xs text-charcoal-light hover:text-hzl-red transition-colors"
              >
                cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className="flex-1 text-sm font-sans text-charcoal truncate cursor-pointer hover:text-gold transition-colors"
                onClick={() => startEdit(key)}
                title="Click to edit"
              >
                {(profile[key as keyof Profile] as string) || (
                  <span className="text-charcoal-light italic">empty</span>
                )}
              </span>
              <button
                onClick={() => copyField(key)}
                className="text-xs text-charcoal-light hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
              >
                {copied === key ? "copied" : "copy"}
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="pt-4 border-t border-border mt-4">
        <button
          onClick={copyAll}
          className="text-xs font-mono text-charcoal-light hover:text-gold transition-colors"
        >
          {copied === "all" ? "copied all" : "copy all"}
        </button>
      </div>
    </div>
  );
}
