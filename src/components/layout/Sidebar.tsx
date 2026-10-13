"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitFork,
  Linkedin,
  Compass,
  FileText,
  Share2,
  BookmarkCheck,
  Settings,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "GitHub Intelligence", href: "/repos", icon: GitFork },
  { name: "LinkedIn Hub", href: "/linkedin", icon: Linkedin },
  { name: "Role Recommendations", href: "/recommendations", icon: Compass, badge: "AI" },
  { name: "ATS Resume Studio", href: "/resume", icon: FileText, badge: "ATS" },
  { name: "Content Studio", href: "/content", icon: Share2 },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookmarkCheck },
  { name: "Settings & Security", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-200 tactile-button shadow-lg"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  Career Intelligence
                </h1>
                <p className="text-xs text-slate-400 font-mono">GitHub & LinkedIn Hub</p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive
                          ? "bg-emerald-400/20 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status / Privacy Guard */}
        <div className="p-4 border-t border-slate-800/80 m-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Privacy & Security</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Tokens & private repos remain encrypted on your server. Zero hallucination guarantee.
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Status: <span className="text-emerald-400 font-medium">Synced</span></span>
            <span className="text-slate-500">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
