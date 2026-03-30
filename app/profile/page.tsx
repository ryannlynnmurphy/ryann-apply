"use client";

import { useState, useEffect } from "react";
import { Profile } from "@/lib/types";
import { loadState, updateState, resetState } from "@/lib/storage";
import ProfileEditor from "@/components/ProfileEditor";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const state = loadState();
    setProfile(state.profile);
  }, []);

  function handleUpdate(updated: Profile) {
    setProfile(updated);
    updateState((state) => ({ ...state, profile: updated }));
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-charcoal-light font-mono text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gold text-[9px] tracking-[0.25em] uppercase font-mono mb-1">
          Profile
        </p>
        <h2 className="font-display text-2xl font-bold text-charcoal mb-1">
          Your Details
        </h2>
        <p className="text-sm font-sans text-charcoal-light">
          Everything here auto-fills into your applications.
        </p>
      </div>

      {/* Editor */}
      <div className="bg-white border border-border rounded-lg p-6">
        <ProfileEditor profile={profile} onUpdate={handleUpdate} />
      </div>

      {/* Reset */}
      <div className="mt-8 pt-6 border-t border-border">
        <button
          onClick={() => {
            if (confirm("Reset all data to defaults? This will clear your application history and reload fresh job data.")) {
              const fresh = resetState();
              setProfile(fresh.profile);
              window.location.reload();
            }
          }}
          className="text-xs text-charcoal-light hover:text-hzl-red transition-colors"
        >
          Reset all data to defaults
        </button>
      </div>
    </div>
  );
}
