import { NextResponse } from "next/server";

const MOCK_LLM_RESPONSES = [
  "Gemini AI Analysis: Based on the {RISK}% risk calculation and recent fatigue markers, I recommend capping playtime at 30 minutes. Pre-match: 20 mins soft-tissue massage. Post-match: Cryotherapy compression.",
  "Gemini AI Analysis: The elevated {RISK}% risk warrants immediate intervention. Standard protocol: Single-leg proprioception drills pre-warmup. Strict reduction of explosive sprints. Post-match: 12°C Ice bath for 10 minutes.",
  "Gemini AI Analysis: A {RISK}% risk zone detected. I prescribe dead bugs (3x12) and bird dogs (3x10) to stabilize the core. Limit total match intensity to 60%. Myofascial release required post-session.",
  "Gemini AI Analysis: Critical structural risk ({RISK}%). Immediate load reduction advised. Do not exceed 15 competitive minutes. Schedule an MRI scan and initiate TENS unit therapy twice daily.",
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { player, risks, playTime, temperature } = body;

    // Simulate LLM processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Use the pre-calculated highest risk value from the model
    const maxRisk = risks.rawMaxRisk || 0;

    // If safe, return a positive message
    if (maxRisk < 40) {
      return NextResponse.json({
        analysis: "Gemini AI Analysis: All biometrics and musculoskeletal models indicate low risk. Player is cleared for full participation. Standard recovery protocols apply."
      });
    }

    // Pick a mock response and replace variables
    const idx = Math.floor((player.id.charCodeAt(0) + maxRisk) % MOCK_LLM_RESPONSES.length);
    const mockAnalysis = MOCK_LLM_RESPONSES[idx].replace("{RISK}", maxRisk.toFixed(1));

    return NextResponse.json({ analysis: mockAnalysis });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate AI protocol" }, { status: 500 });
  }
}
