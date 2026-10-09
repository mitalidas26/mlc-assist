import React, { useState, useEffect } from 'react';
import {
  Shield, Activity, FileText, CheckCircle2, AlertTriangle, Scale,
  Download, Eye, Sparkles, RefreshCw, Trash2, Plus, ArrowRight
} from 'lucide-react';

import Navbar from './components/Navbar';
import AnatomicalMap from './components/BodyDiagram/AnatomicalMap';
import InjuryModal from './components/InjuryModal';
import PatientIntakeForm from './components/PatientIntakeForm';
import VagueWordingBanner from './components/VagueWordingBanner';
import LegalRAGPanel from './components/LegalRAGPanel';
import CertificateView from './components/CertificateView';
import VerificationPortal from './components/VerificationPortal';
import BNSLibraryModal from './components/BNSLibraryModal';

import {
  fetchHealth, fetchCase, createCase, addCaseInjury, removeCaseInjury,
  analyzeCase, generateCertificate, getExistingCertificate, seedDemoCases
} from './api/client';

export default function App() {
  const [view, setView] = useState('clinical'); // 'clinical' | 'verify'
  const [backendOnline, setBackendOnline] = useState(true);
  const [bnsModalOpen, setBnsModalOpen] = useState(false);

  // Case State
  const [currentCase, setCurrentCase] = useState(null);
  const [selectedPinForModal, setSelectedPinForModal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Analysis & Certification State
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [certLoading, setCertLoading] = useState(false);
  const [verifyHashToOpen, setVerifyHashToOpen] = useState('');

  // Initial check & default case creation on startup
  useEffect(() => {
    fetchHealth()
      .then(() => {
        setBackendOnline(true);
        // Pre-seed demo cases and load default Case 1 (Blunt Assault)
        seedDemoCases()
          .then((res) => {
            if (res.cases && res.cases.length > 0) {
              loadCaseById(res.cases[0].id);
            }
          })
          .catch(() => createDefaultCase());
      })
      .catch((err) => {
        console.warn('Backend offline:', err);
        setBackendOnline(false);
      });
  }, []);

  const createDefaultCase = async () => {
    const newCasePayload = {
      patient_name: 'Rajesh Verma',
      age: 34,
      gender: 'Male',
      guardian_name: 'Suresh Verma (Father)',
      address: 'Central Colony, Guwahati, Assam',
      brought_by: 'Head Constable Dilip Kumar (#412)',
      police_station: 'Paltan Bazar PS',
      constable_details: 'GD No. 84/2026',
      incident_history: 'Alleged physical assault by known persons with wooden stick around 18:30 hrs today. Severe pain over left chest and forehead.',
      doctor_name: 'Dr. Ananya Roy, MD (Forensic Medicine)',
      doctor_reg_no: 'MCI-529144'
    };

    try {
      const res = await createCase(newCasePayload);
      if (res.case_id) {
        loadCaseById(res.case_id);
      }
    } catch (e) {
      console.error('Failed to create default case', e);
    }
  };

  const loadCaseById = async (caseId) => {
    try {
      const c = await fetchCase(caseId);
      setCurrentCase(c);
      setCertificate(null);
      
      // Auto run analysis on loaded case
      runCaseAnalysis(caseId);

      // Check if existing certificate exists
      const existingCert = await getExistingCertificate(caseId);
      if (existingCert) {
        setCertificate(existingCert);
      }
    } catch (err) {
      console.error('Failed to load case:', err);
    }
  };

  const handleDemoCaseSelect = async (type) => {
    try {
      const seedRes = await seedDemoCases();
      if (seedRes.cases) {
        let targetCase = seedRes.cases[0]; // Default assault
        if (type === 'knife') targetCase = seedRes.cases[1];
        if (type === 'rta') targetCase = seedRes.cases[2];
        if (targetCase) {
          loadCaseById(targetCase.id);
        }
      }
    } catch (e) {
      console.error('Failed to load demo scenario', e);
    }
  };

  const runCaseAnalysis = async (caseId) => {
    const idToUse = caseId || currentCase?.id;
    if (!idToUse) return;

    setAnalysisLoading(true);
    try {
      const res = await analyzeCase(idToUse);
      setAnalysis(res);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handlePointSelectOnBody = (point) => {
    setSelectedPinForModal({
      anatomical_region: point.anatomical_region,
      body_side: point.body_side,
      x_coord: point.x_coord,
      y_coord: point.y_coord,
      injury_type: 'Contusion/Hematoma',
      length_cm: '',
      width_cm: '',
      depth_cm: ''
    });
    setModalOpen(true);
  };

  const handleSaveInjury = async (injuryData) => {
    if (!currentCase) return;

    try {
      await addCaseInjury(currentCase.id, injuryData);
      setModalOpen(false);
      setSelectedPinForModal(null);
      // Reload updated case
      const updated = await fetchCase(currentCase.id);
      setCurrentCase(updated);
      runCaseAnalysis(currentCase.id);
    } catch (err) {
      console.error('Failed to add injury:', err);
    }
  };

  const handleDeleteInjury = async (injuryId) => {
    try {
      await removeCaseInjury(injuryId);
      if (currentCase) {
        const updated = await fetchCase(currentCase.id);
        setCurrentCase(updated);
        runCaseAnalysis(currentCase.id);
      }
    } catch (err) {
      console.error('Failed to delete injury:', err);
    }
  };

  const handleDoctorSignAndIssueCertificate = async (opinionData) => {
    if (!currentCase) return;

    setCertLoading(true);
    try {
      const certRes = await generateCertificate(currentCase.id, {
        doctor_name: currentCase.doctor_name,
        doctor_reg_no: currentCase.doctor_reg_no,
        doctor_decision: opinionData.doctor_decision,
        doctor_notes: opinionData.doctor_notes
      });
      setCertificate(certRes);
    } catch (err) {
      console.error('Failed to issue certificate:', err);
    } finally {
      setCertLoading(false);
    }
  };

  const handleResetNewCase = () => {
    createDefaultCase();
    setAnalysis(null);
    setCertificate(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={view}
        onSelectView={(v) => { setView(v); setVerifyHashToOpen(''); }}
        onNewCase={handleResetNewCase}
        onOpenBNSModal={() => setBnsModalOpen(true)}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {view === 'verify' ? (
          <VerificationPortal initialHash={verifyHashToOpen} />
        ) : (
          <div className="space-y-6">
            {/* Top Patient Intake & Demo Bar */}
            <PatientIntakeForm
              currentCase={currentCase}
              onSaveCase={(data) => {
                if (currentCase) {
                  setCurrentCase({ ...currentCase, ...data });
                }
              }}
              onLoadDemoCase={handleDemoCaseSelect}
            />

            {/* Core Working Grid: Left (Anatomical 2D Body Map + Injury Log) | Right (Vague Wording + Legal RAG + Certificate) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 2D Anatomical Map & Recorded Injuries Table (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <AnatomicalMap
                  injuries={currentCase?.injuries || []}
                  onSelectPoint={handlePointSelectOnBody}
                  onDeleteInjury={handleDeleteInjury}
                />

                {/* Injury findings list table */}
                <div className="glass-panel p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-400" />
                      Recorded Injuries ({currentCase?.injuries?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPinForModal({
                          anatomical_region: 'Forehead',
                          body_side: 'anterior',
                          x_coord: 50,
                          y_coord: 15
                        });
                        setModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Finding
                    </button>
                  </div>

                  {(!currentCase?.injuries || currentCase.injuries.length === 0) ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No injuries logged. Tap any anatomical region on the body diagram above.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {currentCase.injuries.map((inj, i) => (
                        <div
                          key={inj.id || i}
                          className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors text-xs flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-sky-950 text-sky-400 font-bold text-[10px] flex items-center justify-center font-mono border border-sky-800/40">
                                {i + 1}
                              </span>
                              <span className="font-bold text-white">{inj.injury_type}</span>
                              <span className="text-[10px] font-mono text-emerald-400">
                                ({inj.length_cm} × {inj.width_cm}{inj.depth_cm ? ` × ${inj.depth_cm}` : ''} cm)
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-300 mt-1">
                              📍 {inj.anatomical_region} ({inj.body_side || 'anterior'}) • <span className="text-slate-400">{inj.suspected_weapon}</span>
                            </div>
                            {inj.clinical_notes && (
                              <p className="text-[10px] text-slate-400 italic mt-1 bg-slate-950/60 p-1.5 rounded">
                                "{inj.clinical_notes}"
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteInjury(inj.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete injury"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Vague Wording Linter + Legal RAG Review + Certificate View (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Vague Wording Linter Banner */}
                <VagueWordingBanner flags={analysis?.vague_wording_flags || []} />

                {/* 2. Legal RAG Review Panel */}
                <LegalRAGPanel
                  analysis={analysis}
                  doctorName={currentCase?.doctor_name}
                  onDoctorConfirm={handleDoctorSignAndIssueCertificate}
                  onOpenBNSModal={() => setBnsModalOpen(true)}
                />

                {/* 3. Certificate Issuance & Preview */}
                {certLoading && (
                  <div className="glass-panel p-8 text-center space-y-2">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-400" />
                    <p className="text-xs font-mono text-slate-400">
                      Generating structured Medico-Legal PDF & calculating SHA-256 cryptographic digest...
                    </p>
                  </div>
                )}

                {certificate && (
                  <CertificateView
                    certificate={certificate}
                    onNavigateToVerify={(hash) => {
                      setVerifyHashToOpen(hash);
                      setView('verify');
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Structured Injury Capture Modal */}
      {modalOpen && (
        <InjuryModal
          initialData={selectedPinForModal}
          onClose={() => { setModalOpen(false); setSelectedPinForModal(null); }}
          onSave={handleSaveInjury}
        />
      )}

      {/* BNS Statutory Reference Library Modal */}
      {bnsModalOpen && (
        <BNSLibraryModal onClose={() => setBnsModalOpen(false)} />
      )}
    </div>
  );
}
