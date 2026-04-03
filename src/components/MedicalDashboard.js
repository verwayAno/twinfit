"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertCircle, BrainCircuit, Activity, CheckCircle2,
  Quote, User, ShieldAlert, Thermometer, Clock,
  CheckSquare, Info, FlaskConical, ClipboardCheck,
  Heart, Zap, Gauge, Pill, Workflow
} from "lucide-react";
import { Card, Button, Tag, Skeleton, message, Row, Col, Space, Checkbox, Progress, Tooltip } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import players from "@/data/players.json";
import { calculateInjuryRisk } from "@/utils/injuryModel";
import PhotorealisticTwin from "@/components/PhotorealisticTwin";

export default function MedicalDashboard({ approvals, setApprovals, playerSubmissions }) {
  const defaultPlayTime = 45;
  const defaultTemp = 15;

  const flaggedPlayers = useMemo(() => {
    return players.map(p => {
      const risks = calculateInjuryRisk(p, { expected_play_time: defaultPlayTime, temperature: defaultTemp });
      const muscleValues = Object.entries(risks)
        .filter(([key]) => !["bmi", "rtpForecast", "valueAtRisk", "rawMaxRisk"].includes(key))
        .map(([_, v]) => typeof v === 'object' ? v.total : v);
      const maxRisk = Math.max(...muscleValues);
      return { player: p, risks, maxRisk };
    })
      .filter(p => p.maxRisk > 60)
      .sort((a, b) => b.maxRisk - a.maxRisk);
  }, []);

  const [protocols, setProtocols] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchAll() {
      setLoading(true);
      const results = {};
      for (const fp of flaggedPlayers) {
        try {
          const res = await fetch("/api/generate-protocol", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              player: fp.player,
              risks: fp.risks,
              playTime: defaultPlayTime,
              temperature: defaultTemp
            })
          });
          const data = await res.json();
          if (active) results[fp.player.id] = data.analysis;
        } catch (e) {
          if (active) results[fp.player.id] = "Error retrieving AI Protocol.";
        }
      }
      if (active) {
        setProtocols(results);
        setLoading(false);
      }
    }

    if (flaggedPlayers.length > 0) fetchAll();
    else setLoading(false);

    return () => { active = false; };
  }, [flaggedPlayers]);

  const handleApprove = (playerId, protocolText) => {
    setApprovals(prev => ({ ...prev, [playerId]: protocolText }));
    message.success({
      content: 'Medical Protocol Validated. Team ecosystem notified.',
      duration: 3,
      icon: <CheckCircle2 size={16} className="text-emerald-400 mr-2" />
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto px-4 pb-20">
      {/* Enhanced Command Header */}
      <div className="mb-12 flex items-end justify-between border-b border-white/5 pb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-black text-red-500 tracking-[0.2em] uppercase mt-1">Status: Restricted</div>
            <div className="h-px w-12 bg-white/10" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System Time: {new Date().toLocaleTimeString()}</span>
          </div>
          <h2 className="text-5xl font-black text-white flex items-center gap-4 tracking-tight drop-shadow-2xl">
            <FlaskConical size={48} className="text-red-500" />
            TRIAGE COMMAND
          </h2>
        </div>

        <div className="flex items-center gap-8 relative z-10">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Critical Flags</span>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
              <span className="text-4xl font-black text-white">{flaggedPlayers.length}</span>
            </div>
          </div>
          <div className="h-12 w-px bg-white/10" />
          <div className="bg-emerald-500/5 border border-emerald-500/10 px-6 py-3 rounded-2xl flex flex-col">
            <span className="text-[9px] text-emerald-500/60 font-black uppercase tracking-widest">AI Engine Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 mt-1">
              <Activity size={12} className="animate-pulse" />
              OPTIMIZING FLOW
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {flaggedPlayers.length === 0 && !loading && (
          <div className="medical-glass p-20 text-center text-slate-500 border-dashed border border-white/10 rounded-[3rem]">
            <ClipboardCheck size={64} className="mx-auto mb-6 opacity-20 text-emerald-500" />
            <p className="text-2xl font-black text-white tracking-tight">Ecosystem Clear</p>
            <p className="text-xs uppercase tracking-[0.3em] mt-2 text-slate-500">All personnel currently operating within safe biomechanical thresholds.</p>
          </div>
        )}

        {flaggedPlayers.map((fp) => (
          <TriageCard
            key={fp.player.id}
            fp={fp}
            isApproved={!!approvals[fp.player.id]}
            protoText={protocols[fp.player.id]}
            submission={playerSubmissions[fp.player.id]}
            handleApprove={handleApprove}
          />
        ))}
      </div>
    </motion.div>
  );
}

function TriageCard({ fp, isApproved, protoText, submission, handleApprove }) {
  const [activeZone, setActiveZone] = useState(null);
  const isProtoLoading = !protoText;

  const handleZoneClick = (hs) => {
    setActiveZone(prev => prev === hs.id ? null : hs.id);
  };

  return (
    <Card
      className="bg-slate-950/40 medical-glass border-white/5 hover:border-red-500/20 transition-all duration-500 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative"
      bodyStyle={{ padding: 0 }}
    >
      <Row className="min-h-[650px]">
        {/* LEFT: THE DUAL SCANNER (40%) */}
        <Col xs={24} md={10} className="relative border-r border-white/5 p-10 flex flex-col bg-slate-900/10">
          <PhotorealisticTwin
            risks={fp.risks}
            reportedZones={submission?.targetedZones || []}
            activeZoneId={activeZone}
            onZoneClick={handleZoneClick}
            isDualView={true}
          />

          {/* Diagnostic Overlay */}
          <div className="mt-auto pt-8">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-1">Scan Confidence</span>
                <span className="text-2xl font-black text-white font-mono tracking-tighter">99.42%</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Biolatency</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">1.2ms</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '99.42%' }}
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              />
            </div>
          </div>
        </Col>

        {/* RIGHT: THE ANALYTICS HUB (60%) */}
        <Col xs={24} md={14} className="p-10 flex flex-col">
          {/* Header Bar */}
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img src={fp.player.imageUrl} className="w-20 h-20 rounded-[2rem] object-cover grayscale brightness-125 border border-white/10 shadow-2xl" alt={fp.player.name} />
                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] font-black w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-950">
                  {fp.maxRisk.toFixed(0)}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{fp.player.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User size={12} className="text-cyan-500" /> {fp.player.position}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Age: {fp.player.age}</span>
                </div>
              </div>
            </div>
            {isApproved && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Tag color="success" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-6 py-2 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg">
                  Protocol Validated
                </Tag>
              </motion.div>
            )}
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-4 gap-4 mb-10">
            <VitalGauge label="Sleep" value={fp.player.average_sleep_this_week} max={8} unit="HRS" color="#ec4899" />
            <VitalGauge label="Intensity" value={fp.maxRisk} max={100} unit="%" color="#ef4444" />
            <VitalGauge label="HRV" value={82} max={100} unit="ms" color="#8b5cf6" />
            <VitalGauge label="Recovery" value={100 - (fp.risks.rtpForecast * 10)} max={100} unit="%" color="#10b981" />
          </div>

          {/* AI Transcription Module */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <BrainCircuit size={20} className="text-emerald-400" />
                </div>
                <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.2em]">Gemini AI Clinical Prescription</span>
                {isProtoLoading && <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
              </div>

              {isProtoLoading ? (
                <div className="space-y-4">
                  <Skeleton active paragraph={{ rows: 3 }} title={false} />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={protoText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-md text-slate-300 leading-relaxed font-medium bg-slate-900/40 p-5 rounded-2xl border border-white/5"
                  >
                    {protoText.replace("Gemini AI Analysis: ", "RECOMMENDATION: ")}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Athlete's Input Quote */}
              {submission && (
                <div className="mt-8 flex items-start gap-4 bg-white/5 p-4 rounded-2xl italic">
                  <Quote size={20} className="text-slate-600 mt-1 shrink-0" />
                  <p className="text-sm text-slate-400 line-clamp-2">"{submission.nlpLog}"</p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="bg-slate-900/40 rounded-[2.5rem] p-8 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Recovery</span>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-500" />
                    <span className="text-xl font-black text-white">{fp.risks.rtpForecast} <span className="text-xs text-slate-500">Days</span></span>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Clearance Steps</span>
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 size={12} className="text-emerald-500" /></div>
                    <div className="w-5 h-5 rounded-md border border-white/10" />
                    <div className="w-5 h-5 rounded-md border border-white/10" />
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                className={`h-16 px-10 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all border-0 shadow-2xl flex items-center justify-center gap-3
                       ${isApproved ? 'bg-emerald-600' : 'bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-95'}`}
                onClick={() => handleApprove(fp.player.id, protoText)}
                disabled={isApproved || isProtoLoading}
              >
                {isApproved ? (
                  <><CheckCircle2 size={18} /> Protocol Dispatched</>
                ) : (
                  <><ShieldAlert size={18} /> Formalize Medical Restriction</>
                )}
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

function VitalGauge({ label, value, max, unit, color }) {
  const percent = Math.min(100, (value / max) * 100);

  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-4 flex flex-col items-center">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</span>
      <div className="relative w-16 h-16 mb-2">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32" cy="32" r="28"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/5"
          />
          <motion.circle
            cx="32" cy="32" r="28"
            fill="transparent"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={176}
            initial={{ strokeDashoffset: 176 }}
            animate={{ strokeDashoffset: 176 - (176 * percent / 100) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-white">{value.toFixed(percent === 100 ? 0 : 1)}</span>
        </div>
      </div>
      <span className="text-[9px] font-mono font-bold text-slate-500">{unit}</span>
    </div>
  );
}

function LoaderIcon() {
  return (
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
      <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_#6366f1]" />
    </div>
  );
}
