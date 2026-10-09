import React, { useState, useEffect } from 'react';
import { X, Ruler, Shield, Layers, Clock, Scissors, AlertTriangle, CheckCircle2 } from 'lucide-react';
import VoiceDictation from './VoiceDictation';

const INJURY_TYPES = [
  'Abrasion',
  'Contusion/Hematoma',
  'Laceration',
  'Incised Wound',
  'Stab Wound',
  'Fracture',
  'Burn',
  'Deformity'
];

const DEPTH_LAYERS = [
  'Skin (Epidermis/Dermis)',
  'Subcutaneous tissue',
  'Fascia / Muscle',
  'Bone / Cartilage',
  'Body Cavity (Pleural/Peritoneal)'
];

const SHAPES = ['Linear', 'Oval', 'Irregular', 'Spindle', 'Circular', 'Stellate'];
const MARGINS = ['Clean-cut & regular', 'Ragged & torn', 'Contused & abraded', 'Inverted', 'Everted'];
const AGES = [
  'Fresh / Red (0-24 hrs)',
  'Bluish-black (2-4 days)',
  'Greenish-yellow (4-7 days)',
  'Yellowish-brown (7-10 days)',
  'Healed / Scabbed (>10 days)'
];
const WEAPONS = [
  'Blunt force (Lathi / Rod / Fist / Stone)',
  'Sharp cutting (Knife / Razor / Blade / Scalpel)',
  'Sharp pointed (Dagger / Needle / Spike)',
  'Friction / Rough road surface (RTA)',
  'Thermal / Fire / Heated object',
  'Corrosive / Chemical'
];

export default function InjuryModal({ initialData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    anatomical_region: initialData?.anatomical_region || 'Forehead',
    body_side: initialData?.body_side || 'anterior',
    x_coord: initialData?.x_coord || 50,
    y_coord: initialData?.y_coord || 50,
    injury_type: initialData?.injury_type || 'Contusion/Hematoma',
    length_cm: initialData?.length_cm || '',
    width_cm: initialData?.width_cm || '',
    depth_cm: initialData?.depth_cm || '',
    depth_layer: initialData?.depth_layer || 'Subcutaneous tissue',
    shape: initialData?.shape || 'Linear',
    margins: initialData?.margins || 'Contused & abraded',
    age_of_injury: initialData?.age_of_injury || 'Fresh / Red (0-24 hrs)',
    suspected_weapon: initialData?.suspected_weapon || 'Blunt force (Lathi / Rod / Fist / Stone)',
    clinical_notes: initialData?.clinical_notes || ''
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.anatomical_region.trim()) {
      setValidationError('Please specify anatomical region.');
      return;
    }
    if (!formData.length_cm || parseFloat(formData.length_cm) <= 0) {
      if (formData.injury_type !== 'Fracture' && formData.injury_type !== 'Deformity') {
        setValidationError('Length (cm) must be a positive number for measurable forensic validity.');
        return;
      }
    }
    setValidationError('');
    onSave({
      ...formData,
      length_cm: parseFloat(formData.length_cm) || 0,
      width_cm: parseFloat(formData.width_cm) || 0,
      depth_cm: formData.depth_cm ? parseFloat(formData.depth_cm) : null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Structured Injury</h3>
              <p className="text-xs text-slate-400">
                Plotting on: <span className="text-sky-300 font-semibold">{formData.anatomical_region}</span> ({formData.body_side} view)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Region and Side Override */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anatomical Location / Landmark <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.anatomical_region}
                onChange={(e) => setFormData({ ...formData, anatomical_region: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
                placeholder="e.g. Forehead, Right Forearm, Left 5th Rib"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Injury Classification / Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.injury_type}
                onChange={(e) => setFormData({ ...formData, injury_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                {INJURY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Dimensions (Length x Width x Depth in cm) */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-sky-900/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" /> Metric Forensic Measurements (Centimeters)
              </span>
              <span className="text-[10px] text-slate-400">Required for court precision</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Length (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.length_cm}
                  onChange={(e) => setFormData({ ...formData, length_cm: e.target.value })}
                  placeholder="e.g. 4.5"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Width / Breadth (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.width_cm}
                  onChange={(e) => setFormData({ ...formData, width_cm: e.target.value })}
                  placeholder="e.g. 2.0"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Depth (cm, optional)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.depth_cm}
                  onChange={(e) => setFormData({ ...formData, depth_cm: e.target.value })}
                  placeholder="e.g. 1.2"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Tissue Layer, Shape & Margins */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Deepest Tissue Layer</label>
              <select
                value={formData.depth_layer}
                onChange={(e) => setFormData({ ...formData, depth_layer: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {DEPTH_LAYERS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Wound Shape</label>
              <select
                value={formData.shape}
                onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {SHAPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Edge Margins</label>
              <select
                value={formData.margins}
                onChange={(e) => setFormData({ ...formData, margins: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {MARGINS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Age of Injury & Suspected Weapon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Age of Injury</label>
              <select
                value={formData.age_of_injury}
                onChange={(e) => setFormData({ ...formData, age_of_injury: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {AGES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Suspected Weapon / Force Mechanism</label>
              <select
                value={formData.suspected_weapon}
                onChange={(e) => setFormData({ ...formData, suspected_weapon: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {WEAPONS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clinical Notes with Hands-free Voice Dictation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Descriptive Clinical Notes / Characteristics
              </label>
              <VoiceDictation
                onTranscript={(text) => {
                  setFormData(prev => ({
                    ...prev,
                    clinical_notes: prev.clinical_notes ? `${prev.clinical_notes} ${text}` : text
                  }));
                }}
              />
            </div>
            <textarea
              rows={2}
              value={formData.clinical_notes}
              onChange={(e) => setFormData({ ...formData, clinical_notes: e.target.value })}
              placeholder="e.g. Clean-cut edges with tailing at lower margin; tender on palpation; active bleeding controlled."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Injury Finding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
