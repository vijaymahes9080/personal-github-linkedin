"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Key,
  Cpu,
  FolderGit2,
  Check,
  AlertCircle,
  Activity,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [aiProvider, setAiProvider] = useState("HEURISTIC");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [hasServerGeminiKey, setHasServerGeminiKey] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    // Load auth & settings
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setTargetRole(data.user.targetRole || "AI Engineer");
          setAiProvider(data.user.aiProvider || "HEURISTIC");
          setHasServerGeminiKey(data.user.hasGeminiApiKey);
        }
        setHasPassword(data.hasPasswordProtection);
      })
      .catch(() => {});

    // Load health
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setHealthData(d))
      .catch(() => {});
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          targetRole,
          aiProvider,
          geminiApiKey: geminiApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback("Settings saved successfully!");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(data.error || "Failed to update settings");
      }
    } catch (err: any) {
      setFeedback(err.message || "Network error");
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_pin",
          pin: pinInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setHasPassword(Boolean(pinInput.trim()));
        setPinInput("");
        setFeedback(data.message);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback(err.message || "Failed to update PIN");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" /> Settings & Security Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage AI providers, server-side encryption keys, dashboard PIN protection, and inspect system health.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          {feedback}
        </div>
      )}

      {/* AI Provider & Engine Settings */}
      <section className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" /> AI Provider & Intelligence Engine
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The app works 100% out of the box with the built-in Zero-Cost Heuristic Engine (no API key required). You can optionally provide a free Google AI Studio key (`gemini-2.0-flash`) for enhanced natural language synthesis.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Default Intelligence Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="HEURISTIC">Built-in Zero-Cost Heuristic Engine (100% Free)</option>
                <option value="GEMINI">Google Gemini 2.0 Flash (Free Tier)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google Gemini API Key <span className="text-slate-500 font-normal">(Optional Free Tier)</span>
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder={hasServerGeminiKey ? "Key configured (leave blank to keep)" : "AIzaSy..."}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Obtain a free key at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">aistudio.google.com</a>. Keys are stored server-side only.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tactile-button"
            >
              Save AI Settings
            </button>
          </div>
        </form>
      </section>

      {/* Dashboard Security & Master PIN Protection */}
      <section className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" /> Private Dashboard Protection
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Protect your private repositories and career notes behind a master Security PIN. If set, access requires entering this PIN.
        </p>

        <form onSubmit={handleUpdatePin} className="space-y-3">
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {hasPassword ? "Update / Remove Master PIN" : "Set Master Security PIN"}
            </label>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder={hasPassword ? "Leave blank to remove PIN" : "e.g. 1234 or securepass"}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold tactile-button border border-slate-700"
            >
              {hasPassword ? (pinInput ? "Update PIN" : "Remove PIN Protection") : "Enable PIN Protection"}
            </button>
            {hasPassword && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> PIN Protected
              </span>
            )}
          </div>
        </form>
      </section>

      {/* System Diagnostics & Health Status */}
      <section className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Production System Diagnostics
        </h2>

        {healthData ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500">Service Status</span>
              <div className="text-emerald-400 font-bold uppercase">{healthData.status}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500">Database</span>
              <div className="text-emerald-400 font-bold">CONNECTED</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500">Repositories</span>
              <div className="text-white font-bold">{healthData.database?.repoCount || 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500">Verified Facts</span>
              <div className="text-white font-bold">{healthData.database?.factCount || 0}</div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono">Loading diagnostics...</div>
        )}
      </section>
    </div>
  );
}
