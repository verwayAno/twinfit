"use client";

import { BarChart2, Info } from "lucide-react";

function riskColor(v) {
  return v > 75 ? "#f87171" : v >= 40 ? "#fbbf24" : "#22d3ee";
}
function riskLabel(v) {
  return v > 75 ? "CRITICAL" : v >= 40 ? "ELEVATED" : "NOMINAL";
}

function RiskRow({ label, value, player, playTime, temperature }) {
  const c = riskColor(value);

  /* Tooltip math breakdown */
  const baseRisk   = ((player?.recent_training_load ?? 0) * 0.4 + playTime * 0.3).toFixed(1);
  const sleepMult  = (player?.average_sleep_this_week ?? 8) < 6 ? "×1.3 (poor sleep)" : "×1.0";
  const coldBonus  = label === "Knees" && temperature < 5 ? "+15 (cold weather)" : "";
  const injBonus   = (
    (label === "Hamstrings" && player?.injury_history === "hamstring") ||
    (label === "Knees"      && player?.injury_history === "knee")      ||
    (label === "Lower Back" && player?.injury_history === "lower_back")
  ) ? "+25 (prior injury)" : "";

  return (
    <div className="tooltip-wrap">
      {/* Tooltip */}
      <div className="tooltip-box text-left" style={{ minWidth: "200px" }}>
        <p className="hud-label hud-label-cyan mb-2">RISK FORMULA — {label.toUpperCase()}</p>
        <div className="space-y-1" style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "JetBrains Mono, monospace" }}>
          <p>Base = training({player?.recent_training_load ?? 0}×0.4) + play({playTime}×0.3)</p>
          <p>     = <span style={{ color: "#f1f5f9" }}>{baseRisk}</span></p>
          <p>Sleep multiplier: <span style={{ color: "#f1f5f9" }}>{sleepMult}</span></p>
          {coldBonus  && <p>Cold weather: <span style={{ color: "#60a5fa" }}>{coldBonus}</span></p>}
          {injBonus   && <p>Prior injury: <span style={{ color: "#f97316" }}>{injBonus}</span></p>}
          <div className="panel-divider" />
          <p>Final: <span className="font-bold" style={{ color: c }}>{value.toFixed(1)}%</span></p>
        </div>
      </div>

      {/* Row content */}
      <div className="rounded-xl p-3 cursor-help transition-all duration-200 hover:bg-white/[0.03]"
        style={{ border: `1px solid ${c}18` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="status-dot" style={{ background: c, boxShadow: `0 0 6px ${c}60` }} />
            <span className="hud-label" style={{ color: c, opacity: 0.85 }}>{label}</span>
            <Info size={10} style={{ color: "#334155", marginLeft: 2 }} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hud-value text-lg" style={{ color: c }}>{value.toFixed(1)}</span>
            <span className="hud-label">%</span>
          </div>
        </div>

        {/* Bar */}
        <div className="risk-bar">
          <div className="risk-fill" style={{
            width: `${Math.min(value, 100)}%`,
            background: c,
            color: c,
            boxShadow: `0 0 8px ${c}50`,
          }} />
        </div>

        <p className="hud-label mt-1.5" style={{ color: c }}>{riskLabel(value)}</p>
      </div>
    </div>
  );
}

export default function RiskPanel({ risks, player, playTime, temperature }) {
  const { hamstrings = 0, knees = 0, lowerBack = 0 } = risks;
  const maxRisk = Math.max(hamstrings, knees, lowerBack);
  const maxColor = riskColor(maxRisk);

  return (
    <div className="glass p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(6,182,212,0.1)" }}>
            <BarChart2 size={14} style={{ color: "#22d3ee" }} />
          </div>
          <span className="hud-label hud-label-cyan">Risk Breakdown</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold"
          style={{
            background: `${maxColor}12`,
            border: `1px solid ${maxColor}30`,
            color: maxColor,
            fontFamily: "JetBrains Mono",
          }}>
          <div className="status-dot dot-blink" style={{ background: maxColor, width: 5, height: 5 }} />
          {riskLabel(maxRisk)}
        </div>
      </div>

      <p className="hud-label" style={{ marginBottom: -4 }}>
        Hover each zone to see the calculation
      </p>

      <RiskRow label="Hamstrings" value={hamstrings} player={player} playTime={playTime} temperature={temperature} />
      <RiskRow label="Knees"      value={knees}      player={player} playTime={playTime} temperature={temperature} />
      <RiskRow label="Lower Back" value={lowerBack}  player={player} playTime={playTime} temperature={temperature} />
    </div>
  );
}
