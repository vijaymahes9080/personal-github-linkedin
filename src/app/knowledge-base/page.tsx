"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  Search,
  Download,
  Filter,
  RefreshCw,
  FolderGit2,
  Linkedin,
  FileText,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Database,
  ExternalLink,
} from "lucide-react";

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [data, setData] = useState<{
    repos: any[];
    facts: any[];
    resumes: any[];
    syncLogs: any[];
  }>({ repos: [], facts: [], resumes: [], syncLogs: [] });
  const [loading, setLoading] = useState(true);

  const loadAllKnowledge = async () => {
    try {
      setLoading(true);
      const [ghRes, factsRes, resumeRes] = await Promise.all([
        fetch("/api/github/sync").then((r) => r.json()),
        fetch("/api/linkedin/facts").then((r) => r.json()),
        fetch("/api/resume").then((r) => r.json()),
      ]);

      const allRepos = ghRes.accounts?.flatMap((a: any) => a.repositories) || [];
      setData({
        repos: allRepos,
        facts: factsRes.facts || [],
        resumes: resumeRes.entries || [],
        syncLogs: ghRes.recentLogs || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllKnowledge();
  }, []);

  // Filtered lists
  const query = search.toLowerCase();

  const filteredRepos = data.repos.filter(
    (r) =>
      r.name.toLowerCase().includes(query) ||
      (r.description && r.description.toLowerCase().includes(query))
  );

  const filteredFacts = data.facts.filter(
    (f) =>
      f.title.toLowerCase().includes(query) ||
      (f.organization && f.organization.toLowerCase().includes(query)) ||
      (f.description && f.description.toLowerCase().includes(query))
  );

  const filteredResumes = data.resumes.filter(
    (e) =>
      e.projectTitle.toLowerCase().includes(query) ||
      e.targetRole.toLowerCase().includes(query) ||
      e.oneLineVersion.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-emerald-400" /> Persistent Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Search, inspect, and export all synchronized repositories, verified facts, and generated career entries.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/api/export?format=json"
            download
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs tactile-button border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download JSON Backup</span>
          </a>

          <a
            href="/api/export?format=csv"
            download
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs tactile-button border border-slate-700"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export Resumes CSV</span>
          </a>
        </div>
      </div>

      {/* Database State Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Storage Engine: Persistent SQLite Relational DB</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{data.repos.length} Repos</span>
          <span>•</span>
          <span>{data.facts.length} Milestones</span>
          <span>•</span>
          <span>{data.resumes.length} Resume Drafts</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Global search across repositories, facts, and resumes..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {[
            { key: "ALL", label: "All Data" },
            { key: "REPOS", label: "Repositories" },
            { key: "FACTS", label: "LinkedIn Facts" },
            { key: "RESUMES", label: "Resume Drafts" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-smooth ${
                filterType === tab.key
                  ? "bg-emerald-500/20 text-emerald-300 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {/* Repositories */}
        {(filterType === "ALL" || filterType === "REPOS") && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-400" /> Analyzed Repositories ({filteredRepos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-smooth space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/repos/${repo.id}`}
                      className="text-sm font-bold text-white hover:text-emerald-400 transition-colors"
                    >
                      {repo.name}
                    </Link>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {repo.structureScore}% Health
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{repo.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LinkedIn Milestones */}
        {(filterType === "ALL" || filterType === "FACTS") && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-400" /> Verified Milestones ({filteredFacts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-smooth space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{fact.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono">
                      {fact.category}
                    </span>
                  </div>
                  {fact.organization && (
                    <div className="text-xs text-slate-400 font-medium">@ {fact.organization}</div>
                  )}
                  {fact.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{fact.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resume Drafts */}
        {(filterType === "ALL" || filterType === "RESUMES") && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> ATS Resume Entries ({filteredResumes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredResumes.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-smooth space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{entry.projectTitle}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-mono">
                      {entry.targetRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{entry.oneLineVersion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Synchronization Logs History Table */}
      <section className="space-y-3 pt-4 border-t border-slate-800">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Synchronization Audit History
        </h2>
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
                <th className="p-3">Details</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {data.syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 font-semibold text-white">{log.source}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-sans max-w-md truncate">{log.details}</td>
                  <td className="p-3 text-right text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
