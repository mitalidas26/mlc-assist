import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Upload, Search, FileText, CheckCircle2, XCircle, AlertTriangle, ArrowRight, RefreshCw, FileCode } from 'lucide-react';
import { verifyByHash, verifyByUpload } from '../api/client';

export default function VerificationPortal({ initialHash = '' }) {
  const [activeTab, setActiveTab] = useState(initialHash ? 'hash' : 'upload');
  const [hashInput, setHashInput] = useState(initialHash);
  const [fileInput, setFileInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleVerifyHash = async (e) => {
    if (e) e.preventDefault();
    if (!hashInput.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await verifyByHash(hashInput.trim());
      setResult(res);
    } catch (err) {
      setResult({
        is_valid: false,
        status: 'TAMPERED',
        message: 'Network error or unable to communicate with verification registry.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFile = async (fileToUpload) => {
    const file = fileToUpload || fileInput;
    if (!file) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await verifyByUpload(file);
      setResult(res);
    } catch (err) {
      setResult({
        is_valid: false,
        status: 'TAMPERED',
        message: 'Failed to verify uploaded PDF.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFileInput(dropped);
      handleVerifyFile(dropped);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-slate-700/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Public Medico-Legal Verification Portal</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-sky-500/20 text-sky-300 font-mono border border-sky-500/40">
                SHA-256 Proof
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Instant cryptographic authenticity audit for Police Officers, Judicial Magistrates, Legal Counsel, and Hospital Administrators.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Card */}
      <div className="glass-panel p-6 space-y-5">
        {/* Method Toggle Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => { setActiveTab('upload'); setResult(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload PDF Document
          </button>
          <button
            onClick={() => { setActiveTab('hash'); setResult(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'hash'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            Query SHA-256 Digest
          </button>
        </div>

        {/* Upload Form */}
        {activeTab === 'upload' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
              dragActive
                ? 'border-sky-400 bg-sky-950/30 scale-[1.01]'
                : 'border-slate-700/80 bg-slate-950/50 hover:border-slate-600'
            }`}
          >
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-sky-400 mb-3">
              <Upload className="w-7 h-7 animate-bounce" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Drag & Drop Medico-Legal Certificate PDF
            </h4>
            <p className="text-xs text-slate-400 mb-4 max-w-sm">
              The system calculates the exact SHA-256 checksum and compares it against the immutable state registry.
            </p>

            <label className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer shadow-lg shadow-sky-500/20 transition-all">
              <span>Choose Certificate PDF</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    setFileInput(f);
                    handleVerifyFile(f);
                  }
                }}
              />
            </label>

            {fileInput && (
              <div className="mt-3 text-xs text-sky-300 font-mono flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> {fileInput.name} ({(fileInput.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        )}

        {/* Hash Query Form */}
        {activeTab === 'hash' && (
          <form onSubmit={handleVerifyHash} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Enter or Paste 64-Character SHA-256 Digest:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="e.g. 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={loading || !hashInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Verify Digest
              </button>
            </div>
          </form>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-400" />
            <p className="text-xs font-mono">Computing SHA-256 digest & querying registry...</p>
          </div>
        )}

        {/* Verification Result Card */}
        {result && (
          <div
            className={`p-6 rounded-2xl border transition-all animate-in zoom-in-95 duration-200 ${
              result.status === 'VERIFIED'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-2xl shadow-emerald-950/50'
                : 'bg-rose-950/40 border-rose-500/50 shadow-2xl shadow-rose-950/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    result.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {result.status === 'VERIFIED' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <ShieldAlert className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">
                      {result.status === 'VERIFIED' ? 'DOCUMENT VERIFIED & UNALTERED' : 'TAMPERING DETECTED / INVALID RECORD'}
                    </h3>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        result.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    {result.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Details Metadata */}
            {result.status === 'VERIFIED' && (
              <div className="mt-5 pt-4 border-t border-emerald-500/30 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">MLC Case Number</span>
                  <strong className="font-mono text-sky-300">{result.mlc_number || 'N/A'}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Patient Name</span>
                  <strong className="text-white">{result.patient_name || 'N/A'}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Examining Doctor</span>
                  <strong className="text-white">{result.doctor_name || 'N/A'}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Documented Injuries</span>
                  <strong className="text-emerald-400 font-mono">{result.injuries_count} Recorded</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Statutory Legal Opinion</span>
                  <strong className="text-sky-300">{result.legal_opinion || 'Pending'}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Issuance Timestamp</span>
                  <strong className="text-slate-300 font-mono text-[11px]">
                    {result.generated_at ? new Date(result.generated_at).toLocaleString() : 'N/A'}
                  </strong>
                </div>
              </div>
            )}

            {result.sha256_hash && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Calculated Hash:</span>
                <span className="text-slate-300 break-all select-all">{result.sha256_hash}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
