"use client";

import { SlidersHorizontal, Clock, Thermometer, Snowflake, Flame, Sun, Moon } from "lucide-react";

const PRESETS = [
  { icon: "⚽", label: "Full Match",  sub: "90min · 12°C", play: 90, temp: 12 },
  { icon: "🔄", label: "Sub App.",    sub: "25min · 20°C", play: 25, temp: 20 },
  { icon: "❄️", label: "Winter",      sub: "90min · 2°C",  play: 90, temp: 2  },
  { icon: "🛌", label: "Rest",        sub: "0min · 22°C",  play: 0,  temp: 22 },
];

function TempIcon({ t }) {
  if (t < 5)  return <Snowflake size={13} style={{ color: "#60a5fa" }} />;
  if (t > 30) return <Flame     size={13} style={{ color: "#f87171" }} />;
  return <Sun size={13} style={{ color: "#fbbf24" }} />;
}

function SliderBlock({ id, label, icon, value, min, max, unit, onChange, className, displayColor, badge }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span style={{ color: "#22d3ee" }}>{icon}</span>
          <span className="hud-label hud-label-cyan">{label}</span>
        </div>
        {badge}
      </div>
      <div className="flex items-baseline gap-1.5 my-1.5">
        <span className="hud-value text-2xl" style={{ color: displayColor }}>
          {value > 0 && unit === "°C" ? `+${value}` : value}
        </span>
        <span className="text-xs text-slate-500 font-medium">{unit}</span>
      </div>
      <input
        id={id}
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`hud-slider ${className}`}
      />
      <div className="flex justify-between mt-1">
        <span className="hud-label">{min}{unit}</span>
        <span className="hud-label">{max}{unit}</span>
      </div>
    </div>
  );
}

export default function SimulatorPanel({ playTime, temperature, onPlayTimeChange, onTemperatureChange }) {
  const playColor = playTime > 75 ? "#f87171" : playTime > 45 ? "#fbbf24" : "#34d399";
  const tempColor = temperature < 5 ? "#60a5fa" : temperature > 30 ? "#f87171" : "#22d3ee";

  const PlayBadge = (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md"
      style={{ background: `${playColor}15`, color: playColor, border: `1px solid ${playColor}28`, fontFamily: "JetBrains Mono" }}>
      {playTime > 75 ? "HIGH" : playTime > 45 ? "MOD" : "LOW"}
    </span>
  );
  const TempBadge = <TempIcon t={temperature} />;

  return (
    <div className="glass p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(124,58,237,0.12)" }}>
          <SlidersHorizontal size={14} style={{ color: "#a78bfa" }} />
        </div>
        <span className="hud-label" style={{ color: "rgba(167,139,250,0.7)" }}>Simulator Controls</span>
      </div>

      <SliderBlock
        id="play-time-slider"
        label="Play Time Tonight"
        icon={<Clock size={13} />}
        value={playTime} min={0} max={90} unit="min"
        onChange={onPlayTimeChange}
        className="slider-playtime"
        displayColor={playColor}
        badge={PlayBadge}
      />

      {/* Play time segments */}
      <div className="flex gap-0.5 -mt-1 px-0.5">
        {Array.from({ length: 18 }, (_, i) => {
          const pos = i * 5;
          const active = pos < playTime;
          const c = pos >= 75 ? "#ef4444" : pos >= 45 ? "#f59e0b" : "#10b981";
          return (
            <div key={i} className="flex-1 h-1 rounded-sm transition-all duration-300"
              style={{
                background: active ? c : "rgba(255,255,255,0.05)",
                boxShadow: active ? `0 0 4px ${c}50` : "none",
              }} />
          );
        })}
      </div>

      <SliderBlock
        id="temperature-slider"
        label="Weather Temperature"
        icon={<Thermometer size={13} />}
        value={temperature} min={-5} max={40} unit="°C"
        onChange={onTemperatureChange}
        className="slider-temp"
        displayColor={tempColor}
        badge={TempBadge}
      />

      {temperature < 5 && (
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium"
          style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.18)", color: "#93c5fd" }}>
          <Snowflake size={12} style={{ flexShrink: 0 }} />
          Cold weather active — +15% knee risk applied
        </div>
      )}

      {/* Presets */}
      <div>
        <p className="hud-label mb-2">Quick Scenarios</p>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESETS.map(({ icon, label, sub, play, temp }) => (
            <button key={label}
              onClick={() => { onPlayTimeChange(play); onTemperatureChange(temp); }}
              className="rounded-xl p-2 text-center transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(6,182,212,0.07)";
                e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              <div className="text-base mb-0.5">{icon}</div>
              <p className="text-[10px] font-semibold text-slate-300">{label}</p>
              <p className="hud-label text-[8px]">{sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
