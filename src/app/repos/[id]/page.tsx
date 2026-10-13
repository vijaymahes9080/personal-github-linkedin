"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderGit2,
  ArrowLeft,
  ExternalLink,
  Star,
  GitFork,
  FileCode,
  FolderTree,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText,
  Share2,
  Layers,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function RepoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.id as string;

  const [repo, setRepo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"structure" | "dependencies" | "readme">("structure");

  useEffect(() => {
    async function loadRepo() {
      try {
        const res = await fetch(`/api/github/inspect?id=${repoId}`);
        const data = await res.json();
        if (data.repo) {
          setRepo(data.repo);
        }
      } catch (err) {
        console.error("Failed to load repo inspection:", err);
      } finally {
        setLoading(false);
      }
    }

    if (repoId) loadRepo();
  }, [repoId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 font-mono">
        Inspecting repository architecture and code tree...
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-400">Repository not found.</p>
        <Link href="/repos" className="text-xs text-emerald-400 hover:underline">
          Return to Repositories
        </Link>
      </div>
    );
  }

  const folderTree = Array.isArray(repo.folderTree) ? repo.folderTree : [];
  const dependencies = Array.isArray(repo.dependencies) ? repo.dependencies : [];
  const skills = Array.isArray(repo.demonstratedSkills) ? repo.demonstratedSkills : [];
  const reusable = Array.isArray(repo.reusableComponents) ? repo.reusableComponents : [];
  const missing = Array.isArray(repo.missingDocumentation) ? repo.missingDocumentation : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button & Title Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Repositories
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-white tracking-tight">{repo.name}</h1>
              {repo.primaryLanguage && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {repo.primaryLanguage}
                </span>
              )}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono">
                {repo.structureScore}% Architecture Score
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {repo.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/resume?repoId=${repo.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs tactile-button shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate ATS Resume</span>
            </Link>
            <Link
              href={`/content?repoId=${repo.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs tactile-button shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>LinkedIn Showcase</span>
            </Link>
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 tactile-button border border-slate-700"
              title="Open GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Architecture Health & Missing Components Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Summary */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Architecture Health</div>
          <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
            <span>{repo.structureScore}</span>
            <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Status: <span className="text-emerald-400 font-medium">{repo.completionStatus}</span>
          </p>
        </div>

        {/* Reusable Components */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Reusable Components</div>
          <div className="text-3xl font-extrabold text-white">{reusable.length}</div>
          <div className="text-[11px] text-slate-400 truncate">
            {reusable.join(", ") || "Modular utilities detected"}
          </div>
        </div>

        {/* Missing Documentation Items */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Audit Findings</div>
          <div className="text-3xl font-extrabold text-white">{missing.length}</div>
          <div className="text-[11px] text-slate-400">
            {missing.length === 0 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All standard files present
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 truncate">
                <AlertTriangle className="w-3.5 h-3.5" /> {missing[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab("structure")}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "structure"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Project Structure Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab("dependencies")}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "dependencies"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dependencies & Skills ({dependencies.length})</span>
        </button>

        {repo.hasReadme && (
          <button
            onClick={() => setActiveTab("readme")}
            className={`pb-3 text-xs font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "readme"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>README Documentation</span>
          </button>
        )}
      </div>

      {/* Tab 1: Structure Intelligence */}
      {activeTab === "structure" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            This customized layout illustrates the recommended production structure tailored for a{" "}
            <span className="text-white font-medium">{repo.primaryLanguage || "software"}</span> project. Green items are verified to exist in your repository; amber items are recommended enhancements.
          </div>

          <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
            {folderTree.map((node: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/80 transition-colors"
              >
                <div className="flex items-center gap-2.5 font-mono text-xs">
                  {node.existsInRepo ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span className={node.existsInRepo ? "text-white font-medium" : "text-slate-400"}>
                    {node.path}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      node.existsInRepo
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {node.existsInRepo ? "VERIFIED" : "RECOMMENDED"}
                  </span>
                </div>

                <div className="text-xs text-slate-400 max-w-md text-left sm:text-right">
                  {node.purpose || "Core component"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Dependencies & Skills */}
      {activeTab === "dependencies" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Detected Dependencies & Libraries
            </h3>
            <div className="flex flex-wrap gap-2">
              {dependencies.map((dep: string) => (
                <span
                  key={dep}
                  className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Demonstrated Engineering Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: README */}
      {activeTab === "readme" && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
          {repo.readmeContent || "No README content loaded."}
        </div>
      )}
    </div>
  );
}
