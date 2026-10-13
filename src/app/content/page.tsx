"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Linkedin,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  Star,
  Award,
  BookOpen,
} from "lucide-react";

const FORMAT_OPTIONS = [
  { key: "ANNOUNCEMENT", label: "1. Project Announcement Post", desc: "Launches new project with objective & tech stack" },
  { key: "INTERNSHIP_UPDATE", label: "2. Internship & Training Update", desc: "Professional growth milestone grounded in project work" },
  { key: "TECH_LEARNING", label: "3. Technical Learning Post", desc: "Deep dive on architecture or specific framework takeaway" },
  { key: "REPO_SHOWCASE", label: "4. GitHub Repo Showcase", desc: "Spotlights open-source code, README & invites feedback" },
  { key: "ACHIEVEMENT", label: "5. Achievement & Certificate", desc: "Verified milestone, course or certification completed" },
  { key: "HEADLINE", label: "6. Professional Headline & Tagline", desc: "High-conversion headline for LinkedIn search scans" },
  { key: "LINKEDIN_PROJECT", label: "7. LinkedIn Projects Section", desc: "Formatted for the official Projects block on profile" },
  { key: "FEATURED_CARD", label: "8. Featured Section Summary", desc: "Punchy snippet for the top Featured cards" },
  { key: "ABOUT_DRAFT", label: "9. Role-Specific About Section", desc: "Complete narrative summary for profile About section" },
  { key: "WEEKLY_PLAN", label: "10. 7-Day Content Plan", desc: "Structured weekly posting cadence based on actual progress" },
];

export default function ContentStudioPage() {
  const [formatType, setFormatType] = useState("ANNOUNCEMENT");
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [role, setRole] = useState("AI Engineer");
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [lengthMode, setLengthMode] = useState<"concise" | "medium" | "detailed">("medium");
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [ghRes, authRes] = await Promise.all([
          fetch("/api/github/sync").then((r) => r.json()),
          fetch("/api/auth").then((r) => r.json()),
        ]);
        const allRepos = ghRes.accounts?.flatMap((a: any) => a.repositories) || [];
        setRepos(allRepos);
        if (allRepos.length > 0) setSelectedRepoId(allRepos[0].id);
        if (authRes.user?.targetRole) setRole(authRes.user.targetRole);
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formatType,
          repoId: selectedRepoId || undefined,
          role,
          milestoneTitle: milestoneTitle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.post) {
        setGeneratedPost(data.post);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeContent = generatedPost
    ? lengthMode === "concise"
      ? generatedPost.conciseVersion
      : lengthMode === "medium"
      ? generatedPost.mediumVersion
      : generatedPost.detailedVersion
    : "";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Share2 className="w-6 h-6 text-blue-400" /> LinkedIn & Career Content Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Crafts 10 specialized professional content formats strictly derived from your verified repositories and career achievements.
        </p>
      </div>

      {/* Generator Configuration Form */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Format Selector Pills / Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Output Format (10 Formats Supported)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {FORMAT_OPTIONS.map((fmt) => (
                <button
                  type="button"
                  key={fmt.key}
                  onClick={() => setFormatType(fmt.key)}
                  className={`p-3 rounded-xl text-left transition-smooth border text-xs flex flex-col justify-between ${
                    formatType === fmt.key
                      ? "bg-blue-500/20 text-blue-200 border-blue-500/40 shadow-sm"
                      : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-800"
                  }`}
                >
                  <div className="font-bold text-white mb-1">{fmt.label}</div>
                  <div className="text-[10px] text-slate-500 leading-snug">{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Repo select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Source Repository</label>
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Role Voice</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. AI Engineer"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Optional Milestone Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Milestone Title <span className="text-slate-500 font-normal">(for certs/training)</span>
              </label>
              <input
                type="text"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="e.g. Deep Learning Specialization"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs tactile-button disabled:opacity-50 shadow-md shadow-blue-500/10"
            >
              {generating ? "Synthesizing Copy..." : "Generate LinkedIn Content"}
            </button>
          </div>
        </form>
      </section>

      {/* Generated Post Box */}
      {generatedPost && (
        <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-blue-400 font-mono font-medium">Ready-To-Publish Output</span>
              <h2 className="text-base font-bold text-white">{generatedPost.title}</h2>
              {generatedPost.targetAudience && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Audience: {generatedPost.targetAudience}
                </div>
              )}
            </div>

            {/* Length Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              {(["concise", "medium", "detailed"] as const).map((len) => (
                <button
                  key={len}
                  onClick={() => setLengthMode(len)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-smooth ${
                    lengthMode === len
                      ? "bg-blue-500/20 text-blue-300 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* Post preview body */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-sans text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
            {activeContent}
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-1">
              {generatedPost.tags?.map((t: string) => (
                <span key={t} className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(activeContent)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold tactile-button border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Post Text"}</span>
              </button>

              <a
                href={generatedPost.directShareUrl || `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(activeContent)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold tactile-button shadow-sm"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>Open in LinkedIn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
