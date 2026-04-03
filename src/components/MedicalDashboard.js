"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertCircle, BrainCircuit, Activity, CheckCircle2,
  Quote, User, ShieldAlert, Thermometer, Clock,
  CheckSquare, Info, FlaskConical, ClipboardCheck
} from "lucide-react";
import { Card, Button, Tag, Skeleton, message, Row, Col, Space, Checkbox, Progress } from "antd";
import { motion } from "framer-motion";
import players from "@/data/players.json";
import { calculateInjuryRisk } from "@/utils/injuryModel";
import PhotorealisticTwin from "@/components/PhotorealisticTwin";

export default function MedicalDashboard({ approvals, setApprovals, playerSubmissions }) {
  const defaultPlayTime = 45;
  const defaultTemp = 15;

  const flaggedPlayers = useMemo(() => {
    return players.map(p => {
      const risks = calculateInjuryRisk(p, { expected_play_time: defaultPlayTime, temperature: defaultTemp });
      // Extract only the numerical muscle risks for the max calculation
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto px-2 pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <FlaskConical size={32} className="text-red-500" />
            TRIAGE COMMAND CENTER
          </h2>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em] mt-1">High-Risk Personnel Monitoring & AI Prescription</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Active Flags</span>
            <span className="text-xl font-black text-red-500">{flaggedPlayers.length}</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase">AI Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> SYNTHESIZING</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {flaggedPlayers.length === 0 && !loading && (
          <div className="glass p-12 text-center text-slate-500 border-dashed border-2 border-slate-800">
            <ClipboardCheck size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold">Safe Environment Detected</p>
            <p className="text-xs uppercase tracking-widest mt-1">No players currently exceed the 60% risk threshold.</p>
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

  // NLP Parsing for Reported Pain
  const reportedPainZone = submission?.targetedZones?.length > 0
    ? submission.targetedZones[0]
    : submission?.nlpLog?.match(/right knee|left knee|hamstring|lower back/i)?.[0];

  const handleZoneClick = (hs) => {
    setActiveZone(prev => prev === hs.id ? null : hs.id);
  };

  return (
    <Card
      className="bg-slate-950 border-slate-800/80 hover:border-red-500/30 transition-all rounded-[2rem] overflow-hidden shadow-2xl relative"
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div className="bg-slate-900/40 px-8 py-5 flex items-center justify-between border-b border-slate-800/50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img src={fp.player.imageUrl} className="w-16 h-16 rounded-2xl object-cover grayscale opacity-80 border border-slate-700" alt={fp.player.name} />
            <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 shadow-lg
                ${fp.maxRisk > 80 ? 'bg-red-500 text-white border-slate-900' : 'bg-amber-500 text-slate-900 border-slate-900'}`}>
              {fp.maxRisk.toFixed(0)}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white m-0 tracking-tight">{fp.player.name}</h3>
            <div className="flex gap-4 mt-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-700" /> {fp.player.position}</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-700" /> {fp.player.age} Years Old</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isApproved && <Tag color="success" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-widest">Protocol Active</Tag>}
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Max Risk Threshold</span>
            <span className="text-xs font-mono font-bold text-red-400">{fp.maxRisk.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 3-Column Triage */}
      <Row className="min-h-[500px]">
        {/* COL 1: ALGORITHMIC SCAN */}
        <Col xs={24} md={8} className="border-r border-slate-800/50 p-8 flex flex-col items-center bg-[radial-gradient(circle_at_20%_20%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]">
          <span className="w-full text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <Activity size={14} className="animate-pulse" /> 2.5D Digital Twin Scan
          </span>
          <PhotorealisticTwin
            risks={fp.risks}
            reportedZones={submission?.targetedZones || []}
            activeZoneId={activeZone}
            onZoneClick={handleZoneClick}
            size="small"
          />
          <div className="mt-8 w-full bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Scan Confidence</span>
              <span className="text-[10px] font-mono text-cyan-400">99.2%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-[99.2%] shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            </div>
          </div>
        </Col>

        {/* COL 2: PLAYER DATA & NLP */}
        <Col xs={24} md={8} className="border-r border-slate-800/50 p-8 flex flex-col bg-slate-900/20">
          <span className="w-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <User size={14} /> Athlete Biometrics
          </span>

          {submission ? (
            <div className="flex flex-col gap-6 h-full">
              {/* NLP Report Card */}
              <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <Quote size={32} className="text-slate-800 absolute -bottom-2 -right-2 rotate-180 opacity-50" />
                <p className="text-md text-white font-medium italic leading-relaxed relative z-10">"{submission.nlpLog}"</p>

                {reportedPainZone && (
                  <Tag className="mt-4 bg-red-500/10 border-red-500/30 text-red-400 font-bold uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">
                    Reported Pain: {reportedPainZone}
                  </Tag>
                )}
              </div>

              {/* Triage Badges */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">Pain Scale</span>
                  <span className="text-lg font-black text-white">0.6 <span className="text-xs text-slate-600">/ 1.0</span></span>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">Sleep Deficit</span>
                  <span className="text-lg font-black text-pink-500">{(8 - fp.player.average_sleep_this_week).toFixed(1)} <span className="text-xs text-slate-600">HRS</span></span>
                </div>
              </div>

              <div className="mt-auto bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-center gap-3">
                <Info size={16} className="text-indigo-400 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-tight">Patient history indicates a {fp.player.injury_history !== 'none' ? 'recurrent' : 'new'} injury pattern. Applying historical coefficient.</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <LoaderIcon />
              <p className="text-xs text-slate-400 mt-4 uppercase tracking-widest font-bold">Awaiting Data Sync</p>
            </div>
          )}
        </Col>

        {/* COL 3: AI PRESCRIPTION & RTP */}
        <Col xs={24} md={8} className="p-8 flex flex-col bg-slate-950">
          <span className="w-full text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <BrainCircuit size={14} /> Gemini AI Treatment
          </span>

          <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800 mb-8 relative">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Optimized</span>
            </div>
            {isProtoLoading ? (
              <div className="space-y-3">
                <div className="h-3 w-3/4 bg-slate-800 rounded-full animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-800 rounded-full animate-pulse" />
              </div>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {protoText.replace("Gemini AI Analysis: ", "⚠️ ")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {/* RTP Forecast Section */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">RTP Forecast</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500">{fp.risks.rtpForecast} Days</span>
              </div>
              <Progress
                percent={100 - (fp.risks.rtpForecast * 10)}
                showInfo={false}
                strokeColor="#fbbf24"
                trailColor="#1e293b"
                strokeWidth={8}
                className="mb-2"
              />
              <p className="text-[10px] text-slate-500 text-center uppercase font-bold tracking-tight">Recovery estimated at {fp.risks.rtpForecast} days based on age ({fp.player.age}) and severity.</p>
            </div>

            {/* Clearance Checklist */}
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Clearance Roadmap</span>
              <div className="space-y-3">
                {[
                  "Schedule Urgent MRI Scan",
                  "Log Restricted Training Status",
                  "Initiate Local TENS Therapy"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-5 h-5 rounded-lg border-2 border-slate-700 flex items-center justify-center transition-colors group-hover:border-cyan-500">
                      <CheckSquare size={12} className="text-cyan-500 opacity-0 group-hover:opacity-100" />
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button
              type="primary"
              className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.1em] text-xs transition-all border-0 shadow-lg flex items-center justify-center gap-2
                   ${isApproved ? 'bg-emerald-600 pointer-events-none' : 'bg-red-600 hover:bg-red-500 animate-pulse-slow'}`}
              onClick={() => handleApprove(fp.player.id, protoText)}
              disabled={isApproved || isProtoLoading}
            >
              {isApproved ? <><CheckCircle2 size={16} /> Protocol Sent to Coach</> : <><ShieldAlert size={16} /> Restrict Player Playoff Status</>}
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

function LoaderIcon() {
  return (
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}
