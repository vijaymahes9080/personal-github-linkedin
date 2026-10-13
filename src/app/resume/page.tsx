"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Copy,
  Check,
  Star,
  Trash2,
  Bookmark,
  Sparkles,
  Layers,
  Target,
  ExternalLink,
  Download,
} from "lucide-react";
import { PRESET_ROLES } from "@/lib/roles";

function ResumeStudioInner() {
  const searchParams = useSearchParams();
  const initialRepoId = searchParams.get("repoId") || "";

  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState(initialRepoId);
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [verifiableMetrics, setVerifiableMetrics] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"threeBullet" | "twoLine" | "oneLine" | "detailed">("threeBullet");
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [savedEntries, setSavedEntries] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [ghRes, resumeRes, authRes] = await Promise.all([
        fetch("/api/github/sync").then((r) => r.json()),
        fetch("/api/resume").then((r) => r.json()),
        fetch("/api/auth").then((r) => r.json()),
      ]);

      const allRepos = ghRes.accounts?.flatMap((a: any) => a.repositories) || [];
      setRepos(allRepos);
      if (allRepos.length > 0 && !selectedRepoId) {
        setSelectedRepoId(allRepos[0].id);
      }
      if (authRes.user?.targetRole) {
        setTargetRole(authRes.user.targetRole);
      }
      setSavedEntries(resumeRes.entries || []);
      if (resumeRes.entries?.length > 0 && !currentEntry) {
        setCurrentEntry(resumeRes.entries[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepoId) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: selectedRepoId,
          targetRole,
          verifiableMetrics: verifiableMetrics.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.entry) {
        setCurrentEntry(data.entry);
        loadData();
      }
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/resume?id=${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (id: string, currentFav: boolean) => {
    try {
      await fetch("/api/resume", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFavorite: !currentFav }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-400" /> ATS Resume Content Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Generates action-verb optimized, ATS-friendly project summaries with strict length control. Preserves verified facts with zero hallucinated numbers.
        </p>
      </div>

      {/* Generator Controls Card */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" /> Project Resume Entry Generator
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Repository Select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Project</label>
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.primaryLanguage || "Repo"})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Role Select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Role Alignment</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {PRESET_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Verifiable Metric Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Verifiable Metric / Milestone <span className="text-slate-500 font-normal">(Optional, only if grounded in reality)</span>
            </label>
            <input
              type="text"
              value={verifiableMetrics}
              onChange={(e) => setVerifiableMetrics(e.target.value)}
              placeholder="e.g. Handled 5,000+ benchmark requests; 94% test coverage; 50+ GitHub stars"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating || !selectedRepoId}
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs tactile-button disabled:opacity-50 shadow-md shadow-purple-500/10"
            >
              {generating ? "Formatting ATS Resume..." : "Generate ATS Resume Entry"}
            </button>
          </div>
        </form>
      </section>

      {/* Live Result Display with Strict Length Switcher */}
      {currentEntry && (
        <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-purple-400 font-mono font-medium">Generated ATS Entry</span>
              <h2 className="text-lg font-bold text-white">{currentEntry.projectTitle}</h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Target: {currentEntry.targetRole} • Technologies: {Array.isArray(currentEntry.technologies) ? currentEntry.technologies.slice(0, 5).join(", ") : currentEntry.technologies}
              </div>
            </div>

            {/* Strict Length Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("threeBullet")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-smooth ${
                  activeTab === "threeBullet"
                    ? "bg-purple-500/20 text-purple-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Three-Bullet
              </button>
              <button
                onClick={() => setActiveTab("twoLine")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-smooth ${
                  activeTab === "twoLine"
                    ? "bg-purple-500/20 text-purple-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Two-Line
              </button>
              <button
                onClick={() => setActiveTab("oneLine")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-smooth ${
                  activeTab === "oneLine"
                    ? "bg-purple-500/20 text-purple-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                One-Line
              </button>
              <button
                onClick={() => setActiveTab("detailed")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-smooth ${
                  activeTab === "detailed"
                    ? "bg-purple-500/20 text-purple-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Detailed
              </button>
            </div>
          </div>

          {/* Tab Content Box */}
          <div className="relative p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs leading-relaxed text-slate-200">
            {activeTab === "threeBullet" && (
              <div className="space-y-2">
                <div className="font-bold text-white text-sm mb-2">{currentEntry.projectTitle}</div>
                {Array.isArray(currentEntry.threeBulletVersion) ? (
                  currentEntry.threeBulletVersion.map((bullet: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{bullet}</span>
                    </div>
                  ))
                ) : (
                  <div>{currentEntry.threeBulletVersion}</div>
                )}
              </div>
            )}

            {activeTab === "twoLine" && (
              <div className="whitespace-pre-line space-y-1">
                <div className="font-bold text-white text-sm mb-1">{currentEntry.projectTitle}</div>
                {currentEntry.twoLineVersion}
              </div>
            )}

            {activeTab === "oneLine" && (
              <div>
                <div className="font-bold text-white text-sm mb-1">{currentEntry.projectTitle}</div>
                {currentEntry.oneLineVersion}
              </div>
            )}

            {activeTab === "detailed" && (
              <div className="whitespace-pre-line">
                {currentEntry.detailedVersion}
              </div>
            )}

            {/* Copy Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => {
                  let textToCopy = "";
                  if (activeTab === "threeBullet") {
                    const bullets = Array.isArray(currentEntry.threeBulletVersion)
                      ? currentEntry.threeBulletVersion.map((b: string) => `• ${b}`).join("\n")
                      : currentEntry.threeBulletVersion;
                    textToCopy = `${currentEntry.projectTitle}\n${bullets}`;
                  } else if (activeTab === "twoLine") {
                    textToCopy = `${currentEntry.projectTitle}\n${currentEntry.twoLineVersion}`;
                  } else if (activeTab === "oneLine") {
                    textToCopy = `${currentEntry.projectTitle}: ${currentEntry.oneLineVersion}`;
                  } else {
                    textToCopy = currentEntry.detailedVersion;
                  }
                  copyToClipboard(textToCopy, "current");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium tactile-button border border-slate-700"
              >
                {copiedKey === "current" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Version</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Saved Resume Drafts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" /> Saved Resume Library ({savedEntries.length})
          </h2>
          <a
            href="/api/export?format=csv"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono"
            download
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-smooth space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{entry.projectTitle}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Role: {entry.targetRole}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(entry.id, entry.isFavorite)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        entry.isFavorite ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                      }`}
                      title="Favorite"
                    >
                      <Star className={`w-4 h-4 ${entry.isFavorite ? "fill-amber-400" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {entry.oneLineVersion}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => setCurrentEntry(entry)}
                  className="text-purple-400 hover:underline font-medium"
                >
                  View in Studio
                </button>

                <button
                  onClick={() => {
                    const bullets = Array.isArray(entry.threeBulletVersion)
                      ? entry.threeBulletVersion.map((b: string) => `• ${b}`).join("\n")
                      : entry.threeBulletVersion;
                    copyToClipboard(`${entry.projectTitle}\n${bullets}`, entry.id);
                  }}
                  className="flex items-center gap-1 text-slate-400 hover:text-white font-mono"
                >
                  {copiedKey === entry.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === entry.id ? "Copied" : "Copy 3 Bullets"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ResumeStudioPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-slate-500">Loading Resume Studio...</div>}>
      <ResumeStudioInner />
    </Suspense>
  );
}
