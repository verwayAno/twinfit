"use client";

/**
 * HotspotOverlay
 * 
 * Absolutely-positioned SVG that sits on top of either the anatomical
 * body SVG or a future athlete-base.png image.
 * 
 * viewBox matches the AnatomicalBody SVG (220 × 480).
 * Each hotspot uses a radialGradient core + a pulsing ring.
 */
export default function HotspotOverlay({ risks }) {
  const { hamstrings = 0, knees = 0, lowerBack = 0 } = risks;

  return (
    <svg
      viewBox="0 0 220 480"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
      aria-hidden="true"
    >
      <defs>
        {/* ── Safe zone gradient (cyan) ── */}
        <radialGradient id="hsSafe" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.55" />
          <stop offset="55%"  stopColor="#22d3ee" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>

        {/* ── Warning zone gradient (amber) ── */}
        <radialGradient id="hsWarn" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.65" />
          <stop offset="50%"  stopColor="#fbbf24" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>

        {/* ── Danger zone gradient (red) ── */}
        <radialGradient id="hsDanger" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#f87171" stopOpacity="0.75" />
          <stop offset="45%"  stopColor="#ef4444" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>

        {/* blur for soft glow blooms */}
        <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bloomStrong" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── LOWER BACK hotspot  (around lumbar zone ~y=140) ── */}
      <Hotspot
        cx={110} cy={142}
        rx={36}  ry={14}
        value={lowerBack}
      />

      {/* ── HAMSTRINGS hotspot (left + right thigh, y≈228) ── */}
      <Hotspot cx={88}  cy={228} rx={18} ry={32} value={hamstrings} />
      <Hotspot cx={132} cy={228} rx={18} ry={32} value={hamstrings} />

      {/* ── KNEES hotspot (y≈278) ── */}
      <Hotspot cx={88}  cy={278} rx={16} ry={18} value={knees} />
      <Hotspot cx={132} cy={278} rx={16} ry={18} value={knees} />
    </svg>
  );
}

/* ── Single hotspot: glow blob + pulsing ring ── */
function Hotspot({ cx, cy, rx, ry, value }) {
  const isHigh = value > 75;
  const isMed  = value >= 40;

  const gradId   = isHigh ? "hsDanger" : isMed ? "hsWarn" : "hsSafe";
  const stroke   = isHigh ? "#f87171"  : isMed ? "#fbbf24" : "#22d3ee";
  const ringCls  = isHigh ? "hs-ring-danger" : isMed ? "hs-ring-warn" : "hs-ring-safe";
  const coreCls  = isHigh ? "hs-core-danger" : isMed ? "hs-core-warn" : "hs-core-safe";
  const filterId = isHigh ? "bloomStrong" : "bloom";
  const strokeW  = isHigh ? 1.5 : 1;

  return (
    <g>
      {/* Glow bloom blob */}
      <ellipse
        cx={cx} cy={cy} rx={rx * 1.4} ry={ry * 1.4}
        fill={`url(#${gradId})`}
        filter={`url(#${filterId})`}
        opacity={0.7}
      />

      {/* Core pulsing ellipse */}
      <ellipse
        cx={cx} cy={cy} rx={rx} ry={ry}
        fill={`url(#${gradId})`}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeOpacity={0.7}
        className={coreCls}
        style={{ transition: "fill 0.6s ease, stroke 0.5s ease" }}
      />

      {/* Expanding ring (animated) */}
      <ellipse
        cx={cx} cy={cy} rx={rx * 0.65} ry={ry * 0.65}
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeOpacity="0.8"
        className={ringCls}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Centre dot */}
      <ellipse
        cx={cx} cy={cy} rx={rx * 0.18} ry={ry * 0.18}
        fill={stroke}
        opacity={isHigh ? 0.95 : 0.75}
        filter={`url(#${filterId})`}
      />
    </g>
  );
}
