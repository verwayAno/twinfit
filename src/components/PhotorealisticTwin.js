"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShieldCheck, ShieldAlert, Activity, Target, Zap, Waves, Thermometer } from "lucide-react";

/**
 * RECALIBRATED COORDINATES (1.7x Zoom Precision)
 * Mapped for anatomical center-points on the magnified Clinical Scans.
 */
const ZONE_MAP = {
  anterior: [
    { id: "Right Shoulder", key: "shouldersDeltoids", top: "20%", left: "36%", bio: "LOAD: 72%" },
    { id: "Left Shoulder", key: "shouldersDeltoids", top: "20%", left: "64%", bio: "SENS: 14ms" },
    { id: "Chest", key: "chest", top: "26%", left: "50%", bio: "O2 SAT: 98%" },
    { id: "Right Bicep", key: "biceps", top: "32%", left: "28%" },
    { id: "Left Bicep", key: "biceps", top: "32%", left: "72%" },
    { id: "Abdominals", key: "abdominals", top: "42%", left: "50%", bio: "CORE: 37.2°C" },
    { id: "Right Quad", key: "quadriceps", top: "66%", left: "42%", bio: "PWR: 840W" },
    { id: "Left Quad", key: "quadriceps", top: "66%", left: "58%" },
    { id: "Groin", key: "groinAdductors", top: "54%", left: "50%" },
    { id: "Right Knee", key: "knees", top: "82%", left: "42%", bio: "FLX: 142°" },
    { id: "Left Knee", key: "knees", top: "82%", left: "58%" },
    { id: "Right Ankle", key: "ankles", top: "96%", left: "42%" },
    { id: "Left Ankle", key: "ankles", top: "96%", left: "58%" },
  ],
  posterior: [
    { id: "Upper Back", key: "upperBack", top: "24%", left: "50%", bio: "STRN: 42kg" },
    { id: "Lower Back", key: "lowerBack", top: "46%", left: "50%", bio: "LMBR: STABLE" },
    { id: "Glutes", key: "glutes", top: "58%", left: "50%" },
    { id: "Right Tricep", key: "triceps", top: "32%", left: "28%" },
    { id: "Left Tricep", key: "triceps", top: "32%", left: "72%" },
    { id: "Right Hamstring", key: "hamstrings", top: "70%", left: "42%", bio: "RECOV: 64%" },
    { id: "Left Hamstring", key: "hamstrings", top: "70%", left: "58%", bio: "RECOV: 82%" },
    { id: "Right Calf", key: "calvesGastrocnemius", top: "86%", left: "43%" },
    { id: "Left Calf", key: "calvesGastrocnemius", top: "86%", left: "57%" },
    { id: "Right Ankle", key: "ankles", top: "98%", left: "43%" },
    { id: "Left Ankle", key: "ankles", top: "98%", left: "57%" },
  ]
};

function getRiskColor(value) {
  if (value >= 75) return "#ef4444"; // Red
  if (value >= 40) return "#f59e0b"; // Amber
  return "#22d3ee"; // Cyan
}

