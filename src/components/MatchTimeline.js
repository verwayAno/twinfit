"use client";

import { useMemo } from "react";
import { calculateInjuryRisk } from "@/utils/injuryModel";

/* Chart dimensions */
const W=860, H=130, PAD_L=38, PAD_R=16, PAD_T=12, PAD_B=28;
const CW = W - PAD_L - PAD_R;
const CH = H - PAD_T - PAD_B;

const toX = t  => PAD_L + (t / 90) * CW;
const toY = v  => PAD_T + CH - Math.min(v, 100) / 100 * CH;

const gridTimes = [0,15,30,45,60,75,90];
const gridRisks = [0,25,50,75,100];

function lineColor(t) {
  if (t >= 75) return "#ef4444";
  if (t >= 45) return "#f59e0b";
  return "#10b981";
}

export default function MatchTimeline({ player, temperature, playTime }) {
  /* Compute risk at every minute 0-90 */
  const points = useMemo(() => {
    if (!player) return [];
    return Array.from({ length: 91 }, (_, t) => {
      const r = calculateInjuryRisk(player, { expected_play_time: t, temperature });
      return Math.max(r.hamstrings, r.knees, r.lowerBack);
    });
  }, [player, temperature]);

  /* Build coloured segment paths — split at 45 and 75 minute colour zones */
  const segments = useMemo(() => {
    if (!points.length) return [];
    const segs = [];
    const zones = [
      { start: 0,  end: 45, color: "#10b981" },
      { start: 45, end: 75, color: "#f59e0b" },
      { start: 75, end: 90, color: "#ef4444" },
    ];
    zones.forEach(({ start, end, color }) => {
      const pts = points.slice(start, end + 1)
        .map((v, i) => `${toX(start + i)},${toY(v)}`).join(" ");
      segs.push({ pts, color });
    });
    return segs;
  }, [points]);

  /* Area polygon for subtle fill */
  const areaPoints = useMemo(() => {
    if (!points.length) return "";
    const linePts = points.map((v, t) => `${toX(t)},${toY(v)}`).join(" ");
    return `${PAD_L},${PAD_T + CH} ${linePts} ${toX(90)},${PAD_T + CH}`;
  }, [points]);

  const markerX    = toX(playTime);
  const markerRisk = points[playTime] ?? 0;
  const markerY    = toY(markerRisk);
  const mColor     = lineColor(playTime);

  if (!player) return (
    <div className="timeline-wrap p-4 flex items-center justify-center" style={{ height: "140px" }}>
      <p className="hud-label">Select a player to view the predictive match timeline</p>
    </div>
  );

  return (
    <div className="timeline-wrap p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div>
          <span className="hud-label hud-label-c">Predictive Risk Timeline</span>
          <span className="hud-label ml-3">0 → 90 min · Injury Risk %</span>
        </div>
        <div className="flex items-center gap-3">
          {[["#10b981","Safe 0-45min"],["#f59e0b","Caution 45-75"],["#ef4444","Critical 75-90"]].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div style={{ width:8, height:8, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}70` }} />
              <span className="hud-label">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"120px" }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(6,182,212,0.12)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0)" />
          </linearGradient>
          <filter id="lineShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/>
            <feOffset dx="0" dy="1" result="off"/>
            <feComposite in="SourceGraphic" in2="off" operator="over"/>
          </filter>
        </defs>

        {/* Y grid lines */}
        {gridRisks.map(r => (
          <g key={r}>
            <line x1={PAD_L} y1={toY(r)} x2={W - PAD_R} y2={toY(r)}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={PAD_L - 5} y={toY(r) + 3.5} textAnchor="end"
              fontSize="8" fontFamily="JetBrains Mono,monospace" fill="rgba(100,116,139,0.6)">
              {r}
            </text>
          </g>
        ))}

        {/* X grid lines */}
        {gridTimes.map(t => (
          <g key={t}>
            <line x1={toX(t)} y1={PAD_T} x2={toX(t)} y2={PAD_T + CH}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={toX(t)} y={H - 4} textAnchor="middle"
              fontSize="8" fontFamily="JetBrains Mono,monospace" fill="rgba(100,116,139,0.65)">
              {t}'
            </text>
          </g>
        ))}

        {/* Zone background bands */}
        <rect x={toX(0)}  y={PAD_T} width={toX(45)-toX(0)}  height={CH} fill="rgba(16,185,129,0.025)" />
        <rect x={toX(45)} y={PAD_T} width={toX(75)-toX(45)} height={CH} fill="rgba(245,158,11,0.025)" />
        <rect x={toX(75)} y={PAD_T} width={toX(90)-toX(75)} height={CH} fill="rgba(239,68,68,0.03)" />

        {/* Area fill */}
        {areaPoints && (
          <polygon points={areaPoints} fill="url(#areaGrad)" opacity="0.7" />
        )}

        {/* Coloured risk line segments */}
        {segments.map(({ pts, color }, i) => (
          <polyline
            key={i} points={pts}
            fill="none" stroke={color} strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
            filter="url(#lineShadow)"
            style={{ opacity: 0.9 }}
          />
        ))}

        {/* Play time vertical marker */}
        <line
          x1={markerX} y1={PAD_T} x2={markerX} y2={PAD_T + CH}
          stroke={mColor} strokeWidth="1.5" strokeDasharray="4,3"
          className="marker-line"
        />

        {/* Marker dot on the line */}
        <circle cx={markerX} cy={markerY} r="5" fill={mColor}
          style={{ filter: `drop-shadow(0 0 4px ${mColor})` }} />
        <circle cx={markerX} cy={markerY} r="8" fill="none"
          stroke={mColor} strokeWidth="1" opacity="0.4" />

        {/* Marker risk label */}
        <rect
          x={markerX - 24} y={markerY - 22} width="48" height="16" rx="5"
          fill="rgba(2,8,20,0.9)" stroke={mColor} strokeWidth="0.8"
        />
        <text x={markerX} y={markerY - 10} textAnchor="middle"
          fontSize="9" fontFamily="JetBrains Mono,monospace" fontWeight="700" fill={mColor}>
          {markerRisk.toFixed(1)}%
        </text>

        {/* Axes */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T+CH}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1={PAD_L} y1={PAD_T+CH} x2={W-PAD_R} y2={PAD_T+CH}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      </svg>
    </div>
  );
}
