"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Printer, Activity, ShieldAlert, ShieldCheck,
  Clock, User, BrainCircuit, Cpu, CheckCircle2,
  AlertTriangle, TrendingUp, Zap
} from "lucide-react";
import players from "@/data/players.json";
import { calculateInjuryRisk } from "@/utils/injuryModel";
import AnatomicalBody from "@/components/AnatomicalTwin";

// ── Zone positions mapped to AnatomicalBody viewBox (220 × 480)
const BODY_ZONES = {
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

const ZONE_LABELS = {
  hamstrings: "Hamstrings", knees: "Knees", lowerBack: "Lower Back",
  quadriceps: "Quads", groinAdductors: "Groin", calvesGastrocnemius: "Calves",
  shouldersDeltoids: "Shoulders", ankles: "Ankles", glutes: "Glutes",
  chest: "Chest", abdominals: "Core", upperBack: "Upper Back",
  biceps: "Biceps", triceps: "Triceps", obliques: "Obliques",
};

const SKIP_KEYS = ["bmi", "rtpForecast", "valueAtRisk", "rawMaxRisk"];

function riskStyle(val) {
  if (val >= 75) return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Critical" };
  if (val >= 40) return { color: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", label: "Elevated" };
  return { color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", dot: "#10b981", label: "Clear" };
}

// ── Mini body map for each player card
function MiniBodyMap({ risks }) {
  return (
    <div className="relative mx-auto" style={{ width: 88, aspectRatio: "220 / 480" }}>
      <AnatomicalBody />
      <svg
        viewBox="0 0 220 480"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <defs>
          <filter id="repGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {Object.entries(BODY_ZONES).map(([key, positions]) => {
          const val = risks[key]?.total ?? 0;
          if (val < 40) return null;
          const s = riskStyle(val);
          const fill = val >= 75 ? "rgba(220,38,38,0.5)" : "rgba(217,119,6,0.45)";
          return positions.map((pos, i) => (
            <ellipse
              key={`${key}-${i}`}
              cx={pos.cx} cy={pos.cy} rx={pos.rx} ry={pos.ry}
              fill={fill} stroke={s.dot} strokeWidth="1.5" strokeOpacity="0.9"
              filter="url(#repGlow)"
            />
          ));
        })}
      </svg>
    </div>
  );
}

// ── Loading screen shown while AI protocols are being fetched
function LoadingScreen({ done, total, progress }) {
  const messages = [
    "Initialising biometric models…",
    "Querying AI injury engine…",
    "Analysing musculoskeletal load…",
    "Synthesising daily protocols…",
    "Compiling coach report…",
  ];
  const msgIdx = Math.min(Math.floor((done / total) * messages.length), messages.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#f1f5f9" }}
    >
      {/* Animated rings */}
      <div className="relative flex items-center justify-center mb-10">
        {[80, 64, 48].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border"
            style={{
              width: size, height: size,
              borderColor: i === 0 ? "rgba(6,182,212,0.15)" : i === 1 ? "rgba(6,182,212,0.25)" : "rgba(6,182,212,0.4)",
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 3 + i * 1.5, repeat: Infinity, ease: "linear" }}
          />
        ))}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "#0f172a", border: "1px solid rgba(6,182,212,0.3)" }}>
          <Cpu size={18} style={{ color: "#22d3ee" }} />
        </div>
      </div>

      {/* Progress */}
      <div className="w-72 text-center">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] mb-1"
          style={{ color: "#22d3ee" }}>
          {messages[msgIdx]}
        </p>
        <p className="text-slate-400 text-sm mb-5">
          Processing player <span className="font-black text-slate-600">{done}</span> of{" "}
          <span className="font-black text-slate-600">{total}</span>
        </p>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#06b6d4,#8b5cf6)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 font-mono text-xs text-slate-400">{progress}%</p>
      </div>
    </motion.div>
  );
}

