"use client";

import { useState, useEffect } from "react";
import { User, X, Camera, Video, Play, Mic, Send, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider, message } from "antd";
import players from "@/data/players.json";

// Quick Hotspot Map for Anterior/Posterior SVG Simulation
const HOTSPOTS_FRONT = [
  { id: "Right Shoulder", top: "25%", left: "35%", color: "amber" }, 
  { id: "Left Shoulder", top: "25%", left: "65%",  color: "cyan" },
  { id: "Chest", top: "32%", left: "50%", color: "cyan" },
  { id: "Right Hip", top: "50%", left: "42%", color: "cyan" }, 
  { id: "Left Hip", top: "50%", left: "58%", color: "cyan" },
  { id: "Right Quad", top: "62%", left: "43%", color: "cyan" }, 
  { id: "Left Quad", top: "62%", left: "57%", color: "cyan" },
  { id: "Right Knee", top: "75%", left: "43%", color: "amber" }, 
  { id: "Left Knee", top: "75%", left: "57%", color: "cyan" },
];

const HOTSPOTS_BACK = [
  { id: "Upper Back", top: "28%", left: "50%", color: "cyan" },
  { id: "Lower Back", top: "45%", left: "50%", color: "red" },
  { id: "Right Hamstring", top: "65%", left: "42%", color: "cyan" }, 
  { id: "Left Hamstring", top: "65%", left: "58%", color: "cyan" },
  { id: "Right Calf", top: "82%", left: "43%", color: "cyan" }, 
  { id: "Left Calf", top: "82%", left: "57%", color: "cyan" },
];

// Tailwind Color dictionary for mapping our states
const DYNAMIC_COLORS = {
  cyan: "bg-cyan-400 shadow-[0_0_20px_#22d3ee]",
  amber: "bg-amber-500 shadow-[0_0_20px_#f59e0b]",
  red: "bg-red-500 shadow-[0_0_20px_#ef4444]"
};

