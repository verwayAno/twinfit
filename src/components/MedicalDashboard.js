"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BrainCircuit, Activity, CheckCircle2,
  Quote, User, ShieldAlert, Clock, FlaskConical
} from "lucide-react";
import { Card, Button, Tag, Skeleton, message, Row, Col } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import players from "@/data/players.json";
import { calculateInjuryRisk } from "@/utils/injuryModel";
import AnatomicalBody from "@/components/AnatomicalTwin";

// ── Human-readable zone labels
const ZONE_LABELS = {
  hamstrings:          "Hamstrings",
  knees:               "Knees",
  lowerBack:           "Lower Back",
  quadriceps:          "Quads",
  groinAdductors:      "Groin",
  calvesGastrocnemius: "Calves",
  shouldersDeltoids:   "Shoulders",
  ankles:              "Ankles",
  glutes:              "Glutes",
  chest:               "Chest",
  abdominals:          "Core",
  upperBack:           "Upper Back",
  biceps:              "Biceps",
  triceps:             "Triceps",
  obliques:            "Obliques",
};

// ── Injury zone positions on the AnatomicalBody SVG (viewBox 0 0 220 480)
const BODY_ZONE_POSITIONS = {
  shouldersDeltoids:   [{ cx: 73,  cy: 84,  rx: 15, ry: 9  }, { cx: 147, cy: 84,  rx: 15, ry: 9  }],
  chest:               [{ cx: 110, cy: 110, rx: 30, ry: 14 }],
  biceps:              [{ cx: 46,  cy: 128, rx: 8,  ry: 17 }, { cx: 174, cy: 128, rx: 8,  ry: 17 }],
  triceps:             [{ cx: 46,  cy: 130, rx: 8,  ry: 17 }, { cx: 174, cy: 130, rx: 8,  ry: 17 }],
  abdominals:          [{ cx: 110, cy: 128, rx: 16, ry: 18 }],
  obliques:            [{ cx: 81,  cy: 128, rx: 10, ry: 14 }, { cx: 139, cy: 128, rx: 10, ry: 14 }],
  upperBack:           [{ cx: 110, cy: 105, rx: 24, ry: 14 }],
  lowerBack:           [{ cx: 110, cy: 142, rx: 28, ry: 8  }],
  groinAdductors:      [{ cx: 110, cy: 183, rx: 20, ry: 9  }],
  glutes:              [{ cx: 97,  cy: 178, rx: 14, ry: 12 }, { cx: 123, cy: 178, rx: 14, ry: 12 }],
  quadriceps:          [{ cx: 87,  cy: 228, rx: 12, ry: 30 }, { cx: 133, cy: 228, rx: 12, ry: 30 }],
  hamstrings:          [{ cx: 87,  cy: 228, rx: 12, ry: 30 }, { cx: 133, cy: 228, rx: 12, ry: 30 }],
  knees:               [{ cx: 87,  cy: 280, rx: 14, ry: 16 }, { cx: 133, cy: 280, rx: 14, ry: 16 }],
  calvesGastrocnemius: [{ cx: 87,  cy: 340, rx: 9,  ry: 22 }, { cx: 133, cy: 340, rx: 9,  ry: 22 }],
  ankles:              [{ cx: 87,  cy: 390, rx: 10, ry: 7  }, { cx: 133, cy: 390, rx: 10, ry: 7  }],
};

// Maps player-submitted zone IDs → anatomical model keys
const PLAYER_ZONE_TO_MODEL_KEY = {
  "Right Shoulder": "shouldersDeltoids",
  "Left Shoulder":  "shouldersDeltoids",
  "Chest":          "chest",
  "Right Hip":      "groinAdductors",
  "Left Hip":       "groinAdductors",
  "Right Quad":     "quadriceps",
  "Left Quad":      "quadriceps",
  "Right Knee":     "knees",
  "Left Knee":      "knees",
  "Upper Back":     "upperBack",
  "Lower Back":     "lowerBack",
  "Right Hamstring":"hamstrings",
  "Left Hamstring": "hamstrings",
  "Right Calf":     "calvesGastrocnemius",
  "Left Calf":      "calvesGastrocnemius",
};

