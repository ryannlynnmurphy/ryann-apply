"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Job, ApplyTier } from "@/lib/types";

const CATEGORIES = [
  "ai-safety",
  "copywriting",
  "community",
  "devrel",
  "fellowship",
  "general",
] as const;

interface JobFormProps {
  onAdd: (job: Job) => void;
  onClose: () => void;
}

interface ParsedData {
  title: string;
  company: string;
  location: string;
  description: string;
  applyTier: ApplyTier;
}

export default function JobForm({ onAdd, onClose }: JobFormProps) {
  const [url, setUrl] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [parsed, setParsed] = useState<ParsedData | null>(null);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[5]);
  const [description, setDescription] = useState("");
  const [applyTier, setApplyTier] = useState<ApplyTier>("guided");

  async function handleParse() {
    if (!url.trim()) return;
    setParsing(true);
    setParseError("");

    try {
      const res = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (data.error) {
        setParseError(data.error);
        return;
      }

      setParsed(data);
      setTitle(data.title || "");
      setCompany(data.company || "");
      setLocation(data.location || "");
      setDescription(data.description || "");
      setApplyTier(data.applyTier || "guided");
    } catch {
      setParseError("Failed to parse job URL");
    } finally {
      setParsing(false);
    }
  }

  function handleAdd() {
    const job: Job = {
      id: uuidv4(),
      title,
      company,
      location,
      remote: false,
      url: url.trim(),
      source: "manual",
      category,
      description,
      requirements: [],
      matchScore: 0,
      whyYou: [],
      applyTier,
      status: "new",
    };
    onAdd(job);
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-cream px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-light/50 focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-lg w-full rounded-xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-bold text-charcoal mb-4">
          Add Job by URL
        </h3>

        {/* URL input + parse */}
        <div className="flex gap-2 mb-3">
          <input
            type="url"
            placeholder="Paste job listing URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleParse()}
            className={`${inputClass} flex-1`}
          />
          <button
            onClick={handleParse}
            disabled={parsing || !url.trim()}
            className="rounded-lg bg-charcoal text-cream text-sm px-4 py-2 hover:bg-charcoal-mid transition-colors disabled:opacity-50"
          >
            {parsing ? "..." : "Parse"}
          </button>
        </div>

        {parseError && (
          <p className="text-red-500 text-xs mb-3">{parseError}</p>
        )}

        {/* Editable fields (shown after parsing) */}
        {parsed && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1 block">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1 block">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1 block">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-1 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={inputClass}
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!title.trim()}
              className="w-full rounded-lg bg-charcoal text-cream text-sm px-4 py-2.5 font-medium hover:bg-charcoal-mid transition-colors disabled:opacity-50"
            >
              Add to Discovery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
