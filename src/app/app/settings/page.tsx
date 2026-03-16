"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { LanguageSelector } from "@/components/language-selector";
import { Save, Loader2, User } from "lucide-react";

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(api.users.getCurrent);
  const updatePreferences = useMutation(api.users.updatePreferences);

  const [defaultSource, setDefaultSource] = useState("en");
  const [defaultTarget, setDefaultTarget] = useState("es");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (convexUser?.preferences) {
      setDefaultSource(convexUser.preferences.defaultSourceLang);
      setDefaultTarget(convexUser.preferences.defaultTargetLang);
    }
  }, [convexUser]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updatePreferences({
        defaultSourceLang: defaultSource,
        defaultTargetLang: defaultTarget,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
          Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account and preferences.</p>
      </div>

      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-zinc-200">Account</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block font-medium">Name</label>
            <div className="px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-300">
              {clerkUser?.fullName ?? convexUser?.name ?? "—"}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block font-medium">Email</label>
            <div className="px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-300">
              {clerkUser?.primaryEmailAddress?.emailAddress ?? convexUser?.email ?? "—"}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block font-medium">Plan</label>
            <div className="px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-300 capitalize">
              {convexUser?.plan ?? "free"}
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          To update your name, email, or password, manage your account via Clerk.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 space-y-5">
        <h2 className="text-base font-semibold text-zinc-200">Default Languages</h2>
        <p className="text-xs text-zinc-500">Set your preferred source and target languages for new translations.</p>

        <div className="flex flex-col sm:flex-row gap-4">
          <LanguageSelector
            value={defaultSource}
            onChange={setDefaultSource}
            label="Default Source"
            className="flex-1"
          />
          <LanguageSelector
            value={defaultTarget}
            onChange={setDefaultTarget}
            label="Default Target"
            className="flex-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
          {saved && <span className="text-xs text-emerald-400">Saved</span>}
        </div>
      </div>
    </div>
  );
}
