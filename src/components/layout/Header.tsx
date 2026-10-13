"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Target, GitBranch, Check, ExternalLink, Shield } from "lucide-react";
import { PRESET_ROLES } from "@/lib/roles";

export function Header() {
  const [currentRole, setCurrentRole] = useState("AI Engineer");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial auth & settings
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.targetRole) {
          setCurrentRole(data.user.targetRole);
        }
      })
      .catch(() => {});

    // Fetch initial sync status
    fetch("/api/github/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data.recentLogs?.[0]?.timestamp) {
          setLastSync(new Date(data.recentLogs[0].timestamp).toLocaleTimeString());
        }
      })
      .catch(() => {});
  }, []);

  const handleRoleChange = async (role: string) => {
    setCurrentRole(role);
    setRoleModalOpen(false);

    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_settings", targetRole: role }),
      });
      // Trigger event or reload page if needed
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      // Fetch current connected accounts
      const accountsRes = await fetch("/api/github/sync");
      const accountsData = await accountsRes.json();
      const firstAccount = accountsData.accounts?.[0]?.username || "demo-engineer";

      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: firstAccount }),
      });

      const data = await res.json();
      if (res.ok) {
        setSyncMessage(`Synced ${data.syncedCount || 0} repositories`);
        setLastSync(new Date().toLocaleTimeString());
        setTimeout(() => setSyncMessage(null), 4000);
      } else {
        setSyncMessage(data.error || "Sync failed");
      }
    } catch (err: any) {
      setSyncMessage(err.message || "Network error");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between">
        {/* Left: Active Role Pill */}
        <div className="flex items-center gap-3 pl-12 lg:pl-0">
          <button
            onClick={() => setRoleModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 tactile-button"
            title="Click to switch target job role"
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Target Role:</span>
            <span className="font-semibold text-white">{currentRole}</span>
          </button>

          {lastSync && (
            <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
              Synced at {lastSync}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {syncMessage && (
            <div className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono animate-fade-in">
              {syncMessage}
            </div>
          )}

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold text-xs tactile-button disabled:opacity-50"
            title="Synchronize GitHub repositories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync Repos"}</span>
          </button>
        </div>
      </header>

      {/* Target Role Switcher Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Select Target Career Role
              </h2>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Selecting a target role updates project recommendations, skill gap analysis, and ATS resume keywords.
            </p>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {PRESET_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    currentRole === role
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <span>{role}</span>
                  {currentRole === role && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
