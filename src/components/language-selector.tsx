"use client";

import { LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  className?: string;
}

export function LanguageSelector({ value, onChange, label, className }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = LANGUAGES.find((l) => l.code === value);
  const filtered = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <label className="text-xs text-zinc-500 mb-1.5 block font-medium">{label}</label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200 hover:border-zinc-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">{selected?.flag}</span>
          <span>{selected?.name ?? "Select"}</span>
        </span>
        <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-800/60 border border-zinc-700 rounded-md text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500/50"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => { onChange(lang.code); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                  lang.code === value
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-zinc-300 hover:bg-zinc-800/60"
                )}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
