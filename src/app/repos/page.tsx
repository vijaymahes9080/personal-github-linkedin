"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ExternalLink,
  Star,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Sparkles,
} from "lucide-react";

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/github/sync");
      const data = await res.json();
      setAccounts(data.accounts || []);
      const allRepos = data.accounts?.flatMap((a: any) => a.repositories) || [];
      setRepositories(allRepos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setSyncing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput.trim(),
          token: tokenInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(`Synced ${data.syncedCount} repositories for @${usernameInput.trim()}`);
        setUsernameInput("");
        setTokenInput("");
        setConnectModalOpen(false);
        fetchRepos();
      } else {
        setFeedback(data.error || "Failed to sync account");
      }
    } catch (err: any) {
      setFeedback(err.message || "Network error");
    } finally {
      setSyncing(false);
    }
  };

  // Distinct languages
  const languages = Array.from(
    new Set(repositories.map((r) => r.primaryLanguage).filter(Boolean))
  ) as string[];

  // Filtered list
  const filtered = repositories.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));

    const matchesLang =
      selectedLanguage === "ALL" || r.primaryLanguage === selectedLanguage;

    const matchesStatus =
      selectedStatus === "ALL" || r.completionStatus === selectedStatus;

    return matchesSearch && matchesLang && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-emerald-400" /> GitHub Repository Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Continuously inspects code dependencies, project architecture, completion health, and reusable components.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setConnectModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tactile-button shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Account</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          {feedback}
        </div>
      )}

      {/* Connected Accounts Strip */}
      {accounts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Connected Accounts:</span>
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
            >
              {acc.avatarUrl && (
                <img src={acc.avatarUrl} alt={acc.username} className="w-4 h-4 rounded-full" />
              )}
              <span>@{acc.username}</span>
              <span className="text-[10px] text-slate-500">({acc.repositories?.length || 0} repos)</span>
              <button
                type="button"
                onClick={() => {
                  setUsernameInput(acc.username);
                  setConnectModalOpen(true);
                }}
                className="ml-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-sans font-semibold transition-colors"
                title="Sync again or update GitHub Token"
              >
                Re-sync / Token
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories by name or keyword..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Language Filter */}
        <div>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="ALL">All Languages ({repositories.length})</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="ALL">All Health Statuses</option>
            <option value="COMPLETED">Completed (80%+ Health)</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PROTOTYPE">Prototype (&lt;50% Health)</option>
          </select>
        </div>
      </div>

      {/* Repositories Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">
          Loading synchronized repositories...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No repositories found matching your filter</p>
          <p className="text-xs text-slate-500">Connect a GitHub account or clear filters to view repositories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((repo) => {
            const deps = JSON.parse(repo.dependencies || "[]").slice(0, 5);
            const missing = JSON.parse(repo.missingDocumentation || "[]");

            const scoreColor =
              repo.structureScore >= 80
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                : repo.structureScore >= 60
                ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                : "bg-rose-500/10 text-rose-300 border-rose-500/20";

            return (
              <div
                key={repo.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-smooth flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link
                          href={`/repos/${repo.id}`}
                          className="text-base font-bold text-white hover:text-emerald-400 transition-colors"
                        >
                          {repo.name}
                        </Link>
                        {repo.primaryLanguage && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                            {repo.primaryLanguage}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${scoreColor}`}>
                          {repo.structureScore}% Health
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {repo.description || "No description provided."}
                      </p>
                    </div>

                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      title="Open on GitHub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Detected Technologies */}
                  {deps.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {deps.map((d: string) => (
                        <span
                          key={d}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800/80 font-mono"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Missing items warning if any */}
                  {missing.length > 0 && (
                    <div className="text-[11px] text-amber-400/90 flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{missing[0]}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" />
                      {repo.forks}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/repos/${repo.id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tactile-button"
                    >
                      Inspect Architecture
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Account Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-400" /> Connect GitHub Account
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Enter any public GitHub username to scan their repositories immediately. Optionally provide a Personal Access Token (PAT) for private repositories and higher rate limits.
            </p>

            <form onSubmit={handleConnectAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  GitHub Username <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. torvalds or your-username"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Personal Access Token (PAT) <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-slate-500">
                    Fixes rate limit errors. Free limit is 5,000 req/hr.
                  </p>
                  <a
                    href="https://github.com/settings/tokens/new?description=PersonalCareerAssistant&scopes=repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-medium"
                  >
                    Generate Free Token ↗
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={syncing}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tactile-button disabled:opacity-50"
                >
                  {syncing ? "Scanning & Syncing..." : "Scan & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
