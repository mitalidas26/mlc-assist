import React, { useState, useEffect } from 'react';
import { X, BookOpen, Search, Scale, ShieldCheck } from 'lucide-react';
import { fetchBNSClauses } from '../api/client';

export default function BNSLibraryModal({ onClose }) {
  const [clauses, setClauses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBNSClauses()
      .then((data) => {
        setClauses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load BNS clauses', err);
        setLoading(false);
      });
  }, []);

  const filtered = clauses.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.section.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.statutory_text.toLowerCase().includes(q) ||
      (c.keywords && c.keywords.some(k => k.toLowerCase().includes(q))) ||
      (c.ipc_equivalent && c.ipc_equivalent.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Bharatiya Nyaya Sanhita (BNS, 2023) Legal Corpus</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-950 text-sky-400 font-mono border border-sky-800/40">
                  Hurt & Grievous Hurt
                </span>
              </h3>
              <p className="text-xs text-slate-400">Statutory clauses, clinical criteria & IPC concordance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search BNS section, clause, injury type, or IPC equivalent (e.g., 'fracture', '116', 'IPC 320')..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Clauses List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading BNS legal repository...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No matching statutory clauses found.</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sky-300 font-mono text-xs">
                      {item.section} {item.clause_number ? `Clause (${item.clause_number})` : ''}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-white">{item.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {item.ipc_equivalent}
                  </span>
                </div>

                <blockquote className="p-2.5 rounded-lg bg-sky-950/20 border-l-2 border-sky-500 text-[11px] text-slate-200 italic">
                  "{item.statutory_text}"
                </blockquote>

                {item.clinical_criteria && (
                  <p className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Clinical ER Criteria:</strong> {item.clinical_criteria}
                  </p>
                )}

                {item.keywords && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.keywords.slice(0, 5).map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-400 font-mono">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