// ── Player card
function PlayerCard({ fp, protocol, index }) {
  const s = riskStyle(fp.maxRisk);

  const topZones = useMemo(() => {
    return Object.entries(fp.risks)
      .filter(([k]) => !SKIP_KEYS.includes(k))
      .map(([k, v]) => ({ key: k, val: v?.total ?? 0 }))
      .filter(z => z.val >= 40)
      .sort((a, b) => b.val - a.val)
      .slice(0, 4);
  }, [fp.risks]);

  const cleanProtocol = protocol
    ? protocol.replace(/^Gemini AI Analysis:\s*/i, "")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="player-card"
      style={{
        background: "#fff",
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* Card top accent bar */}
      <div style={{ height: 3, background: fp.maxRisk >= 75 ? "#ef4444" : fp.maxRisk >= 40 ? "#f59e0b" : "#10b981" }} />

      <div className="flex" style={{ minHeight: 220 }}>
        {/* LEFT — body map */}
        <div className="flex flex-col items-center justify-center gap-3 flex-shrink-0"
          style={{
            width: 130, padding: "16px 10px",
            background: "#f8fafc",
            borderRight: "1px solid #f1f5f9",
          }}>
          <MiniBodyMap risks={fp.risks} />
          {/* Legend */}
          <div className="flex flex-col gap-1 w-full px-1">
            {topZones.length > 0 ? topZones.map(z => {
              const zs = riskStyle(z.val);
              return (
                <div key={z.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: zs.dot }} />
                    <span className="font-mono" style={{ fontSize: 8, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {ZONE_LABELS[z.key]}
                    </span>
                  </div>
                  <span className="font-mono font-black" style={{ fontSize: 9, color: zs.color }}>
                    {z.val.toFixed(0)}%
                  </span>
                </div>
              );
            }) : (
              <p className="font-mono text-center" style={{ fontSize: 8, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                No risk zones
              </p>
            )}
          </div>
        </div>

        {/* RIGHT — info */}
        <div className="flex flex-col flex-1 p-4 gap-3" style={{ minWidth: 0 }}>
          {/* Player header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={fp.player.imageUrl}
                alt={fp.player.name}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  objectFit: "cover", flexShrink: 0,
                  border: "1px solid #e2e8f0",
                  filter: "grayscale(15%)",
                }}
              />
              <div className="min-w-0">
                <p className="font-black text-sm text-slate-800 leading-tight truncate">{fp.player.name}</p>
                <p style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
                  {fp.player.position} · {fp.player.team}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                {fp.maxRisk >= 75
                  ? <ShieldAlert size={10} style={{ color: s.color }} />
                  : fp.maxRisk >= 40
                    ? <AlertTriangle size={10} style={{ color: s.color }} />
                    : <ShieldCheck size={10} style={{ color: s.color }} />}
                <span className="font-black font-mono" style={{ fontSize: 11, color: s.color }}>
                  {fp.maxRisk.toFixed(0)}%
                </span>
              </div>
              <span className="font-mono font-black" style={{ fontSize: 8, color: s.color, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                {s.label}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#f1f5f9" }} />

          {/* Biometrics row */}
          <div className="flex gap-3">
            {[
              { label: "Age", value: fp.player.age, unit: "yrs" },
              { label: "Sleep", value: fp.player.average_sleep_this_week?.toFixed(1), unit: "hrs" },
              { label: "Load", value: fp.player.recent_training_load, unit: "%" },
              { label: "RTP", value: fp.risks.rtpForecast, unit: "d" },
            ].map(m => (
              <div key={m.label} className="flex flex-col items-center" style={{ flex: "1 1 0", background: "#f8fafc", borderRadius: 8, padding: "6px 4px" }}>
                <span className="font-mono font-bold" style={{ fontSize: 7.5, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>{m.label}</span>
                <span className="font-black font-mono" style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.2 }}>{m.value}</span>
                <span className="font-mono" style={{ fontSize: 7.5, color: "#94a3b8" }}>{m.unit}</span>
              </div>
            ))}
          </div>

          {/* AI Protocol */}
          <div style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "10px 12px", border: "1px solid #e2e8f0", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 2.5, background: "#06b6d4", borderRadius: "0 2px 2px 0" }} />
            <div className="flex items-center gap-1.5 mb-1.5" style={{ paddingLeft: 10 }}>
              <BrainCircuit size={10} style={{ color: "#06b6d4", flexShrink: 0 }} />
              <span className="font-mono font-black"
                style={{ fontSize: 8, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.18em" }}>
                AI Clinical Recommendation
              </span>
            </div>
            <div style={{ paddingLeft: 10 }}>
              {cleanProtocol ? (
                <p style={{ fontSize: 11, color: "#334155", lineHeight: 1.55, margin: 0 }}>{cleanProtocol}</p>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#06b6d4" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <p style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", margin: 0 }}>Generating protocol…</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Stat badge for summary banner
function StatBadge({ value, label, color, bg, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-4 flex-1"
      style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 14, padding: "14px 18px" }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        {icon}
      </div>
      <div>
        <p className="font-black font-mono" style={{ fontSize: 26, color: "#1e293b", lineHeight: 1 }}>{value}</p>
        <p className="font-mono font-bold uppercase" style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.15em", marginTop: 3 }}>{label}</p>
      </div>
    </motion.div>
  );
}

// ── Section header
function SectionHeader({ label, color }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4">
      <div style={{ width: 4, height: 18, background: color, borderRadius: 4 }} />
      <span className="font-black font-mono uppercase"
        style={{ fontSize: 11, color, letterSpacing: "0.22em" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: `${color}25` }} />
    </div>
  );
}

// ── Main report page
export default function ReportPage() {
  const [protocols, setProtocols] = useState({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  const defaultPlayTime = 45;
  const defaultTemp = 15;

  const playerRisks = useMemo(() => {
    return players
      .map(p => {
        const risks = calculateInjuryRisk(p, {
          expected_play_time: defaultPlayTime,
          temperature: defaultTemp,
        });
        const muscleVals = Object.entries(risks)
          .filter(([k]) => !SKIP_KEYS.includes(k))
          .map(([, v]) => (typeof v === "object" ? v.total : v));
        const maxRisk = Math.max(...muscleVals);
        return { player: p, risks, maxRisk };
      })
      .sort((a, b) => b.maxRisk - a.maxRisk);
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchAll() {
      setLoading(true);
      const results = {};
      for (let i = 0; i < playerRisks.length; i++) {
        const fp = playerRisks[i];
        try {
          const res = await fetch("/api/generate-protocol", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              player: fp.player, risks: fp.risks,
              playTime: defaultPlayTime, temperature: defaultTemp,
            }),
          });
          const data = await res.json();
          if (active) {
            results[fp.player.id] = data.analysis;
            setProtocols({ ...results });
            setDoneCount(i + 1);
            setProgress(Math.round(((i + 1) / playerRisks.length) * 100));
          }
        } catch {
          if (active) results[fp.player.id] = "Offline – follow standard medical protocol.";
        }
      }
      if (active) {
        setLoading(false);
      }
    }
    fetchAll();
    return () => { active = false; };
  }, [playerRisks]);

  const criticalPlayers  = playerRisks.filter(fp => fp.maxRisk >= 75);
  const elevatedPlayers  = playerRisks.filter(fp => fp.maxRisk >= 40 && fp.maxRisk < 75);
  const clearPlayers     = playerRisks.filter(fp => fp.maxRisk < 40);
  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      {/* Full-page white cover so the global dark body doesn't show through */}
      <div style={{
        position: "fixed", inset: 0, background: "#f1f5f9", zIndex: 0, pointerEvents: "none"
      }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", background: "#f1f5f9" }}>

        {/* ── Loading screen ── */}
        <AnimatePresence>
          {loading && (
            <LoadingScreen
              done={doneCount}
              total={playerRisks.length}
              progress={progress}
            />
          )}
        </AnimatePresence>

        {/* ── Report content (shown after load) ── */}
        <AnimatePresence>
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* ════ HEADER ════ */}
              <header style={{
                background: "#0f172a",
                borderBottom: "1px solid rgba(6,182,212,0.2)",
                position: "sticky", top: 0, zIndex: 100,
                backdropFilter: "blur(12px)",
              }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {/* Brand */}
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Cpu size={16} style={{ color: "#22d3ee" }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.2em", color: "#fff", fontSize: 13, lineHeight: 1 }}>TWINFIT</p>
                      <p style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(6,182,212,0.7)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>
                        Daily Coach Report
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="hidden md:flex flex-col items-center">
                    <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {dateStr}
                    </p>
                    <p style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(6,182,212,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>
                      Generated by TwinFit AI Engine
                    </p>
                  </div>

                  {/* Print button */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.print()}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 18px",
                      background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)",
                      borderRadius: 10, color: "#22d3ee", cursor: "pointer",
                      fontFamily: "monospace", fontSize: 11, fontWeight: 800,
                      letterSpacing: "0.15em", textTransform: "uppercase",
                    }}
                  >
                    <Printer size={14} />
                    <span className="hidden sm:inline">Save PDF</span>
                  </motion.button>
                </div>
              </header>

              {/* ════ MAIN BODY ════ */}
              <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px" }}>

                {/* Summary banner */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex gap-3 flex-wrap mb-2"
                >
                  <StatBadge
                    value={playerRisks.length}
                    label="Players Monitored"
                    color="#06b6d4"
                    bg="#f0f9ff"
                    icon={<Activity size={16} style={{ color: "#06b6d4" }} />}
                  />
                  <StatBadge
                    value={criticalPlayers.length}
                    label="Critical Risk"
                    color="#dc2626"
                    bg="#fef2f2"
                    icon={<ShieldAlert size={16} style={{ color: "#dc2626" }} />}
                  />
                  <StatBadge
                    value={elevatedPlayers.length}
                    label="Elevated Risk"
                    color="#d97706"
                    bg="#fffbeb"
                    icon={<TrendingUp size={16} style={{ color: "#d97706" }} />}
                  />
                  <StatBadge
                    value={clearPlayers.length}
                    label="All Clear"
                    color="#059669"
                    bg="#f0fdf4"
                    icon={<CheckCircle2 size={16} style={{ color: "#059669" }} />}
                  />
                </motion.div>

                {/* RTP summary row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 14px", marginBottom: 8,
                    background: "#fff", border: "1px solid #e2e8f0",
                    borderRadius: 10,
                  }}
                >
                  <Clock size={13} style={{ color: "#06b6d4", flexShrink: 0 }} />
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#475569", letterSpacing: "0.05em" }}>
                    Match conditions used for this report:{" "}
                    <strong style={{ color: "#1e293b" }}>45 min play time</strong>,{" "}
                    <strong style={{ color: "#1e293b" }}>15°C temperature</strong> — adjust via the Coach Dashboard.
                  </span>
                </motion.div>

                {/* ─ CRITICAL SECTION ─ */}
                {criticalPlayers.length > 0 && (
                  <>
                    <SectionHeader label={`Critical Priority — ${criticalPlayers.length} Player${criticalPlayers.length > 1 ? "s" : ""}`} color="#dc2626" />
                    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))" }}>
                      {criticalPlayers.map((fp, i) => (
                        <PlayerCard
                          key={fp.player.id}
                          fp={fp}
                          protocol={protocols[fp.player.id]}
                          index={i}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* ─ ELEVATED SECTION ─ */}
                {elevatedPlayers.length > 0 && (
                  <>
                    <SectionHeader label={`Elevated Risk — ${elevatedPlayers.length} Player${elevatedPlayers.length > 1 ? "s" : ""}`} color="#d97706" />
                    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))" }}>
                      {elevatedPlayers.map((fp, i) => (
                        <PlayerCard
                          key={fp.player.id}
                          fp={fp}
                          protocol={protocols[fp.player.id]}
                          index={i}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* ─ CLEAR SECTION ─ */}
                {clearPlayers.length > 0 && (
                  <>
                    <SectionHeader label={`All Clear — ${clearPlayers.length} Player${clearPlayers.length > 1 ? "s" : ""}`} color="#059669" />
                    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))" }}>
                      {clearPlayers.map((fp, i) => (
                        <PlayerCard
                          key={fp.player.id}
                          fp={fp}
                          protocol={protocols[fp.player.id]}
                          index={i}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Footer */}
                <div style={{
                  marginTop: 48, paddingTop: 20, borderTop: "1px solid #e2e8f0",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  flexWrap: "wrap", gap: 8,
                }}>
                  <p style={{ fontFamily: "monospace", fontSize: 9, color: "#94a3b8", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    TwinFit AI Engine · Daily Coach Report · {dateStr}
                  </p>
                  <p style={{ fontFamily: "monospace", fontSize: 9, color: "#94a3b8", letterSpacing: "0.1em" }}>
                    {playerRisks.length} athletes · AI protocols generated at {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 18mm 14mm;
          }
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header { position: static !important; box-shadow: none !important; }
          button { display: none !important; }
          .player-card { break-inside: avoid; page-break-inside: avoid; }
        }
        @media (max-width: 600px) {
          .flex.gap-3.flex-wrap { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
