"use client";

import { Profile } from "@/lib/types";
import { useState } from "react";
import IdentityTab from "@/components/profile/IdentityTab";
import ExperienceTab from "@/components/profile/ExperienceTab";
import SkillsTab from "@/components/profile/SkillsTab";
import BioVariantsTab from "@/components/profile/BioVariantsTab";
import CoverLetterBlocksTab from "@/components/profile/CoverLetterBlocksTab";
import ResumePresetsTab from "@/components/profile/ResumePresetsTab";

const TABS = [
  "Identity",
  "Experience",
  "Skills & Languages",
  "Bio Variants",
  "Cover Letter Blocks",
  "Resume Presets",
] as const;

type TabName = (typeof TABS)[number];

interface Props {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

export default function ProfileEditor({ profile, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>("Identity");

  function renderTab() {
    switch (activeTab) {
      case "Identity":
        return <IdentityTab profile={profile} onUpdate={onUpdate} />;
      case "Experience":
        return <ExperienceTab profile={profile} onUpdate={onUpdate} />;
      case "Skills & Languages":
        return <SkillsTab profile={profile} onUpdate={onUpdate} />;
      case "Bio Variants":
        return <BioVariantsTab profile={profile} onUpdate={onUpdate} />;
      case "Cover Letter Blocks":
        return <CoverLetterBlocksTab profile={profile} onUpdate={onUpdate} />;
      case "Resume Presets":
        return <ResumePresetsTab profile={profile} onUpdate={onUpdate} />;
    }
  }

  return (
    <div>
      {/* Tab nav */}
      <nav className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs font-mono whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-gold text-charcoal"
                : "border-transparent text-charcoal-light hover:text-charcoal hover:border-border-dark"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Active tab content */}
      {renderTab()}
    </div>
  );
}
