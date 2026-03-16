"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LanguageSelector } from "@/components/language-selector";
import { Plus, Trash2, Edit2, X, Save, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "../../../../convex/_generated/dataModel";

interface GlossaryEntry {
  source: string;
  target: string;
}

export default function GlossariesPage() {
  const glossaries = useQuery(api.glossaries.getByUser);
  const createGlossary = useMutation(api.glossaries.create);
  const updateGlossary = useMutation(api.glossaries.update);
  const removeGlossary = useMutation(api.glossaries.remove);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<Id<"glossaries"> | null>(null);
  const [name, setName] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [entries, setEntries] = useState<GlossaryEntry[]>([{ source: "", target: "" }]);

  const handleCreate = async () => {
    const validEntries = entries.filter((e) => e.source.trim() && e.target.trim());
    if (!name.trim() || validEntries.length === 0) return;

    await createGlossary({ name, sourceLang, targetLang, entries: validEntries });
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const validEntries = entries.filter((e) => e.source.trim() && e.target.trim());
    await updateGlossary({ id: editingId, name, entries: validEntries });
    resetForm();
  };

  const startEdit = (glossary: NonNullable<typeof glossaries>[number]) => {
    setEditingId(glossary._id);
    setName(glossary.name);
    setSourceLang(glossary.sourceLang);
    setTargetLang(glossary.targetLang);
    setEntries(glossary.entries.length > 0 ? glossary.entries : [{ source: "", target: "" }]);
    setShowCreate(true);
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setName("");
    setSourceLang("en");
    setTargetLang("es");
    setEntries([{ source: "", target: "" }]);
  };

  const addEntry = () => setEntries([...entries, { source: "", target: "" }]);

  const updateEntry = (index: number, field: "source" | "target", value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const removeEntry = (index: number) => {
    if (entries.length <= 1) return;
    setEntries(entries.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
            Glossaries
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Custom terminology overrides for consistent translations.
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            <Plus className="w-4 h-4" />
            New Glossary
          </button>
        )}
      </div>

      {showCreate && (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-200">
              {editingId ? "Edit Glossary" : "New Glossary"}
            </h2>
            <button onClick={resetForm} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Glossary name"
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-blue-500/50"
          />

          <div className="flex gap-3">
            <LanguageSelector value={sourceLang} onChange={setSourceLang} label="Source" className="flex-1" />
            <LanguageSelector value={targetLang} onChange={setTargetLang} label="Target" className="flex-1" />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs text-zinc-500 font-medium px-1">
              <span>Source Term</span>
              <span>Target Term</span>
              <span />
            </div>
            {entries.map((entry, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2">
                <input
                  type="text"
                  value={entry.source}
                  onChange={(e) => updateEntry(i, "source", e.target.value)}
                  placeholder="Original term"
                  className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-blue-500/50"
                />
                <input
                  type="text"
                  value={entry.target}
                  onChange={(e) => updateEntry(i, "target", e.target.value)}
                  placeholder="Translated term"
                  className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={() => removeEntry(i)}
                  disabled={entries.length <= 1}
                  className="flex items-center justify-center text-zinc-600 hover:text-red-400 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={addEntry}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Add entry
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">
              Cancel
            </button>
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
            >
              <Save className="w-4 h-4" />
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {glossaries === undefined ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />)}
        </div>
      ) : glossaries.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-12 text-center">
          <BookOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No glossaries yet. Create one to ensure consistent terminology.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {glossaries.map((g: any) => (
            <div key={g._id} className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">{g.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {g.sourceLang} → {g.targetLang} · {g.entries.length} entries
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(g)}
                    className="p-2 text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeGlossary({ id: g._id })}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {g.entries.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {g.entries.slice(0, 5).map((e: any, i: number) => (
                    <div key={i} className="contents">
                      <span className="text-zinc-400">{e.source}</span>
                      <span className="text-zinc-300">→ {e.target}</span>
                    </div>
                  ))}
                  {g.entries.length > 5 && (
                    <span className="text-zinc-600 col-span-2">
                      +{g.entries.length - 5} more entries
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
