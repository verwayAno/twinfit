"use client";

import { useState } from "react";
import { Search, ChevronRight, User, Briefcase, Star, Activity } from "lucide-react";
import { calculateInjuryRisk } from "@/utils/injuryModel";

const POS = {
  Striker:    { label: "STR", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  Midfielder: { label: "MID", color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  Defender:   { label: "DEF", color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  Goalkeeper: { label: "GK",  color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

const INJTAG = {
  hamstring:  { label: "Hamstring",  c: "#f97316" },
  knee:       { label: "Knee",       c: "#ef4444" },
  lower_back: { label: "Lower Back", c: "#ec4899" },
  none:       null,
};

function fmtVal(v) {
  return v >= 1e6 ? `€${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `€${(v/1e3).toFixed(0)}K` : `€${v}`;
}

// -------------------------------------------------------------
// Helper Component: PlayerAvatar with Baseline Predictive Ring
// -------------------------------------------------------------
function PlayerAvatar({ player, size = "small" }) {
  const [imgError, setImgError] = useState(false);

  // Calculate baseline risk (expected_play_time: 0, standard temp)
  const baselineRisks = calculateInjuryRisk(player, { expected_play_time: 0, temperature: 20 });
  const maxRisk = Math.max(baselineRisks.hamstrings, baselineRisks.knees, baselineRisks.lowerBack);

  // Ring determination logic
  let ringClass = "border-emerald-500/50";
  let dotClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
  
  if (maxRisk > 65) {
    ringClass = "border-red-500/80";
    dotClass = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]";
  } else if (maxRisk >= 40) {
    ringClass = "border-amber-500/70";
    dotClass = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]";
  }

  const dims = size === "large" ? "w-20 h-20 border-[3px]" : "w-[38px] h-[38px] border-2";
  const inits = player.name.split(" ").map(n => n[0]).join("");

  return (
    <div className={`relative ${dims} rounded-full flex items-center justify-center bg-slate-800 ${ringClass} shrink-0`}>
       {!imgError && player.imageUrl ? (
         <img 
           src={player.imageUrl} 
           alt={player.name} 
           className="w-full h-full rounded-full object-cover p-0.5"
           onError={() => setImgError(true)}
         />
       ) : (
         <span className={`font-bold text-slate-300 ${size === 'large' ? 'text-2xl' : 'text-xs'}`}>{inits}</span>
       )}
       {/* Status Dot */}
       <div className={`absolute -bottom-0.5 -right-0.5 ${size === 'large' ? 'w-4 h-4' : 'w-2.5 h-2.5'} rounded-full border-[1.5px] border-[#0f172a] ${dotClass}`} />
    </div>
  );
}


// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
export default function IdentityPanel({ players, selected, onSelect, approvals = {}, playerSubmissions = {} }) {
  const [q, setQ] = useState("");
  
  const filtered  = players.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.position.toLowerCase().includes(q.toLowerCase())
  );
  
  const pos = selected ? POS[selected.position] : null;
  const inj = selected ? INJTAG[selected.injury_history] : null;

  return (
    <div className="glass p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-cyan-500/10">
          <User size={14} className="text-cyan-400" />
        </div>
        <span className="hud-label text-cyan-400">Scouting Identity</span>
        <span className="ml-auto hud-label">{players.length} athletes</span>
      </div>

      {/* TOP: Expanded Scouting Profile (Selected Player) */}
      {selected && pos && (
        <div className="flex flex-col gap-3 py-1 bg-slate-900/30 rounded-2xl p-2 -mx-2">
          {/* Avatar & Name Block */}
          <div className="flex items-center gap-4">
             <PlayerAvatar player={selected} size="large" />
             <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-100 leading-tight">{selected.name}</h2>
                <p className="text-[11px] text-slate-400 mt-1 mb-1 font-medium flex items-center gap-1.5">
                   <Briefcase size={10} className="text-cyan-500" /> {selected.team} <span className="opacity-50">|</span> {selected.nationality}
                </p>
                <div className="flex items-center gap-2 mt-1">
                   <div className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: pos.bg, color: pos.color }}>
                     {pos.label}
                   </div>
                   {inj && (
                     <div className="px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ background: `${inj.c}1a`, border: `1px solid ${inj.c}40`, color: inj.c }}>
                       PRIOR: {inj.label.toUpperCase()}
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* AI Bio */}
          <div className="relative pl-3 border-l-2 border-cyan-500/30">
            <Activity size={12} className="absolute -left-[7px] top-0 text-cyan-500 bg-slate-950" />
            <p className="text-xs text-slate-400 italic">" {selected.shortBio} "</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <BioStat icon={<User size={10} />} label="Age" value={`${selected.age}y`} />
            <BioStat icon={<Star size={10} />} label="Value" value={fmtVal(selected.market_value_eur)} color="#22d3ee" />
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-2" />
        </div>
      )}

      {/* Search */}
      <div className="relative mt-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search live roster…"
          className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none text-slate-200 text-xs focus:border-cyan-500/50 transition-colors"
        />
      </div>

      {/* Roster list */}
      <div className="flex flex-col overflow-y-auto pr-1 space-y-[2px]" style={{ maxHeight: "280px" }}>
        {filtered.map(p => {
          const pc  = POS[p.position];
          const sel = selected?.id === p.id;
          const hasApproval    = !!approvals[p.id];
          const hasSub         = !!playerSubmissions[p.id];
          const statusDot = hasApproval
            ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
            : hasSub
              ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse"
              : null;
          
          return (
            <button key={p.id} id={`player-${p.id}`}
              onClick={() => onSelect(p)}
              className={`player-item w-full flex items-center gap-3 p-2 rounded-xl transition-all ${sel ? "bg-slate-800/80 border-l-4 border-cyan-400 pl-3" : "hover:bg-white/5"}`}>
              
              <PlayerAvatar player={p} size="small" />

              <div className="flex-1 min-w-0 text-left">
                <p className={`text-sm font-semibold truncate ${sel ? "text-cyan-300" : "text-slate-100"}`}>{p.name}</p>
                <div className="flex items-center gap-2 mt-[2px]">
                  <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: pc.color, opacity: 0.9 }}>
                    {pc.label}
                  </p>
                  <span className="text-slate-600 text-[10px]">·</span>
                  <p className="text-[10px] text-slate-400 truncate max-w-[80px] sm:max-w-[120px]">{p.team}</p>
                </div>
              </div>

              {/* Status indicator */}
              {statusDot ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${
                    hasApproval ? "text-emerald-500" : "text-amber-400"
                  }`}>
                    {hasApproval ? "OK" : "⚑"}
                  </span>
                </div>
              ) : sel ? (
                <ChevronRight size={14} className="text-cyan-400 shrink-0" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BioStat({ icon, label, value, color = "#cbd5e1" }) {
  return (
    <div className="rounded-xl p-2.5 bg-white/5 border border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-1 text-slate-500">{icon}<span className="text-[10px] uppercase font-bold tracking-widest">{label}</span></div>
      <p className="text-sm font-mono font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
