"use client";

import { BarChart3, Info, User, Activity, AlertCircle, Coins, ShieldAlert, Zap, TrendingUp } from "lucide-react";

function riskColor(v) {
  return v > 75 ? "#ef4444" : v >= 40 ? "#f59e0b" : "#22d3ee";
}

function riskLabel(v) {
  return v > 75 ? "CRITICAL" : v >= 40 ? "ELEVATED" : "OPTIMAL";
}

function FactorBar({ label, value, color, icon }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.15em] font-black">
        <span className="text-slate-500 flex items-center gap-1.5">{icon} {label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 10px ${color}40` }} 
        />
      </div>
    </div>
  );
}

function RiskRow({ label, riskData, isActive }) {
  const value = riskData?.total || 0;
  const factors = riskData?.factors || { load: 0, recovery: 0, biometrics: 0 };
  const c = riskColor(value);

  return (
    <div className={`rounded-2xl p-4 transition-all duration-500 border ${isActive ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.15)]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${value > 75 ? 'animate-pulse' : ''}`} style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
          <span className="text-xs font-black tracking-[0.2em] uppercase text-white opacity-90">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-mono font-black" style={{ color: c }}>{value.toFixed(0)}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">%</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <FactorBar 
          label="Training Load" 
          value={factors.load} 
          color="#22d3ee" 
          icon={<Activity size={10} />} 
        />
        <FactorBar 
          label="Recovery Deficit" 
          value={factors.recovery} 
          color="#ec4899" 
          icon={<Zap size={10} />} 
        />
        <FactorBar 
          label="Biometric Stress" 
          value={factors.biometrics} 
          color="#f59e0b" 
          icon={<TrendingUp size={10} />} 
        />
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Status</span>
         <span className="text-[9px] font-black uppercase tracking-tighter" style={{ color: c }}>{riskLabel(value)}</span>
      </div>
    </div>
  );
}

export default function RiskPanel({ risks, player, activeZone }) {
  const { hamstrings, knees, lowerBack, bmi, valueAtRisk, rawMaxRisk } = risks;
  const maxColor = riskColor(rawMaxRisk || 0);

  return (
    <div className="glass p-5 flex flex-col gap-5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[80px] -mr-16 -mt-16 rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 shadow-lg">
            <BarChart3 size={16} className="text-cyan-400" />
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] leading-none">Factor Analysis</span>
             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Explainable AI Interface</span>
          </div>
        </div>
      </div>

      {/* Section A: Biometric Profile Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Height", value: `${player?.height_cm} cm`, icon: <TrendingUp size={10} /> },
          { label: "Weight", value: `${player?.weight_kg} kg`, icon: <Activity size={10} /> },
          { label: "BMI", value: bmi, icon: <Zap size={10} />, highlight: bmi > 25 ? "#f59e0b" : "#22d3ee" }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 rounded-2xl p-3 border border-white/5 flex flex-col items-center group hover:border-white/10 transition-colors">
            <span className="text-[8px] uppercase text-slate-500 font-bold mb-1 tracking-widest flex items-center gap-1.5">{stat.icon} {stat.label}</span>
            <span className="text-xs font-mono font-black text-white" style={stat.highlight ? { color: stat.highlight } : {}}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Section B: Visual Factor Analysis Rows */}
      <div className="flex flex-col gap-4">
        <RiskRow label="Hamstrings" riskData={hamstrings} isActive={activeZone === "Right Hamstring" || activeZone === "Left Hamstring"} />
        <RiskRow label="Knees"      riskData={knees}      isActive={activeZone === "Right Knee" || activeZone === "Left Knee"} />
        <RiskRow label="Lower Back" riskData={lowerBack}  isActive={activeZone === "Lower Back"} />
      </div>

      {/* Section C: Financial Risk Metric Card */}
      <div className="mt-2 group relative">
        <div className="absolute inset-0 bg-red-500/20 blur-[20px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="bg-slate-900/60 rounded-[2rem] p-5 border border-red-500/30 flex flex-col items-center gap-2 relative z-10 shadow-xl overflow-hidden animate-pulse-slow">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
           <div className="flex items-center gap-2 text-red-400">
              <Coins size={14} />
              <span className="text-[9px] font-black uppercase tracking-[.3em]">Financial Risk Value</span>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">VALUE AT RISK:</span>
              <span className="text-2xl font-mono font-black text-white text-shadow-glow-red">{risks.valueAtRisk} / week</span>
           </div>
           <p className="text-[8px] text-slate-500 font-bold text-center uppercase tracking-tighter leading-relaxed">
             Projected indirect financial loss due to roster instability.
           </p>
        </div>
      </div>

      {/* Section D: AI Warning */}
      <div className="p-4 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 flex gap-4 items-start shadow-inner">
        <AlertCircle size={16} className="text-cyan-400 shrink-0" />
        <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
          {bmi > 25 
            ? "CRITICAL: Biometric stress exceeded thresholds. Roster replacement costs surging. Immediate load reduction advised."
            : "ADVISORY: Systematic load optimization detected. Current recovery buffers are sufficient for match intensity."}
        </p>
      </div>
    </div>
  );
}
