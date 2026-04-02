"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle, BrainCircuit, Activity, CheckCircle2, Quote, User, ShieldAlert } from "lucide-react";
import { Card, Button, Tag, Skeleton, message, Row, Col, Space } from "antd";
import { motion } from "framer-motion";
import players from "@/data/players.json";
import { calculateInjuryRisk } from "@/utils/injuryModel";
import ThermalBody from "@/components/ThermalBody";

export default function MedicalDashboard({ approvals, setApprovals, playerSubmissions }) {
  const defaultPlayTime = 45;
  const defaultTemp = 15;

  const flaggedPlayers = useMemo(() => {
    return players.map(p => {
      const risks = calculateInjuryRisk(p, { expected_play_time: defaultPlayTime, temperature: defaultTemp });
      const maxRisk = Math.max(risks.hamstrings || 0, risks.knees || 0, risks.lowerBack || 0);
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
        } catch(e) {
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
      content: 'Dashboard updated. Coach and Player notified.',
      duration: 3,
      icon: <CheckCircle2 size={16} className="text-emerald-400 mr-2" />
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto px-2">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertCircle size={24} style={{ color: "#f87171" }} />
            Comprehensive Triage Command
          </h2>
          <p className="hud-label mt-1 text-slate-400">Reviewing High-Risk Personnel (&gt;60% predicted injury likelihood)</p>
        </div>
        <div className="hidden md:flex gap-4 opacity-50">
           <span className="text-xs font-mono uppercase tracking-widest px-3 border-r border-slate-700">1: Engine Physics</span>
           <span className="text-xs font-mono uppercase tracking-widest px-3 border-r border-slate-700">2: Player Feedback</span>
           <span className="text-xs font-mono uppercase tracking-widest pl-3">3: AI Synthesis</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {flaggedPlayers.length === 0 && !loading && (
          <div className="glass p-8 text-center text-slate-400">No players currently flagged as high risk.</div>
        )}

        {flaggedPlayers.map((fp) => {
          const isApproved = !!approvals[fp.player.id];
          const protoText = protocols[fp.player.id];
          const submission = playerSubmissions[fp.player.id];
          const isProtoLoading = !protoText;

          return (
            <Card 
              key={fp.player.id}
              className="bg-slate-900/80 border-slate-700/50 hover:border-[#22d3ee]/30 transition-all rounded-2xl overflow-hidden shadow-xl"
              bodyStyle={{ padding: 0 }}
            >
              {/* Header */}
              <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                 <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border
                     ${fp.maxRisk > 80 ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}>
                      {fp.maxRisk.toFixed(0)}
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-white m-0">{fp.player.name}</h3>
                     <span className="text-xs uppercase tracking-widest font-mono text-slate-500">{fp.player.position}</span>
                   </div>
                 </div>
                 {isApproved && <Tag color="success" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full"><CheckCircle2 size={12} className="inline mr-1"/> Protocol Validated</Tag>}
              </div>

              {/* 3-Column Triage */}
              <Row>
                 {/* COL 1: ENGINE PHYSICS */}
                 <Col xs={24} md={6} className="border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col items-center">
                    <span className="w-full text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Activity size={14} className="text-[#22d3ee]"/> Algorithmic Scan
                    </span>
                    <div className="relative w-full max-w-[180px] min-h-[280px] bg-slate-900/40 rounded-xl overflow-hidden border border-slate-700 shadow-[inset_0_4px_20px_rgba(34,211,238,0.05)] flex justify-center items-center py-4"
                         style={{ background: "radial-gradient(circle at center, rgba(34,211,238,0.12) 0%, rgba(15,23,42,0) 70%)" }}>
                       <ThermalBody risks={fp.risks} size="small" />
                    </div>
                    <div className="mt-4 w-full text-center">
                      <p className="text-sm text-slate-300 font-bold">Base Risk: {fp.maxRisk.toFixed(1)}%</p>
                    </div>
                 </Col>

                 {/* COL 2: PLAYER DATA & MEDIA */}
                 <Col xs={24} md={8} className="border-b md:border-b-0 md:border-r border-slate-800 p-6 bg-slate-900/50 flex flex-col">
                    <span className="w-full text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <User size={14} className="text-indigo-400"/> Player Check-In Data
                    </span>
                    
                    {submission ? (
                      <div className="space-y-4 flex-1">
                        {/* Media Upload Display */}
                        {submission.hasMedia && (
                          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                             <div className="w-14 h-14 bg-slate-900 rounded-lg border border-[#22d3ee]/30 flex items-center justify-center p-1 relative overflow-hidden shrink-0">
                               <Activity className="absolute inset-0 m-auto text-[#22d3ee]/10 w-full h-full scale-150" />
                               <svg viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full relative z-10">
                                 <path d="M12 2C9.5 2 7 9 7 12C7 15 9.5 22 12 22C14.5 22 17 15 17 12C17 9 14.5 2 12 2Z" />
                                 <circle cx="12" cy="12" r="2" fill="#ef4444" stroke="none" className="animate-pulse" />
                                 <path d="M12 2L12 22" /><path d="M7 12L17 12" />
                               </svg>
                             </div>
                             <div>
                               <p className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase font-bold">Image Received</p>
                               <p className="text-xs text-slate-400 leading-tight mt-1">Computer vision notes localized inflammation at the patella.</p>
                             </div>
                          </div>
                        )}

                        {/* NLP Report */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner relative mt-2">
                           <Quote size={24} className="absolute text-slate-800 -top-2 -left-2 rotate-180 opacity-50" />
                           <p className="text-sm text-slate-300 italic relative z-10 font-medium">"{submission.nlpLog}"</p>
                           <p className="text-[10px] text-slate-600 mt-2 text-right">Received {new Date(submission.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        
                        {/* Interactive Zones */}
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Activity size={10}/> Body Map Flags</p>
                           <Space size={4} wrap>
                             {submission.targetedZones && submission.targetedZones.length > 0 ? submission.targetedZones.map(zone => (
                               <Tag key={zone} color="volcano" className="border-red-500/20 bg-red-500/10 text-red-400 rounded-md">
                                 {zone}
                               </Tag>
                             )) : <span className="text-xs text-slate-600 italic">No spatial zones selected.</span>}
                           </Space>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-50 mt-10">
                        <div className="w-8 h-8 rounded-full border border-dashed border-slate-500 flex items-center justify-center mb-2">
                          <span className="w-2 h-2 rounded-full bg-slate-500 animate-ping" />
                        </div>
                        <p className="text-xs text-slate-400">Awaiting NLP Sync...</p>
                      </div>
                    )}
                 </Col>

                 {/* COL 3: AI SYNTHESIS */}
                 <Col xs={24} md={10} className="p-6 flex flex-col">
                    <span className="w-full text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <BrainCircuit size={14} className="text-emerald-400"/> Gemini AI Protocol
                    </span>
                    
                    <div className="flex-1 bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-6">
                      {isProtoLoading ? (
                        <div className="space-y-2 max-w-sm">
                          <Skeleton active paragraph={{ rows: 2 }} title={false} avatar={false} />
                        </div>
                      ) : (
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                          {protoText.replace("Gemini AI Analysis: ", "⚠️ ")}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="primary" 
                      size="large" 
                      className="w-full h-14 rounded-xl font-bold tracking-wide transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-0 shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:opacity-50 disabled:grayscale"
                      onClick={() => handleApprove(fp.player.id, protoText)}
                      disabled={isApproved || isProtoLoading}
                      icon={isApproved ? <CheckCircle2 size={18}/> : <ShieldAlert size={18} />}
                    >
                      {isApproved ? "PROTOCOL VALIDATED & SENT" : "VALIDATE PROTOCOL & RESTRICT PLAY TIME"}
                    </Button>
                 </Col>
              </Row>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
