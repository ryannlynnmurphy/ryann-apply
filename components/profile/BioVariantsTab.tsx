"use client";

import { Profile, BioVariant } from "@/lib/types";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Props {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export default function BioVariantsTab({ profile, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftText, setDraftText] = useState("");

  function startEdit(bio: BioVariant) {
    setEditingId(bio.id);
    setDraftLabel(bio.label);
    setDraftText(bio.text);
  }

  function save() {
    if (!editingId) return;
    const updated: BioVariant = {
      id: editingId,
      label: draftLabel,
      text: draftText,
    };
    const exists = profile.bioVariants.some((b) => b.id === editingId);
    const bioVariants = exists
      ? profile.bioVariants.map((b) => (b.id === editingId ? updated : b))
      : [...profile.bioVariants, updated];
    onUpdate({ ...profile, bioVariants });
    setEditingId(null);
  }

  function addNew() {
    const id = uuidv4();
    setEditingId(id);
    setDraftLabel("");
    setDraftText("");
  }

  function deleteBio(id: string) {
    onUpdate({
      ...profile,
      bioVariants: profile.bioVariants.filter((b) => b.id !== id),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono text-charcoal-light uppercase tracking-wide">
          Bio Variants
        </h3>
        <button
          onClick={addNew}
          className="text-xs font-mono text-charcoal-light hover:text-gold transition-colors"
        >
          + add new
        </button>
      </div>

      <div className="space-y-3">
        {profile.bioVariants.map((bio) =>
          editingId === bio.id ? (
            <div
              key={bio.id}
              className="bg-white border border-border rounded p-3 space-y-2"
            >
              <input
                autoFocus
                className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="Label (e.g. Tech-forward)"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
              />
              <textarea
                className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
                rows={4}
                placeholder="Bio text"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
              />
              <div className="flex gap-2">
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
          ) : (
            <div
              key={bio.id}
              className="py-3 px-3 rounded hover:bg-cream-dark/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-sans font-medium text-charcoal mb-1">
                    {bio.label}
                  </p>
                  <p className="text-xs font-sans text-charcoal-light leading-relaxed">
                    {bio.text}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => startEdit(bio)}
                    className="text-xs text-charcoal-light hover:text-gold transition-colors"
                  >
                    edit
                  </button>
                  <button
                    onClick={() => deleteBio(bio.id)}
                    className="text-xs text-charcoal-light hover:text-hzl-red transition-colors"
                  >
                    delete
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* Render new bio form if editingId doesn't match any existing bio */}
        {editingId &&
          !profile.bioVariants.some((b) => b.id === editingId) && (
            <div className="bg-white border border-border rounded p-3 space-y-2">
              <input
                autoFocus
                className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
                placeholder="Label (e.g. Tech-forward)"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
              />
              <textarea
                className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
                rows={4}
                placeholder="Bio text"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
              />
              <div className="flex gap-2">
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
          )}
      </div>
    </div>
  );
}
