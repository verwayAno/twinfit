"use client";

import Model from "react-body-highlighter";
import { useMemo } from "react";

// TwinFit Engine to React-Body-Highlighter API Mapper
const API_MUSCLE_MAP = {
  hamstrings: "hamstring",
  knees: "knees",
  lowerBack: "lower-back",
  // Extending capabilities for a purely professional grade model
  quadriceps: "quadriceps",
  chest: "chest"
};

export default function ThermalBody({ risks = {}, rotationY = 0, size = "large" }) {
  
  // Custom Cyberpunk Gradient for muscle intensities
  const customColors = [
    "#0f172a", // 0 (empty background) - we actually won't hit this inside the array
    "#22d3ee", // 1 - Nominal (Cyan)
    "#38bdf8", // 2 - Nominal High (Blue-Cyan)
    "#fbbf24", // 3 - Elevated (Amber)
    "#fb923c", // 4 - High (Orange)
    "#ef4444", // 5 - Critical (Red)
    "#b91c1c"  // 6 - Max Critical (Deep Red)
  ];

  const modelData = useMemo(() => {
    let output = [];
    
    // Convert percentage risks to frequency counts to trigger the library's heatmap colors
    Object.entries(risks).forEach(([twinFitKey, riskValue]) => {
      const apiMuscleKey = API_MUSCLE_MAP[twinFitKey];
      if (!apiMuscleKey || riskValue < 10) return;

      // Map 0-100% to an intensity frequency (1 to 6)
      let frequency = Math.floor(riskValue / 16); 
      if (frequency > 6) frequency = 6;

      for(let i=0; i<=frequency; i++) {
        output.push({
          name: `${apiMuscleKey}_stress_${i}`,
          muscles: [apiMuscleKey]
        });
      }
    });

    return output;
  }, [risks]);

  // Map 360 rotation UI to Model's Anterior/Posterior states natively
  const normalizedRotation = ((rotationY % 360) + 360) % 360;
  const isFrontVisible = normalizedRotation < 90 || normalizedRotation > 270;

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-none">
       <div className={`transition-all duration-500 opacity-90 ${size === "small" ? "w-[120px] h-[240px]" : "w-full max-w-[280px] h-[500px]"}`} style={{ filter: "drop-shadow(0 0 15px rgba(34,211,238,0.4)) drop-shadow(0 0 30px rgba(34,211,238,0.2))" }}>
         <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
           <linearGradient id="holo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
             <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
           </linearGradient>
         </svg>
         <Model
            data={modelData}
            style={{ width: "100%", padding: "10px" }}
            type={isFrontVisible ? "anterior" : "posterior"}
            highlightedColors={customColors}
         />
       </div>
    </div>
  );
}
