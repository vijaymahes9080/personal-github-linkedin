"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Linkedin,
  Upload,
  Plus,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Award,
  BookOpen,
  FolderGit2,
  Trash2,
  Sparkles,
  Link2,
} from "lucide-react";

export default function LinkedInHubPage() {
  const [facts, setFacts] = useState<any[]>([]);
  const [repos, setRepos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("POSITION");
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New fact form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("POSITION");
  const [newOrg, setNewOrg] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newStatus, setNewStatus] = useState("VERIFIED");
  const [newRelatedRepo, setNewRelatedRepo] = useState("");

  const loadData = async () => {
    try {
      const [factsRes, reposRes] = await Promise.all([
        fetch("/api/linkedin/facts").then((r) => r.json()),
        fetch("/api/github/sync").then((r) => r.json()),
      ]);
      setFacts(factsRes.facts || []);
      const allRepos = reposRes.accounts?.flatMap((a: any) => a.repositories) || [];
      setRepos(allRepos);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/linkedin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(data.message || `Imported ${data.count} items from ${file.name}`);
        loadData();
      } else {
        setFeedback(data.error || "Failed to upload file");
      }
    } catch (err: any) {
      setFeedback(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const skillsArray = newSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/linkedin/facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          title: newTitle.trim(),
          organization: newOrg.trim() || undefined,
          startDate: newStart.trim() || undefined,
          endDate: newEnd.trim() || undefined,
          description: newDesc.trim() || undefined,
          skills: skillsArray,
          verificationStatus: newStatus,
          relatedRepoId: newRelatedRepo || undefined,
        }),
      });

      if (res.ok) {
        setAddModalOpen(false);
        setNewTitle("");
        setNewOrg("");
        setNewDesc("");
        setNewSkills("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFact = async (id: string) => {
    if (!confirm("Delete this verified milestone?")) return;
    try {
      await fetch(`/api/linkedin/facts?id=${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFacts = facts.filter((f) => f.category === activeTab);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Linkedin className="w-6 h-6 text-blue-400" /> LinkedIn Professional Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Stores verified professional facts, certificates, and work experience, mapped directly to GitHub projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs tactile-button cursor-pointer border border-slate-700">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>{uploading ? "Importing..." : "Upload LinkedIn CSV"}</span>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tactile-button shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono">
          {feedback}
        </div>
      )}

      {/* Upload Helper Guide */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="text-slate-200 font-semibold">LinkedIn Official Archive Supported:</span>{" "}
          Export from LinkedIn Settings &gt; Data Privacy &gt; Get a copy of your data (e.g.{" "}
          <span className="font-mono text-slate-300">Positions.csv</span>,{" "}
          <span className="font-mono text-slate-300">Skills.csv</span>,{" "}
          <span className="font-mono text-slate-300">Certifications.csv</span>).
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5" /> Zero Scraping / Official CSV Ingestion
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { key: "POSITION", label: "Work Experience", icon: Briefcase },
          { key: "CERTIFICATION", label: "Certifications", icon: Award },
          { key: "SKILL", label: "Verified Skills", icon: Sparkles },
          { key: "PROJECT", label: "Projects", icon: FolderGit2 },
          { key: "EDUCATION", label: "Education", icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const count = facts.filter((f) => f.category === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-smooth ${
                activeTab === tab.key
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fact Cards */}
      <div className="space-y-3">
        {filteredFacts.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/30 border border-slate-800 text-center space-y-2">
            <p className="text-xs font-medium text-slate-400">No milestones in this category yet.</p>
            <p className="text-[11px] text-slate-500">
              Upload your LinkedIn archive CSV or click "Add Milestone" to record verified achievements.
            </p>
          </div>
        ) : (
          filteredFacts.map((fact) => (
            <div
              key={fact.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-smooth flex items-start justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{fact.title}</span>
                  {fact.organization && (
                    <span className="text-xs text-slate-400 font-medium">@ {fact.organization}</span>
                  )}
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      fact.verificationStatus === "VERIFIED"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {fact.verificationStatus}
                  </span>
                  {(fact.startDate || fact.endDate) && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {fact.startDate} - {fact.endDate || "Present"}
                    </span>
                  )}
                </div>

                {fact.description && (
                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                    {fact.description}
                  </p>
                )}

                {/* Related GitHub Repository */}
                {fact.relatedRepo && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Linked Project:</span>
                    <Link href={`/repos/${fact.relatedRepo.id}`} className="hover:underline font-semibold">
                      {fact.relatedRepo.name}
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDeleteFact(fact.id)}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                title="Delete milestone"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Milestone Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Record Professional Milestone
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Add verified career information, training, or certificates to enrich your portfolio intelligence.
            </p>

            <form onSubmit={handleCreateFact} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="POSITION">Work Experience / Internship</option>
                    <option value="CERTIFICATION">Certification / Credential</option>
                    <option value="SKILL">Verified Skill</option>
                    <option value="PROJECT">Project / Case Study</option>
                    <option value="EDUCATION">Education / Degree</option>
                    <option value="ACHIEVEMENT">Achievement / Award</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Verification Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="VERIFIED">Verified (Official / Certificate)</option>
                    <option value="SELF_REPORTED">Self-Reported</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Title / Role / Credential Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Machine Learning Engineer or Deep Learning Specialization"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Organization / Issuer / Company
                </label>
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  placeholder="e.g. DeepLearning.AI or University or Company"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    placeholder="e.g. Jan 2024"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Date</label>
                  <input
                    type="text"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    placeholder="e.g. Aug 2024 or Present"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Summary</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Summary of responsibilities or verifiable outcomes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Link to GitHub Repository <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <select
                  value={newRelatedRepo}
                  onChange={(e) => setNewRelatedRepo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">No linked repository</option>
                  {repos.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.primaryLanguage || "Repo"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tactile-button"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
