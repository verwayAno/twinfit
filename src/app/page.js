"use client";

import { useState } from "react";
import { Cpu, Activity, Stethoscope, Smartphone } from "lucide-react";
import { ConfigProvider, theme } from "antd";

import CoachDashboard   from "@/components/CoachDashboard";
import MedicalDashboard from "@/components/MedicalDashboard";
import PlayerApp        from "@/components/PlayerApp";

export default function TwinFitShell() {
  // Global Role State
  const [role, setRole] = useState("COACH"); // 'COACH', 'MEDICAL', 'PLAYER'
  
  // Global Approvals State (simulating a database for the hackathon)
  // { "player_id": "Approved AI Protocol String" }
  const [approvals, setApprovals] = useState({});

  // Global Check-in State
  // { "player_id": { nlpLog: string, targetedZones: string[], hasMedia: boolean, timestamp: date } }
  const [playerSubmissions, setPlayerSubmissions] = useState({});

  // Coach Live Feed
  const [liveAlerts, setLiveAlerts] = useState([]);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="hud-bg min-h-screen flex flex-col relative overflow-hidden">
      <div className="grid-overlay" />

      {/* ══════════ GLOBAL TOP NAVIGATION ══════════ */}
      <header
        className="anim-down relative z-50 sticky top-0"
        style={{
          backdropFilter: "blur(22px)",
          background: "rgba(2,6,23,0.85)",
          borderBottom: "1px solid rgba(6,182,212,0.15)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.5)"
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-900/20 border border-cyan-800/40">
              <Cpu size={18} className="text-[#22d3ee]" />
              <svg className="absolute inset-0 w-full h-full spin-slow" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="15" stroke="rgba(6,182,212,0.3)" strokeWidth="1" strokeDasharray="4 6"/>
              </svg>
            </div>
            <div>
              <p className="mono font-bold tracking-[0.2em] text-white">TWINFIT</p>
              <p className="hud-label hidden sm:block opacity-70">MULTI-ROLE ECOSYSTEM PROTOTYPE</p>
            </div>
          </div>

          {/* Role Switcher Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-white/10 rounded-xl">
            <button
              onClick={() => setRole("COACH")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === "COACH" 
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity size={14} /> <span className="hidden sm:inline">Coach</span>
            </button>
            <button
              onClick={() => setRole("MEDICAL")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === "MEDICAL" 
                  ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Stethoscope size={14} /> <span className="hidden sm:inline">Medical</span>
            </button>
            <button
              onClick={() => setRole("PLAYER")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === "PLAYER" 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Smartphone size={14} /> <span className="hidden sm:inline">Player</span>
            </button>
          </div>

        </div>
      </header>

      {/* ══════════ MAIN CONTENT AREA ══════════ */}
      <main className="relative z-10 flex-1 max-w-screen-2xl mx-auto w-full px-4 lg:px-6 py-6 pb-12">
        {role === "COACH"   && <CoachDashboard liveAlerts={liveAlerts} />}
        {role === "MEDICAL" && <MedicalDashboard approvals={approvals} setApprovals={setApprovals} playerSubmissions={playerSubmissions} setLiveAlerts={setLiveAlerts} />}
        {role === "PLAYER"  && <PlayerApp approvals={approvals} playerSubmissions={playerSubmissions} setPlayerSubmissions={setPlayerSubmissions} setLiveAlerts={setLiveAlerts} />}
      </main>
    </div>
    </ConfigProvider>
  );
}
