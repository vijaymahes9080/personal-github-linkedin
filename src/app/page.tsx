"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitFork,
  Linkedin,
  Compass,
  FileText,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Star,
  Layers,
  TrendingUp,
  FolderGit2,
  Copy,
  Check,
} from "lucide-react";

export default function OverviewDashboard() {
  const [stats, setStats] = useState({
    reposCount: 0,
    totalStars: 0,
    factsCount: 0,
    resumeCount: 0,
    targetRole: "AI Engineer",
    avgScore: 85,
  });
  const [topRepos, setTopRepos] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [authRes, ghRes, factRes, resumeRes] = await Promise.all([
          fetch("/api/auth").then((r) => r.json()),
          fetch("/api/github/sync").then((r) => r.json()),
          fetch("/api/linkedin/facts").then((r) => r.json()),
          fetch("/api/resume").then((r) => r.json()),
        ]);

        const repos = ghRes.accounts?.flatMap((a: any) => a.repositories) || [];
        const totalStars = repos.reduce((acc: number, r: any) => acc + (r.stars || 0), 0);
        const avgStructure =
          repos.length > 0
            ? Math.round(repos.reduce((acc: number, r: any) => acc + (r.structureScore || 0), 0) / repos.length)
            : 80;

        setStats({
          reposCount: repos.length,
          totalStars,
          factsCount: factRes.facts?.length || 0,
          resumeCount: resumeRes.entries?.length || 0,
          targetRole: authRes.user?.targetRole || "AI Engineer",
          avgScore: avgStructure,
        });

        setTopRepos(repos.slice(0, 3));
        setRecentLogs(ghRes.recentLogs || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Career Intelligence Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Personal GitHub & LinkedIn Intelligence
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Continuously parsing verified repositories, code architecture, and LinkedIn history. Generating ATS-optimized resumes and strategic project roadmaps for{" "}
              <span className="text-emerald-400 font-semibold">{stats.targetRole}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/recommendations"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tactile-button shadow-lg shadow-emerald-500/10"
            >
              <Compass className="w-4 h-4" />
              <span>Run Role Audit</span>
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm tactile-button border border-slate-700"
            >
              <FileText className="w-4 h-4" />
              <span>ATS Resume Studio</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key Performance Metrics">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-smooth">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Repositories Inspected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.reposCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{stats.totalStars} GitHub stars total</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-smooth">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Verified LinkedIn Facts</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Linkedin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.factsCount}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>Experience & certs verified</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-smooth">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">ATS Resume Drafts</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.resumeCount}</div>
          <div className="text-[11px] text-slate-400 font-mono">Strict 1-line, 2-line & 3-bullet</div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-smooth">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Repo Health Index</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.avgScore}%</div>
          <div className="text-[11px] text-cyan-400 font-mono">Structure, tests & docs score</div>
        </div>
      </section>

      {/* Showcase Repositories & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Showcase Repositories */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Top Portfolio Projects for {stats.targetRole}</h2>
            </div>
            <Link href="/repos" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium">
              <span>View all repositories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {topRepos.map((repo) => {
              const deps = JSON.parse(repo.dependencies || "[]").slice(0, 4);
              return (
                <div
                  key={repo.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 transition-smooth space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/repos/${repo.id}`}
                          className="text-base font-bold text-white hover:text-emerald-400 transition-colors"
                        >
                          {repo.name}
                        </Link>
                        {repo.primaryLanguage && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-medium">
                            {repo.primaryLanguage}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                          {repo.structureScore}% Health
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {repo.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/repos/${repo.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium tactile-button"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {deps.map((d: string) => (
                      <span key={d} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800/80 font-mono">
                        {d}
                      </span>
                    ))}
                    {repo.stars > 0 && (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono ml-auto">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {repo.stars}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quick Action Hub & Sync Logs */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Quick Action Studio
            </h3>

            <div className="space-y-2">
              <Link
                href="/recommendations"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-medium text-slate-200 transition-smooth group"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Analyze Role Fit & Gaps</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/resume"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-medium text-slate-200 transition-smooth group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Generate ATS Resume Bullets</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/content"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-medium text-slate-200 transition-smooth group"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Create LinkedIn Post</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/linkedin"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-medium text-slate-200 transition-smooth group"
              >
                <div className="flex items-center gap-2.5">
                  <Linkedin className="w-4 h-4 text-cyan-400" />
                  <span>Upload LinkedIn Data Archive</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Sync History Logs */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Synchronization Activity
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {recentLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 font-semibold">{log.source}</span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
