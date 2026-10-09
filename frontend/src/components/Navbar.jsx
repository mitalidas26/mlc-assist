import React from 'react';
import { Shield, Activity, FileCheck2, Scale, PlusCircle, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';

export default function Navbar({
  currentView,
  onSelectView,
  onNewCase,
  onOpenBNSModal,
  activeCaseCount = 0,
  backendOnline = true
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-teal-600 text-white shadow-lg shadow-sky-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                MLC <span className="text-sky-400">Assist</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800/60 font-mono">
                BNS 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Medico-Legal Trauma Documentation & Tamper-Evident Certification
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectView('clinical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'clinical'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Casualty Console</span>
          </button>

          <button
            onClick={() => onSelectView('verify')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'verify'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verify Portal</span>
          </button>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenBNSModal}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors flex items-center gap-1"
          >
            <Scale className="w-3.5 h-3.5 text-sky-400" />
            <span>BNS Code</span>
          </button>

          <button
            type="button"
            onClick={onNewCase}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-sky-600/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Case</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 pl-2 border-l border-slate-800">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>{backendOnline ? 'API Ready' : 'API Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
