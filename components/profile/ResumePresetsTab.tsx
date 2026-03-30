"use client";

import { Profile, ResumePreset } from "@/lib/types";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Props {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export default function ResumePresetsTab({ profile, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftBioVariant, setDraftBioVariant] = useState("");
  const [draftSkills, setDraftSkills] = useState<string[]>([]);

  function startEdit(preset: ResumePreset) {
    setEditingId(preset.id);
    setDraftLabel(preset.label);
    setDraftBioVariant(preset.defaultBioVariant);
    setDraftSkills([...preset.skills]);
  }

  function toggleSkill(skill: string) {
    setDraftSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function save() {
    if (!editingId) return;
    const updated: ResumePreset = {
      id: editingId,
      label: draftLabel,
      leadWith: [],
      skills: draftSkills,
      defaultBioVariant: draftBioVariant,
    };
    // Preserve existing leadWith if editing
    const existing = profile.resumePresets.find((p) => p.id === editingId);
    if (existing) {
      updated.leadWith = existing.leadWith;
    }

    const exists = profile.resumePresets.some((p) => p.id === editingId);
    const resumePresets = exists
      ? profile.resumePresets.map((p) => (p.id === editingId ? updated : p))
      : [...profile.resumePresets, updated];
    onUpdate({ ...profile, resumePresets });
    setEditingId(null);
  }

  function addNew() {
    const id = uuidv4();
    setEditingId(id);
    setDraftLabel("");
    setDraftBioVariant(profile.bioVariants[0]?.id ?? "");
    setDraftSkills([]);
  }

  function deletePreset(id: string) {
    onUpdate({
      ...profile,
      resumePresets: profile.resumePresets.filter((p) => p.id !== id),
    });
  }

  function getBioLabel(id: string): string {
    return profile.bioVariants.find((b) => b.id === id)?.label ?? id;
  }

  function renderForm() {
    return (
      <div className="bg-white border border-border rounded p-3 space-y-3">
        <input
          autoFocus
          className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="Preset label (e.g. AI / Safety)"
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
        />

        <div>
          <label className="text-xs font-mono text-charcoal-light uppercase tracking-wide block mb-1.5">
            Default Bio Variant
          </label>
          <select
            className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
            value={draftBioVariant}
            onChange={(e) => setDraftBioVariant(e.target.value)}
          >
            {profile.bioVariants.map((bv) => (
              <option key={bv.id} value={bv.id}>
                {bv.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-charcoal-light uppercase tracking-wide block mb-1.5">
            Highlighted Skills
          </label>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-2 py-0.5 rounded text-xs font-sans transition-colors ${
                  draftSkills.includes(skill)
                    ? "bg-charcoal text-cream border border-charcoal"
                    : "border border-border text-charcoal-light hover:border-gold"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
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
          Resume Presets
        </h3>
        <button
          onClick={addNew}
          className="text-xs font-mono text-charcoal-light hover:text-gold transition-colors"
        >
          + add new
        </button>
      </div>

      <div className="space-y-3">
        {profile.resumePresets.map((preset) =>
          editingId === preset.id ? (
            <div key={preset.id}>{renderForm()}</div>
          ) : (
            <div
              key={preset.id}
              className="py-3 px-3 rounded hover:bg-cream-dark/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-sans font-medium text-charcoal mb-1">
                    {preset.label}
                  </p>
                  <p className="text-xs font-mono text-charcoal-light mb-2">
                    bio: {getBioLabel(preset.defaultBioVariant)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {preset.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded text-[10px] font-sans bg-gold/15 text-charcoal border border-gold/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => startEdit(preset)}
                    className="text-xs text-charcoal-light hover:text-gold transition-colors"
                  >
                    edit
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
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
          !profile.resumePresets.some((p) => p.id === editingId) &&
          renderForm()}
      </div>
    </div>
  );
}