export default function PhotorealisticTwin({ 
  risks = {}, 
  reportedZones = [], 
  activeZoneId = null, 
  onZoneClick = () => {},
  isSplit = false,
  size = "large" 
}) {
  const [view, setView] = useState("anterior");

  const containerSizes = {
    small: "w-[180px] h-[380px]",
    large: "w-[280px] h-[580px]",
    split: "w-[340px] h-[720px]" 
  };

  if (isSplit) {
    return (
      <div className="flex flex-nowrap justify-center gap-12 w-full max-w-[850px] p-4 overflow-visible">
        <HumanoidView 
          view="anterior" 
          containerSize={containerSizes.split}
          risks={risks}
          reportedZones={reportedZones}
          activeZoneId={activeZoneId}
          onZoneClick={onZoneClick}
          label="ANTERIOR SYSTEM SCAN"
          isZoomed={true}
        />
        <HumanoidView 
          view="posterior" 
          containerSize={containerSizes.split}
          risks={risks}
          reportedZones={reportedZones}
          activeZoneId={activeZoneId}
          onZoneClick={onZoneClick}
          label="POSTERIOR SYSTEM SCAN"
          isZoomed={true}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full relative">
      <div className="w-full flex justify-end mb-2 absolute top-0 right-0 z-50">
        <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 backdrop-blur-md shadow-2xl">
          {["anterior", "posterior"].map(v => (
            <button 
              key={v}
              onClick={() => setView(v)} 
              className={`px-4 py-1.5 text-[10px] rounded-md transition-all font-black tracking-widest uppercase ${view === v ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className={`relative perspective ${containerSizes[size]} group`}>
        <motion.div
          animate={{ rotateY: view === "anterior" ? 0 : 180 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 80, damping: 20 }}
          className="w-full h-full relative transform-style-3d overflow-hidden rounded-[2.5rem] bg-slate-900/10 backdrop-blur-xl border border-white/5"
        >
          <div className="absolute inset-0 backface-hidden w-full h-full">
             <img src="/images/athlete_anterior.png" className="w-full h-full object-contain scale-[1.7] translate-y-[-2%] opacity-60 mix-blend-screen grayscale brightness-125" alt="Anterior" />
             <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
             <HeatmapLayer view="anterior" risks={risks} reportedZones={reportedZones} activeZoneId={activeZoneId} onZoneClick={onZoneClick} />
          </div>
          <div className="absolute inset-0 backface-hidden w-full h-full" style={{ rotateY: 180 }}>
             <img src="/images/athlete_posterior.png" className="w-full h-full object-contain scale-[1.7] translate-y-[-2%] opacity-60 mix-blend-screen grayscale brightness-125" alt="Posterior" />
             <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
             <HeatmapLayer view="posterior" risks={risks} reportedZones={reportedZones} activeZoneId={activeZoneId} onZoneClick={onZoneClick} />
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .perspective { perspective: 1200px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}

function HumanoidView({ view, containerSize, risks, reportedZones, activeZoneId, onZoneClick, label, isZoomed }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className={`relative ${containerSize} rounded-[4rem] bg-slate-950/40 border border-white/10 overflow-hidden group shadow-[inset_0_0_80px_rgba(34,211,238,0.1)] backdrop-blur-2xl p-6 hover:border-cyan-500/40 transition-all duration-700`}>
        
        {/* Hologram Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(34,211,238,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />

        <img 
          src={view === 'anterior' ? "/images/athlete_anterior.png" : "/images/athlete_posterior.png"} 
          className={`w-full h-full object-contain opacity-70 mix-blend-screen transition-all duration-1000 grayscale select-none
            ${isZoomed ? 'scale-[1.7] translate-y-[-2%] group-hover:scale-[1.75]' : ''}`} 
          alt={label} 
        />
        
        <HeatmapLayer 
          view={view} 
          risks={risks} 
          reportedZones={reportedZones} 
          activeZoneId={activeZoneId} 
          onZoneClick={onZoneClick} 
        />
        
        {/* Top Header Labels */}
        <div className="absolute top-10 left-10 flex flex-col gap-1 opacity-40">
           <span className="text-[8px] font-black text-cyan-400 tracking-widest uppercase">Subject Data ID</span>
           <span className="text-[12px] font-mono text-white">45-921-XRT</span>
        </div>

        {/* HUD Pulse */}
        <div className="absolute bottom-12 left-12 flex items-center gap-4 z-40">
           <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_15px_#22d3ee]" />
              <div className="absolute w-5 h-5 border border-cyan-500/30 rounded-full animate-ping" />
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-cyan-400 tracking-[0.4em] uppercase">Holostic Scan</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Predictive AI Active</span>
           </div>
        </div>
      </div>
      <span className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-400 flex items-center gap-3">
         <Activity size={16} className="text-cyan-500" /> {label}
      </span>
    </div>
  );
}

function HeatmapLayer({ view, risks, reportedZones, activeZoneId, onZoneClick }) {
  const hotspots = ZONE_MAP[view];

  return (
    <>
      <AnimatePresence>
        {hotspots.map((hs) => {
          const riskObj = risks[hs.key] || { total: 0 };
          const riskScore = riskObj.total || 0;
          const color = getRiskColor(riskScore);
          const isReported = reportedZones.includes(hs.id);
          const isActive = activeZoneId === hs.id;

          return (
            <div 
              key={hs.id} 
              className="absolute z-10 w-24 h-24 -ml-12 -mt-12 flex items-center justify-center cursor-pointer group/hot" 
              style={{ top: hs.top, left: hs.left }}
              onClick={() => onZoneClick(hs)}
            >
              {/* The "Hologram thermal heatmap" blobs  */}
              {(riskScore > 10 || isActive || isReported) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.6, 
                    scale: riskScore > 75 ? 1.4 : 1.1,
                    backgroundColor: color 
                  }}
                  className={`absolute inset-0 rounded-full filter blur-[40px] pointer-events-none 
                    ${riskScore > 75 ? 'animate-pulse' : ''}`}
                  style={{ opacity: 0.6 }}
                />
              )}

              {/* Bio-data HUD Floating Labels */}
              {(hs.bio && (isActive || riskScore > 30)) && (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="absolute left-10 top-0 pointer-events-none flex items-center gap-3 whitespace-nowrap z-50"
                >
                   <div className="w-8 h-px bg-cyan-500/40" />
                   <div className="bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded border border-cyan-500/30 flex items-center gap-2">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                      <span className="text-[9px] font-mono font-bold text-cyan-400 tracking-tighter uppercase">{hs.bio}</span>
                   </div>
                </motion.div>
              )}

              {/* Visual Interaction Target */}
              <div className={`w-6 h-6 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 group-hover/hot:scale-125 group-hover/hot:border-white/40 ${riskScore > 10 || isReported || isActive ? 'opacity-0 scale-0' : 'opacity-100'}`}>
                 <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
              </div>

              {isActive && (
                <motion.div 
                  layoutId="activeZone"
                  className="absolute w-10 h-10 border-2 border-white rounded-full shadow-[0_0_30px_white] z-20"
                  transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                />
              )}

              {/* Reported Pain Marker */}
              {isReported && (
                <div className="absolute inset-0 m-auto w-6 h-6 flex items-center justify-center z-30">
                   <div className="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-50" />
                   <div className="absolute w-full h-full bg-red-500 rounded-full shadow-[0_0_20px_#ef4444]" />
                   <div className="w-2.5 h-2.5 bg-white rounded-full relative z-10" />
                </div>
              )}
            </div>
          );
        })}
      </AnimatePresence>
    </>
  );
}
