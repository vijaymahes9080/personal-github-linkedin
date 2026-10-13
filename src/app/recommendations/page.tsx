"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  FileText,
  Layers,
  Calendar,
  Check,
} from "lucide-react";
import { PRESET_ROLES } from "@/lib/roles";

export default function RecommendationsPage() {
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const runAnalysis = async (roleName: string) => {
    setLoading(true);
    setTargetRole(roleName);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: roleName }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial saved analysis
    fetch("/api/analyze")
      .then((r) => r.json())
      .then((data) => {
        if (data.analyses && data.analyses.length > 0) {
          const latest = data.analyses[0];
          setTargetRole(latest.targetRole);
          // reconstruct formatted analysis object
          const best = latest.recommendations.filter((r: any) => r.type === "BEST_SHOWCASE");
          const imp = latest.recommendations.filter((r: any) => r.type === "NEEDS_IMPROVEMENT");
          const missing = latest.recommendations.filter((r: any) => r.type === "MISSING_PORTFOLIO");

          setAnalysis({
            matchScore: latest.matchScore,
            summary: latest.summary,
            bestShowcaseProjects: best.map((b: any) => ({
              repoId: b.repoId,
              title: b.title,
              reason: b.reason,
              priority: b.priority,
              actionPlan: b.actionPlan,
              skillsGained: JSON.parse(b.skillsGained || "[]"),
            })),
            projectsNeedingImprovement: imp.map((i: any) => ({
              repoId: i.repoId,
              title: i.title,
              reason: i.reason,
              priority: i.priority,
              actionPlan: i.actionPlan,
              skillsGained: JSON.parse(i.skillsGained || "[]"),
            })),
            missingPortfolioProjects: missing.map((m: any) => ({
              title: m.title,
              reason: m.reason,
              priority: m.priority,
              actionPlan: m.actionPlan,
              skillsGained: JSON.parse(m.skillsGained || "[]"),
            })),
            skillsToLearn: latest.strengths || [],
            roadmap: latest.roadmap || [],
            providerUsed: "BUILTIN_HEURISTIC",
          });
        } else {
          // If none exists, run initial
          runAnalysis("AI Engineer");
        }
      })
      .catch(() => {})
      .finally(() => setInitialLoaded(true));
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customRoleInput.trim()) {
      runAnalysis(customRoleInput.trim());
      setCustomRoleInput("");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-emerald-400" /> Role-Based Recommendations & Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Evaluates your verified repositories and LinkedIn profile against real industry benchmarks. Provides gap analysis and career strategy.
        </p>
      </div>

      {/* Target Role Selector Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Target Role Selection
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Active: <span className="text-emerald-400 font-semibold">{targetRole}</span>
          </span>
        </div>

        {/* Preset Role Pills */}
        <div className="flex flex-wrap gap-2">
          {PRESET_ROLES.slice(0, 7).map((role) => (
            <button
              key={role}
              onClick={() => runAnalysis(role)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-smooth ${
                targetRole === role
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10"
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Custom Role Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            value={customRoleInput}
            onChange={(e) => setCustomRoleInput(e.target.value)}
            placeholder="Or type any custom role (e.g. Distributed Systems Engineer, LLM Evaluator)..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !customRoleInput.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tactile-button disabled:opacity-40"
          >
            {loading ? "Analyzing..." : "Analyze Role"}
          </button>
        </form>
      </div>

      {/* Analysis Results */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono space-y-2">
          <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          <p>Analyzing repository evidence, dependencies, and role benchmarks...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-8">
          {/* Alignment Score & Summary Card */}
          <section className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-semibold">
                  {analysis.providerUsed === "GEMINI_2_FLASH" ? "Gemini 2.0 Flash Synthesis" : "Zero-Cost Heuristic Engine"}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Role Alignment Analysis for {targetRole}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-black font-mono">
                {analysis.matchScore}%
              </div>
              <div>
                <div className="text-xs font-bold text-white">Market Match</div>
                <div className="text-[11px] text-slate-400">Core requirements met</div>
              </div>
            </div>
          </section>

          {/* 1. Best Existing Projects to Showcase */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                1. Best Existing Projects to Showcase ({analysis.bestShowcaseProjects?.length || 0})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.bestShowcaseProjects?.map((proj: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-smooth space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{proj.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-semibold">
                        Priority: {proj.priority}
                      </span>
                    </div>

                    {proj.repoId && (
                      <Link
                        href={`/resume?repoId=${proj.repoId}`}
                        className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 tactile-button font-medium"
                      >
                        Resume Bullet
                      </Link>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{proj.reason}</p>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <span className="font-semibold text-slate-300">Action Plan:</span>
                    <p>{proj.actionPlan}</p>
                  </div>

                  {proj.skillsGained?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.skillsGained.map((s: string) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 2. Projects That Need Improvement Before Showcasing */}
          {analysis.projectsNeedingImprovement?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  2. Projects Needing Improvement Before Showcasing ({analysis.projectsNeedingImprovement.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.projectsNeedingImprovement.map((proj: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-smooth space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">{proj.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono font-semibold">
                        Needs Work
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{proj.reason}</p>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-amber-300/90 space-y-1">
                      <span className="font-semibold text-white">Remediation Steps:</span>
                      <p>{proj.actionPlan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Missing Portfolio Projects That Would Strengthen Profile */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">
                3. High-Impact Missing Portfolio Projects
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.missingPortfolioProjects?.map((proj: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-smooth space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">{proj.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{proj.reason}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                    <span className="font-semibold text-cyan-400">Implementation Plan:</span>
                    <p className="text-slate-400">{proj.actionPlan}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Required Technologies & Skills to Learn */}
          {analysis.skillsToLearn?.length > 0 && (
            <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Required Technologies & Skills to Acquire
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.skillsToLearn.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 5. Prioritized Roadmap */}
          {analysis.roadmap?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">5. Prioritized Career & Portfolio Roadmap</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.roadmap.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
                  >
                    <div className="text-xs font-bold text-purple-400 font-mono">{step.phase}</div>
                    <div className="text-sm font-bold text-white">{step.goal}</div>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {step.actions?.map((act: string, aIdx: number) => (
                        <li key={aIdx} className="flex items-start gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}
