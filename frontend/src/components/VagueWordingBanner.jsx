import React from 'react';
import { AlertTriangle, Lightbulb, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function VagueWordingBanner({ flags = [], onApplyFix }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300">Medically Precise & Legally Robust</h4>
            <p className="text-[11px] text-emerald-400/80">
              No ambiguous or non-measurable phrases detected. Documentation meets forensic standards.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Forensic Score: 100%
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <span>Vague Wording Detector</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 font-mono">
                {flags.length} Issue{flags.length > 1 ? 's' : ''} Flagged
              </span>
            </h4>
            <p className="text-[11px] text-amber-300/80">
              Imprecise language can weaken victim testimony or be challenged during cross-examination in court.
            </p>
          </div>
        </div>
      </div>

      {/* Flagged items list */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {flags.map((flag, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 transition-colors text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px] border border-rose-500/30">
                  "{flag.phrase}"
                </span>
                <span className="text-[11px] font-semibold text-slate-300">
                  {flag.category}
                </span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                flag.severity === 'high' ? 'bg-rose-900/50 text-rose-300' : 'bg-amber-900/50 text-amber-300'
              }`}>
                {flag.severity} risk
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              <strong className="text-slate-300">Legal Risk:</strong> {flag.issue}
            </p>

            <div className="p-2 rounded bg-sky-950/40 border border-sky-800/30 flex items-start gap-2 text-sky-200">
              <Lightbulb className="w-3.5 h-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-sky-300">Suggested Metric Fix:</strong> {flag.suggestion}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
