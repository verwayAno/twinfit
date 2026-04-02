"use client";

import { useState, useEffect } from "react";
import { Download, ShieldAlert, ShieldCheck, DollarSign, BrainCircuit, Loader2 } from "lucide-react";

const COSTS = [8500, 12000, 15000, 22000, 28000, 35000, 42000, 55000];

function getCost(risks) {
  const crits = Object.values(risks).filter(v => v > 80);
  if (!crits.length) return null;
  const idx = Math.floor((risks.hamstrings + risks.knees + risks.lowerBack) % COSTS.length);
  return COSTS[idx] * crits.length;
}

function handleExport(player, risks, playTime, temperature, aiProtocol) {
  const lines = [
    `TWINFIT ASSISTANT PROTOCOL`,
    `Generated: ${new Date().toLocaleString()}`,
    `─────────────────────────────────────`,
    `Player:       ${player?.name ?? "N/A"}`,
    `Position:     ${player?.position ?? "N/A"}`,
    `Age:          ${player?.age ?? "N/A"}`,
    `─────────────────────────────────────`,
    `MATCH CONDITIONS`,
    `Play Time:    ${playTime} min`,
    `Temperature:  ${temperature}°C`,
    `─────────────────────────────────────`,
    `INJURY RISK ASSESSMENT`,
    `Hamstrings:   ${risks.hamstrings?.toFixed(1) ?? 0}%`,
    `Knees:        ${risks.knees?.toFixed(1) ?? 0}%`,
    `Lower Back:   ${risks.lowerBack?.toFixed(1) ?? 0}%`,
    `─────────────────────────────────────`,
    `GEMINI AI PRESCRIPTION`,
    aiProtocol || "No protocol generated."
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `twinfit_${player?.name?.replace(/\s/g,"_") ?? "player"}.txt` });
  a.click();
  URL.revokeObjectURL(url);
}

export default function ActionPanel({ risks, player, playTime, temperature }) {
  const [aiProtocol, setAiProtocol] = useState("");
  const [loading, setLoading] = useState(false);

  const { hamstrings = 0, knees = 0, lowerBack = 0 } = risks;
  const maxRisk  = Math.max(hamstrings, knees, lowerBack);
  const cost     = getCost(risks);

  useEffect(() => {
    let active = true;
    async function fetchProtocol() {
      setLoading(true);
      try {
        const res = await fetch("/api/generate-protocol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player, risks, playTime, temperature })
        });
        const data = await res.json();
        if (active) setAiProtocol(data.analysis);
      } catch (err) {
        if (active) setAiProtocol("Gemini AI Analysis: Offline. Please follow standard medical procedures.");
      } finally {
        if (active) setLoading(false);
      }
    }
    
    if (player) {
      fetchProtocol();
    }
    
    return () => { active = false; };
  }, [player, hamstrings, knees, lowerBack, playTime, temperature]);

  return (
    <div className="glass p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.22)" }}>
            <BrainCircuit size={14} style={{ color: "#22d3ee" }} />
            {loading && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400 animate-pulse" />}
          </div>
          <span className="hud-label hud-label-cyan">Actionable Insights</span>
        </div>
      </div>

      {/* AI AI Generation Panel */}
      <div className="space-y-2 overflow-y-auto" style={{ minHeight: "160px", maxHeight: "160px" }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-70">
            <Loader2 size={24} className="animate-spin" style={{ color: "#22d3ee" }} />
            <span className="hud-label font-bold text-cyan-400 scan-active">Synthesizing Gemini AI Protocol...</span>
          </div>
        ) : (
          <div className="rounded-xl p-3"
            style={{
              background: maxRisk > 75 ? "rgba(239,68,68,0.08)" : maxRisk >= 40 ? "rgba(245,158,11,0.08)" : "rgba(52,211,153,0.06)",
              border: `1px solid ${maxRisk > 75 ? "rgba(239,68,68,0.2)" : maxRisk >= 40 ? "rgba(245,158,11,0.2)" : "rgba(52,211,153,0.2)"}`,
            }}>
            <div className="flex items-center gap-2 mb-2">
              {maxRisk > 75
                ? <ShieldAlert size={12} style={{ color: "#f87171" }} />
                : <ShieldCheck size={12} style={{ color: maxRisk >= 40 ? "#fbbf24" : "#34d399" }} />}
              <span className="hud-label font-bold uppercase" style={{ color: maxRisk > 75 ? "#f87171" : maxRisk >= 40 ? "#fbbf24" : "#34d399" }}>
                {maxRisk > 75 ? "CRITICAL RISK DETECTED" : maxRisk >= 40 ? "ELEVATED RISK DETECTED" : "ALL CLEAR"}
              </span>
            </div>
            <p className="text-sm leading-relaxed tracking-wide" style={{ color: "#cbd5e1" }}>
              {aiProtocol}
            </p>
          </div>
        )}
      </div>

      <div className="panel-divider" />

      {/* Financial ROI */}
      <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <DollarSign size={12} style={{ color: "#22d3ee" }} />
          <span className="hud-label hud-label-cyan">Financial Value at Risk</span>
        </div>
        {cost ? (
          <div className="flex items-end gap-2">
            <span className="mono text-xl" style={{ color: "#34d399" }}>
              ${cost.toLocaleString()}
            </span>
            <span className="hud-label text-emerald-700 mb-0.5">saved by intervention</span>
          </div>
        ) : (
          <p className="mono text-lg text-slate-600">—</p>
        )}
      </div>

      {/* Export button */}
      <button
        className="export-btn"
        disabled={loading}
        style={{ opacity: loading ? 0.5 : 1 }}
        onClick={() => handleExport(player, risks, playTime, temperature, aiProtocol)}
      >
        <Download size={14} />
        Export Recovery Protocol
      </button>
    </div>
  );
}