function getZoneStyle(val) {
  if (val >= 75) return { fill: "rgba(239,68,68,0.45)", stroke: "#ef4444", tag: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (val >= 40) return { fill: "rgba(245,158,11,0.38)", stroke: "#f59e0b", tag: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  return null;
}

// ── Clean anatomical body with per-zone injury highlights
function InjuryBodyMap({ risks, reportedZoneKeys = [] }) {
  return (
    <div className="relative mx-auto" style={{ width: 130, aspectRatio: "220 / 480" }}>
      <AnatomicalBody />
      <svg
        viewBox="0 0 220 480"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <defs>
          <filter id="injGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Object.entries(BODY_ZONE_POSITIONS).map(([key, positions]) => {
          const val = risks[key]?.total ?? 0;
          const s = getZoneStyle(val);
          if (!s) return null;
          return positions.map((pos, i) => (
            <ellipse
              key={`${key}-${i}`}
              cx={pos.cx} cy={pos.cy}
              rx={pos.rx} ry={pos.ry}
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth="1.5"
              strokeOpacity="0.85"
              filter="url(#injGlow)"
            />
          ));
        })}
        {reportedZoneKeys.map(key =>
          (BODY_ZONE_POSITIONS[key] || []).map((pos, i) => (
            <ellipse
              key={`rep-${key}-${i}`}
              cx={pos.cx} cy={pos.cy}
              rx={pos.rx + 4} ry={pos.ry + 4}
              fill="none"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="5,3"
              strokeOpacity="0.9"
            />
          ))
        )}
      </svg>
    </div>
  );
}

