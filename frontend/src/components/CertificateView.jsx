import React from 'react';
import { ShieldCheck, Download, ExternalLink, Copy, Check, FileCheck, QrCode } from 'lucide-react';

export default function CertificateView({ certificate, onNavigateToVerify }) {
  const [copied, setCopied] = React.useState(false);

  if (!certificate) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(certificate.sha256_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pdfUrl = certificate.pdf_url.startsWith('http')
    ? certificate.pdf_url
    : `http://localhost:8000${certificate.pdf_url}`;

  return (
    <div className="glass-panel p-6 space-y-5 animate-in fade-in duration-200">
      {/* Success Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Medico-Legal Certificate Issued & Hashed</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                TAMPER-EVIDENT
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Certificate ID: <strong className="font-mono text-white">{certificate.certificate_id}</strong> • MLC No: <strong className="font-mono text-sky-300">{certificate.mlc_number}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>

          <button
            type="button"
            onClick={() => onNavigateToVerify && onNavigateToVerify(certificate.sha256_hash)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            Verify Document
          </button>
        </div>
      </div>

      {/* Cryptographic SHA-256 Hash Display */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-sky-400" />
            Cryptographic Document Digest (SHA-256)
          </span>
          <button
            onClick={copyHash}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Hash!' : 'Copy Hash'}</span>
          </button>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-xs text-emerald-400 break-all select-all">
          {certificate.sha256_hash}
        </div>

        <p className="text-[11px] text-slate-400">
          This 256-bit cryptographic digest uniquely locks the certificate's clinical findings, injury measurements, doctor identity, and timestamp into the state forensic registry.
        </p>
      </div>

      {/* Embedded PDF Preview Frame */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Official Medico-Legal Examination Report Preview</span>
          <span className="font-mono text-[11px] text-slate-500">{certificate.pdf_filename}</span>
        </div>
        <iframe
          src={pdfUrl}
          title="Medico-Legal Certificate PDF Preview"
          className="w-full h-[520px] bg-slate-900"
        />
      </div>
    </div>
  );
}
