"use client";

/**
 * AnatomicalBody — clean front-view human silhouette SVG.
 * Intentionally styled as a dark, blueprint-style reference layer.
 * The HotspotOverlay sits on top for the interactive risk visualization.
 */
export default function AnatomicalBody() {
  return (
    <svg
      viewBox="0 0 220 480"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Anatomical reference body"
    >
      <defs>
        <radialGradient id="bodyAmbient" cx="50%" cy="45%" r="45%">
          <stop offset="0%"   stopColor="rgba(6,182,212,0.07)" />
          <stop offset="100%" stopColor="rgba(6,182,212,0)" />
        </radialGradient>
        <pattern id="bpGrid" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M14 0L0 0 0 14" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="0.5" />
        </pattern>

        {/* Subtle inner glow for silhouette */}
        <filter id="bodyGlow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feOffset dx="0" dy="0" result="off" />
          <feComposite in="SourceGraphic" in2="off" operator="over" />
        </filter>
      </defs>

      {/* Blueprint grid */}
      <rect width="220" height="480" fill="url(#bpGrid)" />
      <rect width="220" height="480" fill="url(#bodyAmbient)" />

      {/* ═══ HEAD ═══ */}
      <ellipse cx="110" cy="34" rx="24" ry="26"
        fill="rgba(15,26,48,0.85)" stroke="rgba(6,182,212,0.22)" strokeWidth="1.2" />
      {/* ear details */}
      <path d="M 86 30 Q 82 34 82 40 Q 82 44 86 46" fill="none" stroke="rgba(6,182,212,0.14)" strokeWidth="1" />
      <path d="M 134 30 Q 138 34 138 40 Q 138 44 134 46" fill="none" stroke="rgba(6,182,212,0.14)" strokeWidth="1" />
      {/* face lines */}
      <line x1="100" y1="32" x2="105" y2="32" stroke="rgba(6,182,212,0.1)" strokeWidth="0.8" />
      <line x1="115" y1="32" x2="120" y2="32" stroke="rgba(6,182,212,0.1)" strokeWidth="0.8" />
      <path d="M 104 40 Q 110 43 116 40" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="0.8" />

      {/* ═══ NECK ═══ */}
      <rect x="104" y="59" width="12" height="14" rx="3"
        fill="rgba(15,26,48,0.85)" stroke="rgba(6,182,212,0.18)" strokeWidth="1" />

      {/* ═══ CLAVICLES ═══ */}
      <path d="M 110 72 Q 88 70 76 80" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 110 72 Q 132 70 144 80" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1.2" strokeLinecap="round" />

      {/* ═══ SHOULDERS ═══ */}
      <ellipse cx="73" cy="84" rx="16" ry="9" fill="rgba(15,26,48,0.75)" stroke="rgba(6,182,212,0.18)" strokeWidth="1" />
      <ellipse cx="147" cy="84" rx="16" ry="9" fill="rgba(15,26,48,0.75)" stroke="rgba(6,182,212,0.18)" strokeWidth="1" />

      {/* ═══ UPPER ARMS ═══ */}
      <path d="M 61 84 C 51 92 43 110 40 132 C 38 142 40 150 44 153 L 52 153 C 50 150 48 142 50 132 C 52 112 60 95 68 88 Z"
        fill="rgba(13,22,42,0.8)" stroke="rgba(6,182,212,0.14)" strokeWidth="1" />
      <path d="M 159 84 C 169 92 177 110 180 132 C 182 142 180 150 176 153 L 168 153 C 170 150 172 142 170 132 C 168 112 160 95 152 88 Z"
        fill="rgba(13,22,42,0.8)" stroke="rgba(6,182,212,0.14)" strokeWidth="1" />
      {/* deltoid seam lines */}
      <path d="M 63 90 C 60 100 56 115 55 128" fill="none" stroke="rgba(6,182,212,0.07)" strokeWidth="0.8" />
      <path d="M 157 90 C 160 100 164 115 165 128" fill="none" stroke="rgba(6,182,212,0.07)" strokeWidth="0.8" />

      {/* ═══ FOREARMS ═══ */}
      <path d="M 40 154 C 36 168 34 186 36 200 L 45 200 C 43 186 43 168 47 154 Z"
        fill="rgba(12,20,38,0.75)" stroke="rgba(6,182,212,0.12)" strokeWidth="1" />
      <path d="M 180 154 C 184 168 186 186 184 200 L 175 200 C 177 186 177 168 173 154 Z"
        fill="rgba(12,20,38,0.75)" stroke="rgba(6,182,212,0.12)" strokeWidth="1" />

      {/* ═══ HANDS ═══ */}
      <ellipse cx="40" cy="207" rx="7" ry="10" fill="rgba(12,20,38,0.75)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.8" />
      <ellipse cx="180" cy="207" rx="7" ry="10" fill="rgba(12,20,38,0.75)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.8" />

      {/* ═══ CHEST / TORSO ═══ */}
      <path d="M 76 73 L 144 73 L 148 96 C 150 112 149 138 146 152 L 74 152 C 71 138 70 112 72 96 Z"
        fill="rgba(14,24,44,0.85)" stroke="rgba(6,182,212,0.18)" strokeWidth="1.2" />
      {/* pec split */}
      <line x1="110" y1="78" x2="110" y2="148" stroke="rgba(6,182,212,0.07)" strokeWidth="0.8" />
      {/* pec muscle curves */}
      <path d="M 80 92 Q 95 100 110 96" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="1" />
      <path d="M 140 92 Q 125 100 110 96" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="1" />
      {/* abs lines */}
      <line x1="95"  y1="115" x2="125" y2="115" stroke="rgba(6,182,212,0.07)" strokeWidth="0.8" />
      <line x1="94"  y1="130" x2="126" y2="130" stroke="rgba(6,182,212,0.07)" strokeWidth="0.8" />
      <line x1="94"  y1="144" x2="126" y2="144" stroke="rgba(6,182,212,0.07)" strokeWidth="0.8" />
      {/* ab rects */}
      {[[99,105],[112,105],[99,118],[112,118],[99,131],[112,131]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="9" height="9" rx="2.5"
          fill="rgba(6,182,212,0.04)" stroke="rgba(6,182,212,0.09)" strokeWidth="0.7" />
      ))}

      {/* ═══ LOWER BACK highlight zone (reference outline only — hotspot overlay goes on top) ═══ */}
      <path d="M 84 136 L 136 136 L 136 153 L 84 153 Z"
        fill="rgba(6,182,212,0.02)" stroke="rgba(6,182,212,0.12)" strokeWidth="0.8" strokeDasharray="3,3" />

      {/* ═══ HIPS / PELVIS ═══ */}
      <path d="M 79 153 C 72 162 70 176 76 188 L 110 190 L 144 188 C 150 176 148 162 141 153 Z"
        fill="rgba(13,22,42,0.8)" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />

      {/* ═══ UPPER LEGS (quads) ═══ */}
      <path d="M 79 188 C 74 196 72 218 72 238 C 72 254 74 264 78 272 L 96 272 C 100 264 102 254 102 238 C 102 218 100 196 96 188 Z"
        fill="rgba(11,19,36,0.85)" stroke="rgba(6,182,212,0.14)" strokeWidth="1" />
      <path d="M 141 188 C 146 196 148 218 148 238 C 148 254 146 264 142 272 L 124 272 C 120 264 118 254 118 238 C 118 218 120 196 124 188 Z"
        fill="rgba(11,19,36,0.85)" stroke="rgba(6,182,212,0.14)" strokeWidth="1" />
      {/* quad fiber lines */}
      <path d="M 82 202 C 82 220 82 248 84 264" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="0.8" />
      <path d="M 92 196 C 93 214 95 248 92 265" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="0.8" />
      <path d="M 138 202 C 138 220 138 248 136 264" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="0.8" />
      <path d="M 128 196 C 127 214 125 248 128 265" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="0.8" />
      {/* hamstring reference dashes */}
      <path d="M 84 198 L 84 260 M 100 198 L 100 260"
        fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.8" strokeDasharray="2,4" />
      <path d="M 136 198 L 136 260 M 120 198 L 120 260"
        fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.8" strokeDasharray="2,4" />

      {/* ═══ KNEES ═══ */}
      <ellipse cx="87" cy="280" rx="15" ry="17"
        fill="rgba(10,18,34,0.85)" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
      <ellipse cx="133" cy="280" rx="15" ry="17"
        fill="rgba(10,18,34,0.85)" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
      {/* kneecap */}
      <ellipse cx="87"  cy="279" rx="7"  ry="8"  fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.14)" strokeWidth="0.8" />
      <ellipse cx="133" cy="279" rx="7"  ry="8"  fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.14)" strokeWidth="0.8" />

      {/* ═══ LOWER LEGS ═══ */}
      <path d="M 76 298 C 75 316 75 346 77 374 C 79 383 83 388 87 388 C 91 388 95 383 97 374 C 99 346 99 316 98 298 Z"
        fill="rgba(10,17,32,0.8)" stroke="rgba(6,182,212,0.11)" strokeWidth="1" />
      <path d="M 144 298 C 145 316 145 346 143 374 C 141 383 137 388 133 388 C 129 388 125 383 123 374 C 121 346 121 316 122 298 Z"
        fill="rgba(10,17,32,0.8)" stroke="rgba(6,182,212,0.11)" strokeWidth="1" />
      {/* shin ridge */}
      <line x1="87" y1="304" x2="87" y2="372" stroke="rgba(6,182,212,0.07)" strokeWidth="1" />
      <line x1="133" y1="304" x2="133" y2="372" stroke="rgba(6,182,212,0.07)" strokeWidth="1" />

      {/* ═══ ANKLES + FEET ═══ */}
      <ellipse cx="87" cy="392" rx="11" ry="7" fill="rgba(10,17,32,0.8)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.9" />
      <ellipse cx="133" cy="392" rx="11" ry="7" fill="rgba(10,17,32,0.8)" stroke="rgba(6,182,212,0.1)" strokeWidth="0.9" />
      <path d="M 77 396 C 73 400 72 408 76 412 L 102 412 C 104 408 102 400 98 396 Z"
        fill="rgba(10,17,32,0.8)" stroke="rgba(6,182,212,0.09)" strokeWidth="0.9" />
      <path d="M 123 396 C 119 400 118 408 122 412 L 148 412 C 150 408 148 400 144 396 Z"
        fill="rgba(10,17,32,0.8)" stroke="rgba(6,182,212,0.09)" strokeWidth="0.9" />
    </svg>
  );
}
