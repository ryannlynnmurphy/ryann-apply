"use client";

import { Profile } from "@/lib/types";
import { useState } from "react";

interface Props {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export default function SkillsTab({ profile, onUpdate }: Props) {
  const [newSkill, setNewSkill] = useState("");
  const [newLang, setNewLang] = useState("");

  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed || profile.skills.includes(trimmed)) return;
    onUpdate({ ...profile, skills: [...profile.skills, trimmed] });
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    onUpdate({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
  }

  function addLanguage() {
    const trimmed = newLang.trim();
    if (!trimmed || profile.languages.includes(trimmed)) return;
    onUpdate({ ...profile, languages: [...profile.languages, trimmed] });
    setNewLang("");
  }

  function removeLanguage(lang: string) {
    onUpdate({
      ...profile,
      languages: profile.languages.filter((l) => l !== lang),
    });
  }

  return (
    <div className="space-y-8">
      {/* Skills */}
      <div>
        <h3 className="text-xs font-mono text-charcoal-light uppercase tracking-wide mb-3">
          Skills
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans bg-gold/15 text-charcoal border border-gold/30"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="text-charcoal-light hover:text-hzl-red transition-colors leading-none"
                title="Remove"
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
            placeholder="Add a skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addSkill();
            }}
          />
          <button
            onClick={addSkill}
            className="text-xs font-mono text-charcoal-light hover:text-gold transition-colors px-2"
          >
            + add
          </button>
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-xs font-mono text-charcoal-light uppercase tracking-wide mb-3">
          Languages
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans bg-hzl-blue-bg text-hzl-blue border border-hzl-blue/30"
            >
              {lang}
              <button
                onClick={() => removeLanguage(lang)}
                className="text-hzl-blue/60 hover:text-hzl-red transition-colors leading-none"
                title="Remove"
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white border border-border rounded px-2.5 py-1.5 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors"
            placeholder="Add a language"
            value={newLang}
            onChange={(e) => setNewLang(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addLanguage();
            }}
          />
          <button
            onClick={addLanguage}
            className="text-xs font-mono text-charcoal-light hover:text-gold transition-colors px-2"
          >
            + add
          </button>
        </div>
      </div>
    </div>
  );
}
