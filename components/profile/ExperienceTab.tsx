"use client";

import { Profile, Education, Experience } from "@/lib/types";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Props {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

function EducationCard({
  edu,
  onSave,
  onDelete,
  onCancel,
  isEditing,
  onStartEdit,
}: {
  edu: Education;
  onSave: (e: Education) => void;
  onDelete: () => void;
  onCancel: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
}) {
  const [draft, setDraft] = useState<Education>(edu);

  if (!isEditing) {
    return (
      <div className="flex items-start justify-between gap-3 py-3 px-3 rounded hover:bg-cream-dark/50 transition-colors group">
        <div className="min-w-0">
          <p className="text-sm font-sans font-medium text-charcoal">
            {edu.degree} in {edu.field}
          </p>
          <p className="text-xs font-sans text-charcoal-light">
            {edu.school} &middot; {edu.graduationYear}
          </p>
          {edu.notes && (
            <p className="text-xs font-sans text-charcoal-light mt-1">
              {edu.notes}
            </p>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onStartEdit}
            className="text-xs text-charcoal-light hover:text-gold transition-colors"
          >
            edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-charcoal-light hover:text-hzl-red transition-colors"
          >
            delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded p-3 space-y-2">
      <input
        className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
        placeholder="School"
        value={draft.school}
        onChange={(e) => setDraft({ ...draft, school: e.target.value })}
      />
      <div className="flex gap-2">
        <input
          className="flex-1 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="Degree"
          value={draft.degree}
          onChange={(e) => setDraft({ ...draft, degree: e.target.value })}
        />
        <input
          className="flex-1 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="Field"
          value={draft.field}
          onChange={(e) => setDraft({ ...draft, field: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <input
          className="w-32 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="Grad year"
          value={draft.graduationYear}
          onChange={(e) =>
            setDraft({ ...draft, graduationYear: e.target.value })
          }
        />
        <input
          className="flex-1 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="Notes"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(draft)}
          className="text-xs text-charcoal-light hover:text-gold transition-colors"
        >
          save
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-charcoal-light hover:text-hzl-red transition-colors"
        >
          cancel
        </button>
      </div>
    </div>
  );
}

function ExperienceCard({
  exp,
  onSave,
  onDelete,
  onCancel,
  isEditing,
  onStartEdit,
}: {
  exp: Experience;
  onSave: (e: Experience) => void;
  onDelete: () => void;
  onCancel: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
}) {
  const [draft, setDraft] = useState<Experience>(exp);

  if (!isEditing) {
    return (
      <div className="flex items-start justify-between gap-3 py-3 px-3 rounded hover:bg-cream-dark/50 transition-colors group">
        <div className="min-w-0">
          <p className="text-sm font-sans font-medium text-charcoal">
            {exp.title}
          </p>
          <p className="text-xs font-sans text-charcoal-light">
            {exp.org} &middot; {exp.startDate} &ndash; {exp.endDate}
          </p>
          {exp.description && (
            <p className="text-xs font-sans text-charcoal-light mt-1 leading-relaxed">
              {exp.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={onStartEdit}
            className="text-xs text-charcoal-light hover:text-gold transition-colors"
          >
            edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-charcoal-light hover:text-hzl-red transition-colors"
          >
            delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded p-3 space-y-2">
      <div className="flex gap-2">
        <input
          className="flex-1 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="Title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <input
          className="flex-1 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="Organization"
          value={draft.org}
          onChange={(e) => setDraft({ ...draft, org: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <input
          className="w-32 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="Start date"
          value={draft.startDate}
          onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
        />
        <input
          className="w-32 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
          placeholder="End date"
          value={draft.endDate}
          onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
        />
      </div>
      <textarea
        className="w-full bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
        rows={3}
        placeholder="Description"
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
      />
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(draft)}
          className="text-xs text-charcoal-light hover:text-gold transition-colors"
        >
          save
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-charcoal-light hover:text-hzl-red transition-colors"
        >
          cancel
        </button>
      </div>
    </div>
  );
}

export default function ExperienceTab({ profile, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  function saveEducation(updated: Education) {
    const exists = profile.education.some((e) => e.id === updated.id);
    const education = exists
      ? profile.education.map((e) => (e.id === updated.id ? updated : e))
      : [...profile.education, updated];
    onUpdate({ ...profile, education });
    setEditingId(null);
  }

  function deleteEducation(id: string) {
    onUpdate({
      ...profile,
      education: profile.education.filter((e) => e.id !== id),
    });
  }

  function addEducation() {
    const newEdu: Education = {
      id: uuidv4(),
      school: "",
      degree: "",
      field: "",
      graduationYear: "",
      notes: "",
    };
    onUpdate({ ...profile, education: [...profile.education, newEdu] });
    setEditingId(newEdu.id);
  }

  function saveExperience(updated: Experience) {
    const exists = profile.experience.some((e) => e.id === updated.id);
    const experience = exists
      ? profile.experience.map((e) => (e.id === updated.id ? updated : e))
      : [...profile.experience, updated];
    onUpdate({ ...profile, experience });
    setEditingId(null);
  }

  function deleteExperience(id: string) {
    onUpdate({
      ...profile,
      experience: profile.experience.filter((e) => e.id !== id),
    });
  }

  function addExperience() {
    const newExp: Experience = {
      id: uuidv4(),
      title: "",
      org: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    onUpdate({ ...profile, experience: [...profile.experience, newExp] });
    setEditingId(newExp.id);
  }

  return (
    <div className="space-y-8">
      {/* Education */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-charcoal-light uppercase tracking-wide">
            Education
          </h3>
          <button
            onClick={addEducation}
            className="text-xs font-mono text-charcoal-light hover:text-gold transition-colors"
          >
            + add
          </button>
        </div>
        <div className="space-y-1">
          {profile.education.map((edu) => (
            <EducationCard
              key={edu.id}
              edu={edu}
              isEditing={editingId === edu.id}
              onStartEdit={() => setEditingId(edu.id)}
              onSave={saveEducation}
              onDelete={() => deleteEducation(edu.id)}
              onCancel={() => setEditingId(null)}
            />
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-charcoal-light uppercase tracking-wide">
            Experience
          </h3>
          <button
            onClick={addExperience}
            className="text-xs font-mono text-charcoal-light hover:text-gold transition-colors"
          >
            + add
          </button>
        </div>
        <div className="space-y-1">
          {profile.experience.map((exp) => (
            <ExperienceCard
              key={exp.id}
              exp={exp}
              isEditing={editingId === exp.id}
              onStartEdit={() => setEditingId(exp.id)}
              onSave={saveExperience}
              onDelete={() => deleteExperience(exp.id)}
              onCancel={() => setEditingId(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
