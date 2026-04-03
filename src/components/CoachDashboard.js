import { useState, useMemo, useCallback, useRef } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Slider } from "antd";
import players        from "@/data/players.json";
import { calculateInjuryRisk } from "@/utils/injuryModel";
import IdentityPanel  from "@/components/IdentityPanel";
import RiskPanel      from "@/components/RiskPanel";
import MatchTimeline  from "@/components/MatchTimeline";
import PhotorealisticTwin from "@/components/PhotorealisticTwin";
import SimulatorPanel from "@/components/SimulatorControls";
import ActionPanel    from "@/components/InsightsPanel";

// Helper functions needed in the component
function rCol(v) { return v > 75 ? "#f87171" : v >= 40 ? "#fb923c" : "#22d3ee"; }

export default function CoachDashboard({ liveAlerts = [] }) {
  /* ── State ── */
  const [selected,    setSelected]    = useState(players[4]);
  const [playTime,    setPlayTime]    = useState(45);
  const [temperature, setTemperature] = useState(15);
  const [activeZone,  setActiveZone]  = useState(null);

  /* ── Smooth player transition ── */
  const [fading,    setFading]    = useState(false);
  const fadeTimer = useRef(null);

  const handleSelectPlayer = useCallback((p) => {
    if (p.id === selected?.id) return;
    setFading(true);
    setActiveZone(null); // Reset selection
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setSelected(p);
      setFading(false);
    }, 240);
  }, [selected]);

  const toggleZone = (hs) => {
    setActiveZone(prev => prev === hs.id ? null : hs.id);
  };

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
          <div className="flex items-center gap-3">
            {[["H", risks.hamstrings?.total || 0],["K", risks.knees?.total || 0],["B", risks.lowerBack?.total || 0]].map(([k, v]) => {
              const c = rCol(v);
              return (
                <div key={k} className="flex flex-col items-center px-3 py-2 rounded-xl backdrop-blur-md"
                  style={{ background:`${c}15`, border:`1px solid ${c}35`, boxShadow: `0 0 15px ${c}15` }}>
                  <span className="text-[10px] font-black tracking-widest" style={{ color:c, opacity:0.8 }}>{k}</span>
                  <span className="font-mono font-black text-base" style={{ color:c }}>{v.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Hologram Stage ── */}
        <div
          className="relative rounded-[4rem] overflow-visible flex items-center justify-center p-12 bg-slate-900/5 border border-white/5 backdrop-blur-sm self-stretch"
          style={{
            width:"100%", maxWidth:"900px",
            height: "760px",
            margin: "0 auto"
          }}
        >
          {/* Diagnostic Corner Marks - Professional Edition */}
          <div className="absolute top-10 left-10 w-12 h-12 border-t-2 border-l-2 border-slate-800 rounded-tl-3xl pointer-events-none opacity-40" />
          <div className="absolute top-10 right-10 w-12 h-12 border-t-2 border-r-2 border-slate-800 rounded-tr-3xl pointer-events-none opacity-40" />
          <div className="absolute bottom-10 left-10 w-12 h-12 border-b-2 border-l-2 border-slate-800 rounded-bl-3xl pointer-events-none opacity-40" />
          <div className="absolute bottom-10 right-10 w-12 h-12 border-b-2 border-r-2 border-slate-800 rounded-tr-3xl pointer-events-none opacity-40" />

          {/* Atmospheric Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05)_0%,transparent_70%)] pointer-events-none" />

          <PhotorealisticTwin 
            risks={risks} 
            reportedZones={[]} 
            activeZoneId={activeZone}
            onZoneClick={toggleZone}
            isSplit={true}
          />
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
            activeZone={activeZone}
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
