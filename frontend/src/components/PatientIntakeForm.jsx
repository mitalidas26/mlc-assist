import React, { useState } from 'react';
import { User, ShieldAlert, Sparkles, Building2, MapPin, Calendar, FilePlus2, Play } from 'lucide-react';
import VoiceDictation from './VoiceDictation';

export default function PatientIntakeForm({
  currentCase,
  onSaveCase,
  onLoadDemoCase,
  isCreating = false
}) {
  const [formData, setFormData] = useState({
    patient_name: currentCase?.patient_name || '',
    age: currentCase?.age || '',
    gender: currentCase?.gender || 'Male',
    guardian_name: currentCase?.guardian_name || '',
    address: currentCase?.address || '',
    brought_by: currentCase?.brought_by || 'Self / Relatives',
    police_station: currentCase?.police_station || 'Casualty Outpost PS',
    constable_details: currentCase?.constable_details || '',
    incident_history: currentCase?.incident_history || '',
    doctor_name: currentCase?.doctor_name || 'Dr. S. Sharma, MD (Forensic Medicine)',
    doctor_reg_no: currentCase?.doctor_reg_no || 'MCI-489201'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.age) return;
    onSaveCase({
      ...formData,
      age: parseInt(formData.age, 10)
    });
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Header with Quick Demo Loaders */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Casualty Registration & Trauma History</h3>
            <p className="text-[11px] text-slate-400">Enter patient intake details and police intimation information</p>
          </div>
        </div>

        {/* Demo Cases Quick Fill */}
        {onLoadDemoCase && (
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-sky-400 font-semibold px-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Demo Scenarios:
            </span>
            <button
              type="button"
              onClick={() => onLoadDemoCase('assault')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              1. Blunt Assault
            </button>
            <button
              type="button"
              onClick={() => onLoadDemoCase('knife')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              2. Knife Wound
            </button>
            <button
              type="button"
              onClick={() => onLoadDemoCase('rta')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              3. Road Accident
            </button>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Patient Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.patient_name}
              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
              placeholder="e.g. Rajesh Verma"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Age (Years) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="120"
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="e.g. 34"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian / Relative Name</label>
            <input
              type="text"
              value={formData.guardian_name}
              onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
              placeholder="e.g. Suresh Verma (Father)"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Brought By / Accompanied By</label>
            <input
              type="text"
              value={formData.brought_by}
              onChange={(e) => setFormData({ ...formData, brought_by: e.target.value })}
              placeholder="e.g. Head Constable Dilip Kumar (#412)"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Police Station / GD Reference</label>
            <input
              type="text"
              value={formData.police_station}
              onChange={(e) => setFormData({ ...formData, police_station: e.target.value })}
              placeholder="e.g. Paltan Bazar PS (GD 84/2026)"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Alleged Incident History with Voice Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">
              Alleged Incident History & Patient Statement
            </label>
            <VoiceDictation
              onTranscript={(text) => {
                setFormData(prev => ({
                  ...prev,
                  incident_history: prev.incident_history ? `${prev.incident_history} ${text}` : text
                }));
              }}
            />
          </div>
          <textarea
            rows={2}
            value={formData.incident_history}
            onChange={(e) => setFormData({ ...formData, incident_history: e.target.value })}
            placeholder="e.g. History of assault with wooden stick around 18:30 hrs today following verbal argument. Complains of severe pain over left rib cage and forehead swelling."
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
          >
            <FilePlus2 className="w-4 h-4" />
            {isCreating ? 'Initialize MLC Case' : 'Update Case Demographics'}
          </button>
        </div>
      </form>
    </div>
  );
}
