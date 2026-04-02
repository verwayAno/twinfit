import { useState, useMemo, useCallback, useRef } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Slider } from "antd";
import players        from "@/data/players.json";
import { calculateInjuryRisk } from "@/utils/injuryModel";
import ThermalBody    from "@/components/ThermalBody";
import MatchTimeline  from "@/components/MatchTimeline";
import IdentityPanel  from "@/components/IdentityPanel";
import RiskPanel      from "@/components/RiskPanel";
import SimulatorPanel from "@/components/SimulatorControls";
import ActionPanel    from "@/components/InsightsPanel";

// Helper functions needed in the component
function rCol(v) { return v > 75 ? "#f87171" : v >= 40 ? "#fb923c" : "#22d3ee"; }

export default function CoachDashboard({ liveAlerts = [] }) {
  /* ── State ── */
  const [selected,    setSelected]    = useState(players[4]);
  const [playTime,    setPlayTime]    = useState(45);
  const [temperature, setTemperature] = useState(15);
  const [rotationY,   setRotationY]   = useState(0);

  /* ── Smooth player transition ── */
  const [bodyKey,   setBodyKey]   = useState(0); 
  const [fading,    setFading]    = useState(false);
  const fadeTimer = useRef(null);

  const handleSelectPlayer = useCallback((p) => {
    if (p.id === selected?.id) return;
    setFading(true);
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setSelected(p);
      setBodyKey(k => k + 1);
      setFading(false);
    }, 240);
  }, [selected]);

  /* ── Risk calculation ── */
  const risks = useMemo(() => {
    if (!selected) return { hamstrings: 0, knees: 0, lowerBack: 0 };
    return calculateInjuryRisk(selected, { expected_play_time: playTime, temperature });
  }, [selected, playTime, temperature]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] xl:grid-cols-[310px_1fr_310px] gap-4">
      {/* ── LEFT ── */}
      <div className="flex flex-col gap-4">
        <div className="anim-left d100">
          <IdentityPanel players={players} selected={selected} onSelect={handleSelectPlayer} />
        </div>
        <div className="anim-left d200">
          <SimulatorPanel
            playTime={playTime}
            temperature={temperature}
            onPlayTimeChange={setPlayTime}
            onTemperatureChange={setTemperature}
          />
        </div>
      </div>

      {/* ── CENTRE ── */}
      <div className="anim-up d150 flex flex-col items-center gap-4">
        {/* Title + mini risk chips */}
        <div className="w-full flex items-center justify-between px-1">
          <div>
            <h1 className="text-lg font-bold text-white">Digital Twin</h1>
            <p className="hud-label hud-label-c mt-0.5">
              {selected ? `Thermal scan: ${selected.name}` : "Select a player"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[["H", risks.hamstrings],["K", risks.knees],["B", risks.lowerBack]].map(([k, v]) => {
              const c = rCol(v);
              return (
                <div key={k} className="flex flex-col items-center px-2.5 py-1.5 rounded-lg"
                  style={{ background:`${c}12`, border:`1px solid ${c}28` }}>
                  <span className="hud-label" style={{ color:c, opacity:0.75 }}>{k}</span>
                  <span className="mono font-bold text-sm" style={{ color:c }}>{v.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Thermal Body ── */}
        <div
          className="relative scan-active rounded-2xl overflow-visible"
          style={{
            width:"100%", maxWidth:"300px",
            aspectRatio:"200/510",
            padding:"0 72px",
            boxSizing:"content-box",
          }}
        >
          {/* Inner body container */}
          <div
            key={bodyKey}
            className={fading ? "player-out" : "player-in"}
            style={{ width:"100%", height:"100%", position:"relative" }}
          >
            {/* Ambient frame glow */}
            <div style={{
              position:"absolute", inset:"-2px",
              borderRadius:"16px",
              boxShadow:`0 0 60px rgba(6,182,212,0.07), inset 0 0 40px rgba(6,182,212,0.03)`,
              pointerEvents:"none", zIndex:0,
            }} />

            {/* Corner marks */}
            <div className="c-tl" /><div className="c-tr" />
            <div className="c-bl" /><div className="c-br" />

            <ThermalBody risks={risks} rotationY={rotationY} />
          </div>
        </div>

        {/* 360 Rotation Slider */}
        <div className="w-full max-w-[260px] flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
           <RotateCw size={16} className="text-cyan-500 opacity-70" />
           <Slider 
             className="flex-1 m-0"
             min={0} 
             max={360} 
             value={rotationY} 
             onChange={setRotationY}
             tooltip={{ formatter: val => `${val}°` }}
             trackStyle={{ background: '#22d3ee' }}
             handleStyle={{ borderColor: '#22d3ee', background: '#0f172a' }}
           />
           <span className="text-xs font-mono text-cyan-400 w-8">{rotationY}°</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-2">
          {[["#22d3ee","Nominal","< 40%"],["#fb923c","Elevated","40–75%"],["#f87171","Critical","> 75%"]].map(([c,l,r]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div style={{ width:7, height:7, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}70` }} />
              <span className="hud-label">{l}</span>
              <span className="hud-label" style={{ color:"#1e293b" }}>{r}</span>
            </div>
          ))}
        </div>

        {/* ── Predictive Match Timeline ── */}
        <div className="w-full anim-up d300" style={{ maxWidth:"100%" }}>
          <MatchTimeline
            player={selected}
            temperature={temperature}
            playTime={playTime}
          />
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex flex-col gap-4">
        {/* Live Intelligence Feed Sidebar */}
        <div className="anim-right d50 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-amber-400" />
            Live Intel Feed
          </h3>
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
             {liveAlerts.length === 0 ? (
                <div className="text-center py-4">
                   <p className="text-xs text-slate-500 italic">No ecosystem alerts.</p>
                </div>
             ) : (
                liveAlerts.map(al => (
                  <div key={al.id} className="bg-amber-500/10 border-l-2 border-amber-500 p-2 rounded text-left">
                     <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider flex justify-between">
                       {al.title}
                       <span className="text-slate-500 font-mono font-normal">Just now</span>
                     </p>
                     <p className="text-xs text-slate-300 mt-1">{al.message}</p>
                  </div>
                ))
             )}
          </div>
        </div>

        <div className="anim-right d100">
          <RiskPanel
            risks={risks}
            player={selected}
            playTime={playTime}
            temperature={temperature}
          />
        </div>
        <div className="anim-right d200">
          <ActionPanel
            risks={risks}
            player={selected}
            playTime={playTime}
            temperature={temperature}
          />
        </div>
      </div>
    </div>
  );
}
