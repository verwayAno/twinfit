"use client";

import { useMemo } from "react";
import { calculateInjuryRisk } from "@/utils/injuryModel";
import { Activity, Clock, TrendingUp } from "lucide-react";

/* Chart dimensions */
const W=860, H=140, PAD_L=42, PAD_R=20, PAD_T=15, PAD_B=30;
const CW = W - PAD_L - PAD_R;
const CH = H - PAD_T - PAD_B;

const toX = t  => PAD_L + (t / 90) * CW;
const toY = v  => PAD_T + CH - Math.min(v, 100) / 100 * CH;

const gridTimes = [0,15,30,45,60,75,90];
const gridRisks = [0,50,100];

export default function MatchTimeline({ player, temperature, playTime }) {
  /* Compute risk at 10-minute intervals for smooth curve control points */
  const points = useMemo(() => {
    if (!player) return [];
    return Array.from({ length: 91 }, (_, t) => {
      const r = calculateInjuryRisk(player, { expected_play_time: t, temperature });
      return r.rawMaxRisk || 0;
    });
  }, [player, temperature]);

  /* Build a smooth Bézier Curve path (Cubic) */
  const smoothPath = useMemo(() => {
    if (!points.length) return "";
    
    let path = `M ${toX(0)} ${toY(points[0])}`;
    
    // Using a simplified Catmull-Rom to Cubic Bézier approach for smoothness
    for (let i = 0; i < points.length - 1; i++) {
       const x1 = toX(i);
       const y1 = toY(points[i]);
       const x2 = toX(i+1);
       const y2 = toY(points[i+1]);
       
       const cp1x = x1 + (x2 - x1) / 2;
       const cp1y = y1;
       const cp2x = x1 + (x2 - x1) / 2;
       const cp2y = y2;
       
       path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    }
    return path;
  }, [points]);

  /* Area fill path */
  const areaPath = useMemo(() => {
    if (!smoothPath) return "";
    return `${smoothPath} L ${toX(90)} ${PAD_T + CH} L ${toX(0)} ${PAD_T + CH} Z`;
  }, [smoothPath]);

  const markerX    = toX(playTime);
  const markerRisk = points[playTime] ?? 0;
  const markerY    = toY(markerRisk);
  const mColor     = playTime >= 75 ? "#ef4444" : playTime >= 45 ? "#f59e0b" : "#10b981";

  if (!player) return (
    <div className="timeline-wrap p-5 flex items-center justify-center bg-slate-900/10 border border-white/5 rounded-3xl" style={{ height: "160px" }}>
      <p className="hud-label text-slate-500 uppercase tracking-[0.2em] font-black">Awaiting Subject Selection</p>
    </div>
  );

  return (
    <div className="timeline-wrap p-5 bg-slate-950/20 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Decorative Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Predictive 90' Analysis</span>
             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-1">Simulated Match Intensity · {player.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Live Sync Value</span>
              <span className="text-xl font-mono font-black text-white">{markerRisk.toFixed(1)}%</span>
           </div>
           <div className="h-8 w-px bg-white/10" />
           <div className="flex gap-2">
              {[["#10b981","SAFE"],["#f59e0b","RISK"],["#ef4444","CRIT"]].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/60 border border-white/5">
                  <div className="w-1 h-1 rounded-full" style={{ background:c, boxShadow:`0 0 6px ${c}` }} />
                  <span className="text-[8px] font-black text-slate-400 tracking-tighter">{l}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[130px] drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(34,211,238,0.15)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
          <filter id="glow">
             <feGaussianBlur stdDeviation="3" result="blur" />
             <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Y-Axes Labels */}
        {gridRisks.map(r => (
            <text key={r} x={PAD_L - 8} y={toY(r) + 3} textAnchor="end"
              fontSize="10" fontFamily="JetBrains Mono,monospace" fontWeight="900" fill="rgba(100,116,139,0.5)">
              {r}%
            </text>
        ))}

        {/* X-Axes Grid Labels */}
        {gridTimes.map(t => (
           <text key={t} x={toX(t)} y={H - 5} textAnchor="middle"
             fontSize="9" fontFamily="JetBrains Mono,monospace" fontWeight="900" fill="rgba(100,116,139,0.6)">
             {t}m
           </text>
        ))}

        {/* Minimalist Grid */}
        <line x1={PAD_L} y1={PAD_T + CH} x2={W - PAD_R} y2={PAD_T + CH} stroke="white" strokeWidth="0.5" opacity="0.1" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + CH} stroke="white" strokeWidth="0.5" opacity="0.1" />

        {/* Predictive Curve Area Fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#curveGrad)" />
        )}

        {/* Predictive Curve Line */}
        {smoothPath && (
          <path
            d={smoothPath}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
            opacity="0.9"
          />
        )}

        {/* Real-time playTime synchronization marker */}
        <g className="marker-group">
           <line
             x1={markerX} y1={PAD_T} x2={markerX} y2={PAD_T + CH}
             stroke={mColor} strokeWidth="2" strokeDasharray="6,4"
             opacity="0.8"
           />
           {/* Glow circle on the point */}
           <circle cx={markerX} cy={markerY} r="8" fill={mColor} opacity="0.15">
              <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
           </circle>
           <circle cx={markerX} cy={markerY} r="4" fill="white" stroke={mColor} strokeWidth="2" />
        </g>
      </svg>
      
      {/* Bottom Footer Indicators */}
      <div className="flex justify-between items-center mt-2 px-2">
         <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-600" />
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Match Duration Simulation</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
               <span className="text-[8px] font-black text-slate-500 tracking-tighter">SIMULATED PLAY:</span>
               <span className="text-[10px] font-mono font-black text-white">{playTime}'</span>
            </div>
         </div>
      </div>
    </div>
  );
}