export default function PlayerApp({ setPlayerSubmissions, setLiveAlerts }) {
  const [currentScreen, setCurrentScreen] = useState("list"); // "list" | "checkin"
  const [activePlayer, setActivePlayer] = useState(null);

  const [viewState, setViewState] = useState("anterior"); // 'anterior' or 'posterior'
  const [selectedZones, setSelectedZones] = useState([]);
  
  const [painLevel, setPainLevel] = useState(6);
  const [activeSymptoms, setActiveSymptoms] = useState([]);
  
  const [scannerStage, setScannerStage] = useState("idle");
  const [videoRecorded, setVideoRecorded] = useState(false);
  
  const [inputValue, setInputValue] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Animation variants
  const fadeIn = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const fadeLayout = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }, exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } } };

  // Handlers
  const openCheckIn = (player) => {
    setActivePlayer(player);
    // Reset defaults for this checkin
    setViewState("anterior");
    setSelectedZones([]);
    setPainLevel(6);
    setActiveSymptoms([]);
    setScannerStage("idle");
    setVideoRecorded(false);
    setInputValue("");
    setCurrentScreen("checkin");
  };

  const toggleZone = (id) => {
    if (selectedZones.includes(id)) {
      setSelectedZones(prev => prev.filter(z => z !== id));
    } else {
      setSelectedZones(prev => [...prev, id]);
    }
  };

  const toggleSymptom = (sym) => {
    if (activeSymptoms.includes(sym)) {
      setActiveSymptoms(prev => prev.filter(s => s !== sym));
    } else {
      setActiveSymptoms(prev => [...prev, sym]);
    }
  };

  const handleCameraClick = () => {
    if(scannerStage !== "idle") return;
    setScannerStage("scanning");
    setTimeout(() => setScannerStage("success"), 2500);
  };

  const submitStatus = () => {
    if (!activePlayer) return;
    
    // 1. Alert Triage System
    message.success("Biometrics securely transmitted to the Medical Bay.");

    // 2. Dispatch data to Global Store
    setPlayerSubmissions(prev => ({
      ...prev,
      [activePlayer.id]: {
         nlpLog: inputValue || `Submitted Check-in: Pain Level ${painLevel}/10. Symptoms: ${activeSymptoms.join(", ") || "None"}`,
         targetedZones: selectedZones,
         hasMedia: scannerStage === "success" || videoRecorded,
         timestamp: new Date().toISOString()
      }
    }));

    // 3. Dispatch Live Alert to Coach if risk is high
    if (painLevel >= 6 || selectedZones.length > 0 || scannerStage === "success") {
      setLiveAlerts(prev => [{
          id: Date.now(),
          title: "Player Biometric Alert",
          message: `${activePlayer.name} logged elevated markers (Pain: ${painLevel}/10). Medical algorithms engaged.`,
          type: "warning",
          time: new Date()
      }, ...prev]);
    }
    
    // Navigate back to hub after simulation
    setTimeout(() => {
        setCurrentScreen("list");
    }, 1500);
  };

  return (
    // The Mobile Chassis - Specifically bounded layout. overflow-hidden forces inner scrolling
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-slate-950 border-[8px] border-slate-800 rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden isolate">
      
      {/* 1. Global Header */}
      <div className="bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-5 py-4 shrink-0 relative z-50">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setCurrentScreen("list")}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentScreen === 'checkin' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white cursor-pointer active:scale-95' : 'opacity-0 pointer-events-none'}`}
          >
            <X size={16}/>
          </button>
          <h1 className="text-cyan-400 font-bold tracking-[0.15em] text-[12px] uppercase">TwinBot {currentScreen === "list" ? "Hub" : "Check-in"}</h1>
          <div className="w-8 h-8 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0"><User size={14}/></div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {currentScreen === "list" && (
              <motion.div key="list" variants={fadeLayout} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 flex flex-col overflow-y-auto custom-scrollbar p-5 pb-8">
                 <div className="mb-4">
                    <h2 className="text-white font-bold text-xl mb-1">Athlete Roster</h2>
                    <p className="text-slate-400 text-xs">Tap your profile to initiate the AI medical check-in proxy.</p>
                 </div>
                 
                 <div className="flex flex-col gap-3">
                   {players.map(p => (
                     <div 
                       key={p.id} 
                       onClick={() => openCheckIn(p)}
                       className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
                     >
                       <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-full object-cover bg-slate-950 border border-slate-700" onError={(e) => e.currentTarget.src = "/anatomy-front.png"} />
                       <div className="flex-1">
                         <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                         <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-500 transition-colors"></div>{p.position}</span>
                       </div>
                       <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors transform group-hover:translate-x-1" />
                     </div>
                   ))}
                 </div>
              </motion.div>
            )}

            {currentScreen === "checkin" && activePlayer && (
              <motion.div key="checkin" variants={fadeLayout} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 flex flex-col overflow-hidden bg-slate-950">
                
                {/* Scrollable Main Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-6 pb-[90px]">
                    {/* AI Glassmorphic Bubble */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-lg relative">
                       <p className="text-sm text-slate-200 leading-relaxed font-medium font-sans">
                         Hi {activePlayer.name.split(" ")[0]}, let's quickly track your status. Send a voice note, text, or upload photos/videos. Your medical team is ready. How is your body feeling?
                       </p>
                       <div className="absolute -bottom-2 left-6 w-4 h-4 bg-slate-800/60 border-b border-r border-slate-700/80 rotate-45"></div>
                    </motion.div>

                    {/* Interactive High-Fidelity Body Map */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="flex flex-col">
                       <div className="flex items-center justify-between mb-3">
                         <div className="flex flex-col">
                           <span className="text-xs font-bold text-slate-300 tracking-wider">TAP PAIN ZONES</span>
                           <span className="text-[10px] text-slate-500">(Anterior/Posterior Views)</span>
                         </div>
                         <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
                            <button onClick={() => setViewState("anterior")} className={`px-2 py-1 text-[10px] rounded-md transition-all font-bold ${viewState === 'anterior' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>Anterior</button>
                            <button onClick={() => setViewState("posterior")} className={`px-2 py-1 text-[10px] rounded-md transition-all font-bold ${viewState === 'posterior' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>Posterior</button>
                         </div>
                       </div>

                       <div className="relative w-full h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 rounded-2xl flex justify-center items-center overflow-hidden border border-slate-800/80 isolation-auto">
                          
                          <img 
                            src={viewState === "anterior" ? "/images/athlete_anterior.png" : "/images/athlete_posterior.png"} 
                            alt="Human Anatomy"
                            className="h-full object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] pointer-events-none opacity-80"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                          />
                          <div className="hidden absolute inset-0 m-auto flex flex-col items-center justify-center opacity-30 pointer-events-none">
                             <User size={150} className="text-[#22d3ee] mb-4" strokeWidth={1} />
                             <span className="text-xs tracking-widest text-[#22d3ee] uppercase">Missing Asset</span>
                          </div>

                          <AnimatePresence>
                            {(viewState === "anterior" ? HOTSPOTS_FRONT : HOTSPOTS_BACK).map((hs) => {
                              const isSelected = selectedZones.includes(hs.id);
                              return (
                                <div 
                                  key={hs.id}
                                  onClick={() => toggleZone(hs.id)}
                                  className="absolute z-10 w-10 h-10 -ml-5 -mt-5 flex items-center justify-center cursor-pointer group"
                                  style={{ top: hs.top, left: hs.left }}
                                >
                                  <div className={`w-3 h-3 rounded-full bg-slate-600/50 backdrop-blur-sm border border-white/20 transition-all ${isSelected ? 'scale-0' : 'group-hover:scale-150'}`} />
                                  
                                  {isSelected && (
                                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                                                className={`absolute w-6 h-6 rounded-full blur-[2px] animate-pulse ${DYNAMIC_COLORS[hs.color]}`} />
                                  )}
                                  {isSelected && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`absolute w-2 h-2 rounded-full ${DYNAMIC_COLORS[hs.color].split(" ")[0]} border-2 border-white`} />
                                  )}
                                </div>
                              )
                            })}
                          </AnimatePresence>

                          <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-slate-950/40 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400"></div><span className="text-[9px] text-slate-300">Safe</span></div>
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[9px] text-slate-300">Elevated</span></div>
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[9px] text-slate-300">Critical</span></div>
                          </div>
                       </div>
                    </motion.div>

                    {/* Multimodal Upload Cards */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3">
                       <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/80 rounded-2xl p-3 flex flex-col relative overflow-hidden h-[160px]">
                          <div className="flex items-center gap-1.5 mb-3 opacity-80">
                             <Camera size={12} className="text-cyan-400"/>
                             <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Upload Photos</span>
                          </div>
                          <div className="flex gap-1.5 justify-center mb-3">
                             <div className="w-10 h-10 bg-slate-900 rounded-md border border-slate-700"></div>
                             <div className="w-10 h-10 bg-slate-900 rounded-md border border-slate-700"></div>
                             <div className="w-10 h-10 bg-slate-900 rounded-md border border-cyan-500/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-cyan-500/10"></div>
                                {scannerStage === "scanning" && (
                                   <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-full h-0.5 bg-cyan-400 absolute left-0 shadow-[0_0_8px_#22d3ee]" />
                                )}
                                {scannerStage === "success" && (
                                   <div className="absolute inset-0 flex items-center justify-center bg-cyan-900/50 backdrop-blur-sm"><CheckCircle2 size={16} className="text-cyan-400"/></div>
                                )}
                             </div>
                          </div>
                          <button 
                            onClick={handleCameraClick}
                            className="mt-auto w-full py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] font-bold text-slate-200 transition-colors border border-slate-600/50 flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            {scannerStage === "idle" ? "AI Vision Scanner" : scannerStage === "scanning" ? "Scanning..." : "Complete"}
                          </button>
                       </div>
                       
                       <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/80 rounded-2xl p-3 flex flex-col relative overflow-hidden h-[160px]">
                          <div className="flex items-center gap-1.5 mb-2 opacity-80">
                             <Video size={12} className="text-cyan-400"/>
                             <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Upload Video</span>
                          </div>
                          <div className="w-full h-[55px] bg-slate-950 rounded-lg relative overflow-hidden border border-slate-800 mb-2 group cursor-pointer" onClick={() => setVideoRecorded(true)}>
                             {videoRecorded ? (
                               <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-slate-900/80 px-1 py-0.5 rounded text-[8px] font-bold text-emerald-400">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Recorded
                               </div>
                             ) : (
                               <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                                 <Play size={18} className="text-white fill-white"/>
                               </div>
                             )}
                             {videoRecorded && <span className="absolute bottom-1 right-1 text-[8px] text-white">0:14</span>}
                          </div>
                          <button 
                            onClick={() => setVideoRecorded(true)}
                            className="mt-auto w-full py-2 bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-lg text-[10px] uppercase font-bold text-slate-950 transition-colors active:scale-95"
                           >
                            Record Video
                          </button>
                       </div>
                    </motion.div>

                    {/* Clinical Pain Assessment & Submission */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.3 }}  className="flex flex-col bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Linear Pain Scale</span>
                         <span className="text-[10px] font-bold text-cyan-400">SUBMIT MY FEELING: {painLevel}/10</span>
                       </div>
                       
                       <Slider
                         min={0} max={10} value={painLevel} onChange={setPainLevel}
                         marks={{ 0: "0", 10: "10" }}
                         trackStyle={{ backgroundColor: "#22d3ee", height: "4px" }}
                         handleStyle={{ borderColor: "#22d3ee", backgroundColor: "#0f172a" }}
                         className="mt-1 mb-6"
                       />

                       <div className="flex flex-wrap gap-2 mb-4">
                          {["STIFFNESS", "ACHE", "SPASM", "CRITICAL PAIN"].map(sym => (
                            <button 
                              key={sym} onClick={() => toggleSymptom(sym)}
                              className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full transition-all border ${activeSymptoms.includes(sym) ? 'bg-slate-700 text-white border-slate-500' : 'bg-slate-950 text-slate-500 border-slate-800'}`}
                            >
                              {sym}
                            </button>
                          ))}
                       </div>

                       <button 
                         onClick={submitStatus}
                         className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-slate-950 font-black tracking-widest uppercase shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
                       >
                         Submit My Status
                       </button>
                       <p className="text-center text-[10px] text-slate-500 mt-2">Data cryptographically sent to medical team.</p>
                    </motion.div>
                </div>
                
                {/* 5. Fixed Input Bar anchored strictly to the absolute bottom of the motion.div chassis */}
                <div className="absolute bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 flex items-center gap-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                   <button className="text-slate-400 p-1 hover:text-[#22d3ee] transition-colors"><Camera size={16}/></button>
                   <div className="flex-1 bg-slate-950 border border-slate-800 rounded-full flex items-center relative focus-within:border-slate-700 transition-colors">
                     <input 
                       value={inputValue}
                       onChange={e => setInputValue(e.target.value)}
                       placeholder="Message TwinBot with details..." 
                       className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-slate-600 pl-4 py-2"
                     />
                   </div>
                   {inputValue.trim().length > 0 ? (
                     <button onClick={submitStatus} className="p-1.5 bg-[#22d3ee] hover:bg-cyan-300 text-slate-950 rounded-full flex shrink-0 transition-colors"><Send size={14}/></button>
                   ) : (
                     <button 
                        onMouseDown={() => setIsRecordingVoice(true)} onMouseUp={() => setIsRecordingVoice(false)}
                        className={`text-slate-400 transition-colors ${isRecordingVoice ? 'text-red-400' : 'hover:text-white'}`}
                     >
                      <Mic size={18}/>
                     </button>
                   )}
                   
                   <div className="w-8 h-6 flex flex-col justify-center shrink-0">
                     {isRecordingVoice ? (
                       <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" className="animate-pulse">
                         <path d="M 2 12 L 6 12 L 9 4 L 14 20 L 17 12 L 22 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                     ) : (
                       <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                         <path d="M 2 12 L 22 12" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
                         <path d="M 12 8 L 12 16" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
                         <path d="M 16 10 L 16 14" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                         <path d="M 8 10 L 8 14" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                       </svg>
                     )}
                   </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
      </div>

    </div>
  );
}
