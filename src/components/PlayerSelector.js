"use client";

import { useState } from "react";
import { Search, ChevronRight, Moon, Dumbbell, DollarSign, AlertCircle, ActivitySquare } from "lucide-react";

const POS_CONFIG = {
  Striker:    { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "STR" },
  Midfielder: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  label: "MID" },
  Defender:   { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  label: "DEF" },
  Goalkeeper: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", label: "GK" },
};

const INJURY_LABELS = {
  hamstring: { label: "Hamstring", color: "#f97316" },
  knee:      { label: "Knee",      color: "#ef4444" },
  lower_back:{ label: "Lower Back",color: "#ec4899" },
  none:      null,
};

function fmt(v) {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000)     return `€${(v / 1_000).toFixed(1)}K`;
  return `€${v}`;
}

function SleepBar({ value }) {
  const pct = Math.min((value / 10) * 100, 100);
  const color = value < 6 ? "#ef4444" : value < 7 ? "#f59e0b" : "#10b981";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="risk-bar-track flex-1">
        <div className="risk-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="stat-number text-xs" style={{ color }}>{value}h</span>
    </div>
  );
}

function LoadBar({ value }) {
  const color = value > 80 ? "#ef4444" : value > 60 ? "#f59e0b" : "#10b981";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="risk-bar-track flex-1">
        <div className="risk-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="stat-number text-xs" style={{ color }}>{value}</span>
    </div>
  );
}

export default function PlayerPanel({ players, selected, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.position.toLowerCase().includes(query.toLowerCase())
  );

  const injury = INJURY_LABELS[selected?.injury_history];
  const pos = POS_CONFIG[selected?.position];

  return (
    <div className="card flex flex-col h-full" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="card-section-header">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,229,255,0.1)", color: "#00e5ff" }}>
            <ActivitySquare size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Squad Roster</p>
            <p className="label">{players.length} players • click to analyse</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search players…"
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "#0f1929",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#f1f5f9",
              fontSize: "13px",
            }}
          />
        </div>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
        {filtered.map((p) => {
          const pc = POS_CONFIG[p.position];
          const inj = INJURY_LABELS[p.injury_history];
          const isSelected = selected?.id === p.id;
          return (
            <button
              key={p.id}
              id={`player-${p.id}`}
              onClick={() => onSelect(p)}
              className={`player-row w-full ${isSelected ? "selected" : ""}`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ background: pc.bg, color: pc.color }}>
                {pc.label}
              </div>

              {/* Name & pos */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-slate-100 truncate">{p.name}</p>
                <p className="label truncate" style={{ color: pc.color, opacity: 0.8 }}>{p.position} • {fmt(p.market_value_eur)}</p>
              </div>

              {/* Flags */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                {inj && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${inj.color}18`, color: inj.color, border: `1px solid ${inj.color}30` }}>
                    Prior
                  </span>
                )}
                {isSelected && <ChevronRight size={12} style={{ color: "#00e5ff" }} />}
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <p className="label">No players found</p>
          </div>
        )}
      </div>

      {/* Selected Player Bio */}
      {selected && (
        <div className="border-t mx-3 mb-3 pt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-white">{selected.name}</p>
              <p className="label" style={{ color: pos.color }}>{selected.position} · {selected.age} yrs</p>
            </div>
            <p className="stat-number text-base" style={{ color: "#00e5ff" }}>{fmt(selected.market_value_eur)}</p>
          </div>

          {/* Sleep */}
          <div className="mb-2">
            <div className="flex items-center gap-1.5">
              <Moon size={11} className="text-slate-500" />
              <span className="label">Avg Sleep / Week</span>
            </div>
            <SleepBar value={selected.average_sleep_this_week} />
          </div>

          {/* Load */}
          <div className="mb-2">
            <div className="flex items-center gap-1.5">
              <Dumbbell size={11} className="text-slate-500" />
              <span className="label">Training Load</span>
            </div>
            <LoadBar value={selected.recent_training_load} />
          </div>

          {/* Injury flag */}
          {injury && (
            <div className="flex items-center gap-2 mt-2 px-2.5 py-2 rounded-lg"
              style={{ background: `${injury.color}10`, border: `1px solid ${injury.color}25` }}>
              <AlertCircle size={12} style={{ color: injury.color, flexShrink: 0 }} />
              <span className="text-xs font-medium" style={{ color: injury.color }}>
                Prior injury: {injury.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