export default function MedicalDashboard({ approvals, setApprovals, playerSubmissions, setLiveAlerts }) {
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

  const pendingSubmitters = useMemo(() => {
    const flaggedIds = new Set(flaggedPlayers.map(fp => fp.player.id));
    return Object.entries(playerSubmissions)
      .filter(([id]) => !flaggedIds.has(Number(id)))
      .map(([id, sub]) => ({ player: players.find(p => p.id === Number(id)), submission: sub }))
      .filter(item => item.player);
  }, [flaggedPlayers, playerSubmissions]);

  const handleApprove = (playerId, protocolText, playerName) => {
    setApprovals(prev => ({ ...prev, [playerId]: protocolText }));
    setLiveAlerts?.(prev => [{
      id: Date.now(),
      title: "Protocol Approved",
      message: `Medical protocol for ${playerName} has been validated and dispatched.`,
      type: "success",
      time: new Date()
    }, ...prev]);
    message.success({
      content: 'Medical Protocol Validated. Team ecosystem notified.',
      duration: 3,
      icon: <CheckCircle2 size={16} className="text-emerald-400 mr-2" />
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto px-4 pb-20">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-black text-red-500 tracking-[0.2em] uppercase">Status: Restricted</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
          </div>
          <h2 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <FlaskConical size={36} className="text-red-500" />
            TRIAGE COMMAND
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Critical Flags</p>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-3xl font-black text-white">{flaggedPlayers.length}</span>
            </div>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/10 px-5 py-3 rounded-2xl">
            <p className="text-[9px] text-emerald-500/60 font-black uppercase tracking-widest">AI Engine</p>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
              <Activity size={11} className="animate-pulse" /> ACTIVE
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {flaggedPlayers.length === 0 && !loading && (
          <div className="p-20 text-center border-dashed border border-white/10 rounded-3xl">
            <p className="text-xl font-black text-white tracking-tight">Ecosystem Clear</p>
            <p className="text-xs uppercase tracking-[0.3em] mt-2 text-slate-500">All personnel within safe biomechanical thresholds.</p>
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

      {pendingSubmitters.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-5 border-t border-white/5 pt-8">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <h3 className="text-lg font-black text-white tracking-tight uppercase">Self-Reported Review Queue</h3>
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-black text-amber-400 tracking-wider">
              {pendingSubmitters.length} PENDING
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingSubmitters.map(({ player, submission }) => (
              <PendingSubmissionCard key={player.id} player={player} submission={submission} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TriageCard({ fp, isApproved, protoText, submission, handleApprove }) {
  const isProtoLoading = !protoText;

  const topZones = useMemo(() => {
    return Object.entries(fp.risks)
      .filter(([k]) => !["bmi", "rtpForecast", "valueAtRisk", "rawMaxRisk"].includes(k))
      .map(([k, v]) => ({ key: k, val: v?.total ?? 0 }))
      .filter(z => z.val >= 40)
      .sort((a, b) => b.val - a.val)
      .slice(0, 5);
  }, [fp.risks]);

  const reportedZoneKeys = useMemo(() => {
    if (!submission?.targetedZones) return [];
    return [...new Set(submission.targetedZones.map(z => PLAYER_ZONE_TO_MODEL_KEY[z]).filter(Boolean))];
  }, [submission]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card
        bodyStyle={{ padding: 0 }}
        style={{ background: "rgba(3,7,18,0.82)", borderColor: "rgba(255,255,255,0.07)", borderRadius: "1.5rem" }}
        className="overflow-hidden shadow-[0_20px_60px_-12px_rgba(0,0,0,0.7)] hover:border-red-500/20 transition-colors duration-500"
      >
        <Row>
          {/* ── LEFT: Injury Body Map */}
          <Col xs={24} md={9}>
            <div className="flex flex-col h-full border-r border-white/5 p-7 gap-5">

              {/* Player mini-header */}
              <div className="flex items-center gap-3">
                <img
                  src={fp.player.imageUrl}
                  alt={fp.player.name}
                  className="w-12 h-12 rounded-xl object-cover grayscale brightness-110 border border-white/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white leading-tight truncate">{fp.player.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 truncate">{fp.player.position} · {fp.player.team}</p>
                </div>
                <div className={`px-2.5 py-1.5 rounded-xl border text-center flex-shrink-0 ${fp.maxRisk >= 75 ? "bg-red-500/10 border-red-500/25" : "bg-amber-500/10 border-amber-500/25"}`}>
                  <p className="text-[8px] text-slate-500 uppercase tracking-wider leading-none mb-0.5">Risk</p>
                  <p className={`text-xl font-black leading-none ${fp.maxRisk >= 75 ? "text-red-400" : "text-amber-400"}`}>{fp.maxRisk.toFixed(0)}</p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Section label */}
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em]">Injury Zone Map</p>

              {/* Body diagram */}
              <div className="flex items-center justify-center py-1">
                <InjuryBodyMap risks={fp.risks} reportedZoneKeys={reportedZoneKeys} />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />High ≥75
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Med ≥40
                </span>
                {reportedZoneKeys.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-orange-500 inline-block" />Patient report
                  </span>
                )}
              </div>

              {/* Zone tags */}
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Flagged Zones</p>
                <div className="flex flex-wrap gap-1.5">
                  {topZones.map(z => {
                    const s = getZoneStyle(z.val);
                    return (
                      <span
                        key={z.key}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border ${s.tag}`}
                      >
                        {ZONE_LABELS[z.key]} <span className="opacity-60">{z.val.toFixed(0)}%</span>
                      </span>
                    );
                  })}
                  {topZones.length === 0 && (
                    <span className="text-[10px] text-slate-500 italic">No critical zones</span>
                  )}
                </div>
              </div>

            </div>
          </Col>

          {/* ── RIGHT: Analytics */}
          <Col xs={24} md={15}>
            <div className="flex flex-col h-full p-7 gap-5">

              {/* Player header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{fp.player.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User size={11} className="text-cyan-500" />{fp.player.position}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/15 inline-block" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Age: {fp.player.age}</span>
                    <span className="w-1 h-1 rounded-full bg-white/15 inline-block" />
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{fp.player.team}</span>
                  </div>
                </div>
                {isApproved && (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Tag className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-xl font-black uppercase text-[9px] tracking-widest">
                      ✓ Protocol Validated
                    </Tag>
                  </motion.div>
                )}
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-4 gap-3">
                <VitalGauge label="Sleep"     value={fp.player.average_sleep_this_week}               max={8}   unit="HRS" color="#ec4899" />
                <VitalGauge label="Intensity" value={fp.maxRisk}                                       max={100} unit="%"   color="#ef4444" />
                <VitalGauge label="HRV"       value={82}                                               max={100} unit="ms"  color="#8b5cf6" />
                <VitalGauge label="Recovery"  value={Math.max(0, 100 - (fp.risks.rtpForecast * 10))}  max={100} unit="%"   color="#10b981" />
              </div>

              {/* AI Protocol */}
              <div className="flex-1 bg-white/[0.025] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-emerald-500 rounded-r" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <BrainCircuit size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.18em]">AI Clinical Prescription</span>
                  {isProtoLoading && <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />}
                </div>

                {isProtoLoading ? (
                  <Skeleton active paragraph={{ rows: 3 }} title={false} />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={protoText}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-slate-300 leading-relaxed"
                    >
                      {protoText.replace("Gemini AI Analysis: ", "")}
                    </motion.p>
                  </AnimatePresence>
                )}

                {submission && (
                  <div className="mt-4 flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                    <Quote size={14} className="text-slate-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-400 italic line-clamp-2">"{submission.nlpLog}"</p>
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Recovery</p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-500" />
                      <span className="text-base font-black text-white">
                        {fp.risks.rtpForecast}
                        <span className="text-xs font-normal text-slate-500 ml-1">days</span>
                      </span>
                    </div>
                  </div>
                  <div className="h-7 w-px bg-white/10" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Clearance</p>
                    <div className="flex gap-1.5">
                      <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                      </div>
                      <div className="w-4 h-4 rounded border border-white/10" />
                      <div className="w-4 h-4 rounded border border-white/10" />
                    </div>
                  </div>
                </div>

                <Button
                  type="primary"
                  className={`h-11 px-7 rounded-xl font-black uppercase tracking-[0.15em] text-[10px] border-0 shadow-lg transition-all
                    ${isApproved ? "bg-emerald-700" : "bg-red-600 hover:bg-red-500 hover:scale-[1.02] active:scale-95"}`}
                  onClick={() => handleApprove(fp.player.id, protoText, fp.player.name)}
                  disabled={isApproved || isProtoLoading}
                >
                  {isApproved
                    ? <><CheckCircle2 size={13} className="mr-2 inline" />Protocol Dispatched</>
                    : <><ShieldAlert size={13} className="mr-2 inline" />Approve Restriction</>
                  }
                </Button>
              </div>

            </div>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
}

function VitalGauge({ label, value, max, unit, color }) {
  const percent = Math.min(100, (value / max) * 100);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex flex-col items-center">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2.5">{label}</span>
      <div className="relative w-14 h-14 mb-1.5">
        <svg className="w-full h-full -rotate-90">
          <circle cx="28" cy="28" r="24" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
          <motion.circle
            cx="28" cy="28" r="24"
            fill="transparent"
            stroke={color}
            strokeWidth="3.5"
            strokeDasharray={150.8}
            initial={{ strokeDashoffset: 150.8 }}
            animate={{ strokeDashoffset: 150.8 - (150.8 * percent / 100) }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-white">{value.toFixed(percent === 100 ? 0 : 1)}</span>
        </div>
      </div>
      <span className="text-[9px] font-mono font-bold text-slate-500">{unit}</span>
    </div>
  );
}

function PendingSubmissionCard({ player, submission }) {
  return (
    <div className="bg-white/[0.025] border border-amber-500/10 rounded-2xl p-5 hover:border-amber-500/25 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <img src={player.imageUrl} alt={player.name} className="w-10 h-10 rounded-xl object-cover grayscale" />
        <div>
          <p className="text-sm font-black text-white">{player.name}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{player.position}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Pending</span>
        </div>
      </div>
      {submission.nlpLog && (
        <div className="flex items-start gap-2 bg-white/5 p-3 rounded-xl mb-2">
          <Quote size={12} className="text-slate-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-400 italic line-clamp-3">&ldquo;{submission.nlpLog}&rdquo;</p>
        </div>
      )}
      {submission.targetedZones?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {submission.targetedZones.map(z => (
            <span key={z} className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wide bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md">{z}</span>
          ))}
        </div>
      )}
    </div>
  );
}
