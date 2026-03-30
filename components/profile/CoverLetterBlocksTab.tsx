"use client";

import { Profile, CoverLetterBlock } from "@/lib/types";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const AVAILABLE_TAGS = [
  "ai-safety",
  "copywriting",
  "community",
  "devrel",
  "fellowship",
  "general",
];

interface Props {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export default function CoverLetterBlocksTab({ profile, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>([]);

  function startEdit(block: CoverLetterBlock) {
    setEditingId(block.id);
    setDraftLabel(block.label);
    setDraftText(block.text);
    setDraftTags([...block.tags]);
  }

  function toggleTag(tag: string) {
    setDraftTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function save() {
    if (!editingId) return;
    const updated: CoverLetterBlock = {
      id: editingId,
      label: draftLabel,
      text: draftText,
      tags: draftTags,
    };
    const exists = profile.coverLetterBlocks.some((b) => b.id === editingId);
    const coverLetterBlocks = exists
      ? profile.coverLetterBlocks.map((b) =>
          b.id === editingId ? updated : b
        )
      : [...profile.coverLetterBlocks, updated];
    onUpdate({ ...profile, coverLetterBlocks });
    setEditingId(null);
  }

  function addNew() {
    const id = uuidv4();
    setEditingId(id);
    setDraftLabel("");
    setDraftText("");
    setDraftTags([]);
  }

  function deleteBlock(id: string) {
    onUpdate({
      ...profile,
      coverLetterBlocks: profile.coverLetterBlocks.filter((b) => b.id !== id),
    });
  }

  function renderForm() {
    return (
      <div className="bg-white border border-border rounded p-3 space-y-2">
        <input
          autoFocus
          className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="Label (e.g. Hazel build)"
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
        />
        <textarea
          className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
          rows={4}
          placeholder="Paragraph text"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                draftTags.includes(tag)
                  ? "bg-charcoal text-cream border border-charcoal"
                  : "border border-border text-charcoal-light hover:border-gold"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            className="text-xs text-charcoal-light hover:text-gold transition-colors"
          >
            save
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="text-xs text-charcoal-light hover:text-hzl-red transition-colors"
          >
            cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono text-charcoal-light uppercase tracking-wide">
          Cover Letter Blocks
        </h3>
        <button
          onClick={addNew}
          className="text-xs font-mono text-charcoal-light hover:text-gold transition-colors"
        >
          + add new
        </button>
      </div>

      <div className="space-y-3">
        {profile.coverLetterBlocks.map((block) =>
          editingId === block.id ? (
            <div key={block.id}>{renderForm()}</div>
          ) : (
            <div
              key={block.id}
              className="py-3 px-3 rounded hover:bg-cream-dark/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-sans font-medium text-charcoal mb-1">
                    {block.label}
                  </p>
                  <p className="text-xs font-sans text-charcoal-light leading-relaxed mb-2">
                    {block.text}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {block.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal text-cream"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => startEdit(block)}
                    className="text-xs text-charcoal-light hover:text-gold transition-colors"
                  >
                    edit
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="text-xs text-charcoal-light hover:text-hzl-red transition-colors"
                  >
                    delete
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {editingId &&
          !profile.coverLetterBlocks.some((b) => b.id === editingId) &&
          renderForm()}
      </div>
    </div>
  );
}
