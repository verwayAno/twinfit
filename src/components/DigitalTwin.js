"use client";

import AnatomicalTwin from "./AnatomicalTwin";
import { Scan, Zap } from "lucide-react";

function RiskPill({ label, value }) {
  const isHigh = value > 75;
  const isMed  = value >= 40;
  const color  = isHigh ? "#ef4444" : isMed ? "#f59e0b" : "#00e5ff";
  const bg     = isHigh ? "rgba(239,68,68,0.1)" : isMed ? "rgba(245,158,11,0.1)" : "rgba(0,229,255,0.08)";
  const border = isHigh ? "rgba(239,68,68,0.25)" : isMed ? "rgba(245,158,11,0.25)" : "rgba(0,229,255,0.2)";
  const status = isHigh ? "CRITICAL" : isMed ? "ELEVATED" : "NOMINAL";

  return (
    <div className="flex-1 rounded-xl p-3 text-center transition-all duration-500"
      style={{ background: bg, border: `1px solid ${border}` }}>
      <p className="label mb-1">{label}</p>
      <p className="stat-number text-xl" style={{ color, textShadow: `0 0 12px ${color}55` }}>
        {value.toFixed(1)}<span className="text-sm font-normal">%</span>
      </p>
      <div className="w-full h-1 rounded-full mt-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(value, 100)}%`, background: color, boxShadow: `0 0 6px ${color}80` }} />
      </div>
      <p className="label mt-1.5" style={{ color }}>{status}</p>
    </div>
  );
}

export default function TwinPanel({ risks, playerName }) {
  const { hamstrings = 0, knees = 0, lowerBack = 0 } = risks;
  const maxRisk = Math.max(hamstrings, knees, lowerBack);
  const scanning = playerName != null;

  return (
    <div className="card card-glow h-full flex flex-col">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="card-section-header">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,229,255,0.1)", color: "#00e5ff" }}>
            <Scan size={16} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">Digital Twin</p>
              {scanning && <div className="glow-dot-brand" />}
            </div>
            <p className="label">{scanning ? `Scanning: ${playerName}` : "Select a player to begin"}</p>
          </div>
          {maxRisk > 75 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
              <Zap size={11} />ALERT
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mb-3">
          {[["#00e5ff","Safe","< 40%"],["#f59e0b","Elevated","40-75%"],["#ef4444","Critical","> 75%"]].map(([c,l,r]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: c, boxShadow: `0 0 8px ${c}60` }} />
              <span className="label">{l}</span>
              <span className="text-slate-600 text-[9px]">{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Body */}
      <div className="flex-1 flex items-center justify-center px-2 scan-container">
        <AnatomicalTwin risks={risks} playerName={playerName} />
      </div>

      {/* Risk pills */}
      <div className="p-4 pt-3">
        <div className="flex gap-2">
          <RiskPill label="Hamstrings" value={hamstrings} />
          <RiskPill label="Knees"      value={knees} />
          <RiskPill label="Lower Back" value={lowerBack} />
        </div>
      </div>
    </div>
  );
}
