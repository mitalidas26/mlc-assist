import React, { useState } from 'react';
import { Eye, RotateCcw, Plus, Trash2, Crosshair, AlertCircle } from 'lucide-react';

const REGIONS = {
  anterior: [
    { id: 'head_forehead', name: 'Forehead & Cranium', x: 50, y: 7, r: 5, path: 'M 42,4 C 42,2 58,2 58,4 C 61,7 61,11 58,13 C 55,14 45,14 42,13 C 39,11 39,7 42,4 Z' },
    { id: 'face', name: 'Face (Maxillofacial)', x: 50, y: 13, r: 4.5, path: 'M 43,13 C 45,13 55,13 57,13 C 57,17 55,20 50,21 C 45,20 43,17 43,13 Z' },
    { id: 'neck', name: 'Neck & Anterior Throat', x: 50, y: 22, r: 3, path: 'M 46,21 L 54,21 L 54,25 L 46,25 Z' },
    { id: 'clavicle_r', name: 'Right Clavicular Region', x: 60, y: 25, r: 3.5, path: 'M 54,25 L 67,27 L 66,29 L 54,26 Z' },
    { id: 'clavicle_l', name: 'Left Clavicular Region', x: 40, y: 25, r: 3.5, path: 'M 46,25 L 33,27 L 34,29 L 46,26 Z' },
    { id: 'chest_r', name: 'Right Thorax / Chest', x: 58, y: 31, r: 6, path: 'M 53,26 L 66,28 L 64,38 L 52,38 Z' },
    { id: 'chest_l', name: 'Left Thorax / Chest', x: 42, y: 31, r: 6, path: 'M 47,26 L 34,28 L 36,38 L 48,38 Z' },
    { id: 'abdomen', name: 'Abdomen / Epigastrium', x: 50, y: 43, r: 6.5, path: 'M 37,39 L 63,39 L 61,48 L 39,48 Z' },
    { id: 'pelvis', name: 'Pelvis / Inguinal Region', x: 50, y: 52, r: 5.5, path: 'M 39,49 L 61,49 L 58,56 L 42,56 Z' },
    { id: 'arm_upper_r', name: 'Right Upper Arm (Brachium)', x: 72, y: 33, r: 4.5, path: 'M 67,28 L 76,31 L 73,42 L 65,39 Z' },
    { id: 'arm_upper_l', name: 'Left Upper Arm (Brachium)', x: 28, y: 33, r: 4.5, path: 'M 33,28 L 24,31 L 27,42 L 35,39 Z' },
    { id: 'forearm_r', name: 'Right Forearm & Wrist', x: 77, y: 46, r: 4, path: 'M 74,43 L 80,45 L 77,57 L 72,55 Z' },
    { id: 'forearm_l', name: 'Left Forearm & Wrist', x: 23, y: 46, r: 4, path: 'M 26,43 L 20,45 L 23,57 L 28,55 Z' },
    { id: 'hand_r', name: 'Right Hand & Digits', x: 80, y: 61, r: 3.5, path: 'M 77,58 L 83,59 L 81,66 L 76,64 Z' },
    { id: 'hand_l', name: 'Left Hand & Digits', x: 20, y: 61, r: 3.5, path: 'M 23,58 L 17,59 L 19,66 L 24,64 Z' },
    { id: 'thigh_r', name: 'Right Thigh (Femoral)', x: 57, y: 64, r: 6, path: 'M 51,56 L 61,56 L 59,73 L 51,73 Z' },
    { id: 'thigh_l', name: 'Left Thigh (Femoral)', x: 43, y: 64, r: 6, path: 'M 39,56 L 49,56 L 49,73 L 41,73 Z' },
    { id: 'knee_r', name: 'Right Knee & Patella', x: 56, y: 76, r: 3.5, path: 'M 51,74 L 59,74 L 58,80 L 51,80 Z' },
    { id: 'knee_l', name: 'Left Knee & Patella', x: 44, y: 76, r: 3.5, path: 'M 41,74 L 49,74 L 49,80 L 42,80 Z' },
    { id: 'leg_r', name: 'Right Lower Leg & Shin', x: 55, y: 86, r: 4.5, path: 'M 51,81 L 58,81 L 56,92 L 51,92 Z' },
    { id: 'leg_l', name: 'Left Lower Leg & Shin', x: 45, y: 86, r: 4.5, path: 'M 42,81 L 49,81 L 49,92 L 44,92 Z' },
    { id: 'foot_r', name: 'Right Foot & Ankle', x: 56, y: 95, r: 3, path: 'M 51,93 L 57,93 L 60,98 L 51,98 Z' },
    { id: 'foot_l', name: 'Left Foot & Ankle', x: 44, y: 95, r: 3, path: 'M 43,93 L 49,93 L 49,98 L 40,98 Z' }
  ],
  posterior: [
    { id: 'occiput', name: 'Occipital & Posterior Scalp', x: 50, y: 8, r: 5.5, path: 'M 42,3 C 42,1 58,1 58,3 C 62,7 61,13 58,16 C 54,17 46,17 42,16 C 39,13 38,7 42,3 Z' },
    { id: 'cervical_spine', name: 'Posterior Neck & Cervical Spine', x: 50, y: 21, r: 3.5, path: 'M 46,17 L 54,17 L 54,24 L 46,24 Z' },
    { id: 'upper_back', name: 'Upper Back / Interscapular', x: 50, y: 31, r: 7, path: 'M 35,25 L 65,25 L 62,39 L 38,39 Z' },
    { id: 'scapula_r', name: 'Right Scapular Region', x: 62, y: 30, r: 4.5, path: 'M 54,25 L 66,27 L 63,38 L 53,36 Z' },
    { id: 'scapula_l', name: 'Left Scapular Region', x: 38, y: 30, r: 4.5, path: 'M 46,25 L 34,27 L 37,38 L 47,36 Z' },
    { id: 'lumbar_back', name: 'Lumbar Spine & Flank', x: 50, y: 44, r: 6.5, path: 'M 38,40 L 62,40 L 60,49 L 40,49 Z' },
    { id: 'gluteal_r', name: 'Right Gluteal Region', x: 57, y: 53, r: 5, path: 'M 50,50 L 61,50 L 59,58 L 50,58 Z' },
    { id: 'gluteal_l', name: 'Left Gluteal Region', x: 43, y: 53, r: 5, path: 'M 39,50 L 50,50 L 50,58 L 41,58 Z' },
    { id: 'post_thigh_r', name: 'Right Posterior Thigh (Hamstring)', x: 57, y: 65, r: 5.5, path: 'M 51,59 L 60,59 L 58,74 L 51,74 Z' },
    { id: 'post_thigh_l', name: 'Left Posterior Thigh (Hamstring)', x: 43, y: 65, r: 5.5, path: 'M 40,59 L 49,59 L 49,74 L 42,74 Z' },
    { id: 'popliteal_r', name: 'Right Popliteal Fossa', x: 56, y: 76, r: 3.5, path: 'M 51,75 L 58,75 L 57,80 L 51,80 Z' },
    { id: 'popliteal_l', name: 'Left Popliteal Fossa', x: 44, y: 76, r: 3.5, path: 'M 42,75 L 49,75 L 49,80 L 43,80 Z' },
    { id: 'calf_r', name: 'Right Calf / Achilles', x: 55, y: 86, r: 4.5, path: 'M 51,81 L 58,81 L 56,92 L 51,92 Z' },
    { id: 'calf_l', name: 'Left Calf / Achilles', x: 45, y: 86, r: 4.5, path: 'M 42,81 L 49,81 L 49,92 L 44,92 Z' }
  ]
};

