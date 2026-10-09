import React, { useState } from 'react';
import { Scale, BookOpen, Clock, AlertCircle, CheckCircle, FileText, ChevronRight } from 'lucide-react';

export default function LegalRAGPanel({
  analysis,
  onDoctorConfirm,
  doctorName = "Dr. S. Sharma, MD",
  onOpenBNSModal
}) {
  const legal = analysis?.legal_classification;
  const [decision, setDecision] = useState(legal?.suggested_category || 'Pending Investigation');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isSigned, setIsSigned] = useState(false);

  if (!legal) {
    return (
      <div className="glass-panel p-6 text-center text-slate-400">
        <Scale className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-xs">No analysis performed yet. Click "Analyze Legal Grounding" to map injuries to Bharatiya Nyaya Sanhita clauses.</p>
      </div>
    );
  }

  const getCategoryTheme = (category) => {
    switch (category) {
      case 'Simple Hurt':
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-500/40',
          text: 'text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'Grievous Hurt':
        return {
          bg: 'bg-rose-950/40',
          border: 'border-rose-500/40',
          text: 'text-rose-300',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        };
      case 'Pending Investigation':
      default:
        return {
          bg: 'bg-amber-950/40',
          border: 'border-amber-500/40',
          text: 'text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
    }
  };

  const theme = getCategoryTheme(legal.suggested_category);

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>BNS Statutory Legal Classification</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 font-mono border border-sky-800/40">
                RAG Grounded
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Cites Bharatiya Nyaya Sanhita (BNS, 2023) Hurt & Grievous Hurt provisions
            </p>
          </div>
        </div>

        {onOpenBNSModal && (
          <button
            type="button"
            onClick={onOpenBNSModal}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors border border-slate-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>BNS Code Book</span>
          </button>
        )}
      </div>

      {/* Suggested Category Banner */}
      <div className={`p-4 rounded-xl ${theme.bg} ${theme.border} border space-y-2`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            AI Statutory Recommendation:
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${theme.badge}`}>
            {legal.suggested_category}
          </span>
        </div>

        <div className="text-xs text-slate-300">
          <strong>Primary Statutory Section:</strong>{' '}
          <span className="font-mono text-sky-300 font-semibold">{legal.primary_bns_section}</span>
        </div>

        <div className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60 whitespace-pre-line">
          {legal.rationale}
        </div>
      </div>

      {/* Mandatory Pending Diagnostics Safeguard */}
      {legal.pending_investigations && legal.pending_investigations.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>ER Safeguard: Mandatory Diagnostic Investigation Required</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Fractures and life-endangering internal injuries cannot be finalized in ER without radiological / specialist confirmation:
          </p>
          <ul className="space-y-1 pl-2">
            {legal.pending_investigations.map((item, idx) => (
              <li key={idx} className="text-xs text-amber-200/90 flex items-start gap-1.5 font-medium">
                <span className="text-amber-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cited Statutory Clauses */}
      {legal.cited_clauses && legal.cited_clauses.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Cited Statutory Clauses (Strict Retrieval Grounding)
          </span>

          <div className="space-y-2">
            {legal.cited_clauses.map((clause, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 font-mono">
                    {clause.section} {clause.clause_number ? `Clause (${clause.clause_number})` : ''}: {clause.clause_title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Score: {clause.relevance_score}
                  </span>
                </div>
                <blockquote className="text-[11px] text-slate-300 italic pl-2 border-l-2 border-sky-500/50 my-1 bg-sky-950/20 py-1 pr-1">
                  "{clause.verbatim_text}"
                </blockquote>
                {clause.applies_to_injuries && (
                  <div className="text-[10px] text-slate-400">
                    <strong className="text-slate-300">Grounds Finding:</strong> {clause.applies_to_injuries.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Decision & Confirmation (Human-in-the-loop) */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            Doctor's Final Medico-Legal Decision (Human-in-the-Loop)
          </span>
          <span className="text-[10px] text-slate-500">Doctor holds sole legal authority</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['Simple Hurt', 'Grievous Hurt', 'Pending Investigation'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setDecision(opt)}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all border ${
                decision === opt
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Doctor's Rationale & Clinical Override Notes:
          </label>
          <textarea
            rows={2}
            value={overrideNotes}
            onChange={(e) => setOverrideNotes(e.target.value)}
            placeholder="e.g. Concur with AI classification. Advised PA view chest X-ray and 48hr observation."
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSigned}
              onChange={(e) => setIsSigned(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span>I, <strong className="text-white">{doctorName}</strong>, certify these findings</span>
          </label>

          <button
            type="button"
            disabled={!isSigned}
            onClick={() => {
              if (onDoctorConfirm) {
                onDoctorConfirm({
                  doctor_decision: decision,
                  doctor_notes: overrideNotes
                });
              }
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSigned
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Sign & Approve Opinion
          </button>
        </div>
      </div>
    </div>
  );
}