export default function AnatomicalMap({ injuries = [], onSelectPoint, onSelectInjury, onDeleteInjury }) {
  const [side, setSide] = useState('anterior');
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  const currentRegions = REGIONS[side] || [];
  const currentInjuries = injuries.filter(i => (i.body_side || 'anterior') === side);

  const handleSvgClick = (e) => {
    // Only handle direct clicks on diagram canvas or regions
    const svgRect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - svgRect.left) / svgRect.width) * 100);
    const yPct = Math.round(((e.clientY - svgRect.top) / svgRect.height) * 100);

    // Find closest region
    let closestRegion = hoveredRegion?.name || (side === 'anterior' ? 'General Body (Anterior)' : 'General Body (Posterior)');
    
    if (onSelectPoint) {
      onSelectPoint({
        anatomical_region: closestRegion,
        body_side: side,
        x_coord: xPct,
        y_coord: yPct
      });
    }
  };

  const getPinColor = (type) => {
    switch (type) {
      case 'Fracture':
      case 'Deformity':
        return '#F59E0B'; // Amber
      case 'Incised Wound':
      case 'Stab Wound':
        return '#06B6D4'; // Cyan
      case 'Laceration':
      case 'Contusion/Hematoma':
        return '#F43F5E'; // Rose
      case 'Abrasion':
      default:
        return '#10B981'; // Emerald
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col items-center select-none">
      {/* Top Controls: View Toggle and Mode */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Anatomical View:</span>
          <div className="inline-flex rounded-lg bg-slate-900/90 p-1 border border-slate-700/60">
            <button
              onClick={() => { setSide('anterior'); setSelectedPin(null); }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                side === 'anterior'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Anterior (Front)
            </button>
            <button
              onClick={() => { setSide('posterior'); setSelectedPin(null); }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                side === 'posterior'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Posterior (Back)
            </button>
          </div>
        </div>

        <div className="text-xs text-sky-400/90 flex items-center gap-1 font-medium bg-sky-950/40 px-2.5 py-1 rounded-full border border-sky-800/40">
          <Crosshair className="w-3.5 h-3.5 animate-pulse" />
          <span>Tap body to plot injury</span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full max-w-[340px] aspect-[1/2] bg-slate-950/60 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full anatomical-svg relative z-10 cursor-crosshair"
          onClick={handleSvgClick}
        >
          {/* Anatomical Regions */}
          {currentRegions.map((region) => (
            <path
              key={region.id}
              d={region.path}
              className={`body-region-path ${hoveredRegion?.id === region.id ? 'body-region-selected' : ''}`}
              onMouseEnter={() => setHoveredRegion(region)}
              onMouseLeave={() => setHoveredRegion(null)}
            />
          ))}

          {/* Render Plotted Injury Pins */}
          {currentInjuries.map((inj, idx) => {
            const pinColor = getPinColor(inj.injury_type);
            const isSelected = selectedPin?.id === inj.id;

            return (
              <g
                key={inj.id || idx}
                className="injury-pin"
                transform={`translate(${inj.x_coord || 50}, ${inj.y_coord || 50})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin(isSelected ? null : inj);
                  if (onSelectInjury) onSelectInjury(inj);
                }}
              >
                {/* Outer animated pulse ring */}
                <circle cx="0" cy="0" r="4" fill="none" stroke={pinColor} strokeWidth="1" className="pin-pulse" />
                
                {/* Main pin body */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "4.5" : "3.5"}
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
                />
                
                {/* Injury number tag */}
                <text
                  x="0"
                  y="1.2"
                  fontSize="2.4"
                  fontWeight="bold"
                  fill="#000000"
                  textAnchor="middle"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Pin Details Overlay Card */}
        {selectedPin && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 border border-sky-500/50 p-3 rounded-lg shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getPinColor(selectedPin.injury_type) }}
                  />
                  <span className="text-xs font-bold text-white">
                    {selectedPin.injury_type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({selectedPin.length_cm}×{selectedPin.width_cm}cm)
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                  📍 {selectedPin.anatomical_region}
                </div>
                {selectedPin.clinical_notes && (
                  <div className="text-[10px] text-slate-400 italic mt-1 line-clamp-2">
                    "{selectedPin.clinical_notes}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteInjury) onDeleteInjury(selectedPin.id);
                    setSelectedPin(null);
                  }}
                  className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                  title="Remove Injury"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hovered Region Indicator */}
      <div className="w-full mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>Target: <strong className="text-sky-300">{hoveredRegion?.name || 'Pointer active'}</strong></span>
        <span>Mapped: <strong className="text-white">{currentInjuries.length} {side}</strong></span>
      </div>

      {/* Quick Legend */}
      <div className="w-full mt-3 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Abrasion / Surface</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Contusion / Laceration</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Incised / Stab Wound</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Fracture / Deformity</span>
        </div>
      </div>
    </div>
  );
}
