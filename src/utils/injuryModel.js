/**
 * TwinFit Predictive Injury Risk Engine (Advanced V3 - Explainable AI)
 * 
 * Provides granular factor breakdowns per muscle zone and 
 * financial risk metrics for Professional 'Explainable AI' dashboards.
 */
export function calculateInjuryRisk(player, environmentalFactors) {
  const { 
    recent_training_load = 50, 
    average_sleep_this_week = 7, 
    injury_history = "none", 
    height_cm = 180, 
    weight_kg = 75,
    age = 25,
    position = "Forward",
    market_value = 45000000 // Mocked market value for €45M
  } = player;
  const { expected_play_time = 45, temperature = 15 } = environmentalFactors;

  // BMI Calculation
  const bmi = weight_kg / Math.pow(height_cm / 100, 2);
  
  // 1. BASE LOAD FACTOR (0-50 range)
  const baseLoadScore = (recent_training_load * 0.45) + (expected_play_time * 0.35);
  
  // 2. BIOMETRIC OVERLOAD (0-20 range)
  const sleepDeficit = Math.max(0, 8 - average_sleep_this_week);
  const sleepPenalty = (sleepDeficit * 8); // e.g. 2 hrs deficit = 16 points
  const bmiPenalty = bmi > 25 ? (bmi - 25) * 6 : 0; 
  const agePenalty = age > 30 ? (age - 30) * 1.5 : 0;

  // Initialize all zones with their specific sensitivities
  const zones = {
    hamstrings: { load: 1.1, history: injury_history === "hamstring" ? 25 : 0 },
    knees:      { load: 1.0, history: injury_history === "knee" ? 25 : 0, temp: temperature < 5 ? 15 : 0 },
    lowerBack:  { load: 1.0, history: injury_history === "lower_back" ? 20 : 0 },
    quadriceps: { load: 1.0, history: 0 },
    groinAdductors: { load: 1.2, history: 0 },
    calvesGastrocnemius: { load: 1.1, history: injury_history === "calf" ? 20 : 0, ageFactor: age > 30 ? 1.2 : 1.0 },
    shouldersDeltoids: { load: position === "Goalkeeper" ? 1.4 : 0.8, history: 0 },
    ankles:     { load: 1.0, history: 0 },
    glutes:     { load: 0.9, history: 0 },
    obliques:   { load: 0.8, history: 0 },
    abdominals: { load: 0.8, history: 0 },
    upperBack:  { load: 0.7, history: 0 },
    biceps:     { load: position === "Goalkeeper" ? 1.2 : 0.6, history: 0 },
    triceps:    { load: position === "Goalkeeper" ? 1.2 : 0.6, history: 0 },
    chest:      { load: 0.6, history: 0 }
  };

  const processedRisks = {};
  let maxRisk = 0;

  Object.entries(zones).forEach(([key, config]) => {
    // Calculate three core factor contributions (Explainable AI)
    const trainingLoadContrib = Math.round(baseLoadScore * config.load);
    const recoveryContrib     = Math.round(sleepPenalty * (config.load > 1 ? 1.2 : 1.0));
    const biometricContrib    = Math.round(bmiPenalty + agePenalty + config.history + (config.temp || 0));

    const totalRaw = trainingLoadContrib + recoveryContrib + biometricContrib;
    const finalVal = Math.min(Math.round(totalRaw * 10) / 10, 100);

    processedRisks[key] = {
      total: finalVal,
      factors: {
        load: Math.min(trainingLoadContrib, 100),
        recovery: Math.min(recoveryContrib, 100),
        biometrics: Math.min(biometricContrib, 100)
      }
    };

    if (finalVal > maxRisk) maxRisk = finalVal;
  });

  // Financial Risk Metric (Value at Risk)
  // €1.2M base loss per week for high risk
  const weeklyVar = (market_value * 0.0005) * (maxRisk / 100); // approx €22k to €1.2M range
  const formattedVar = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(weeklyVar * 50);

  return {
    ...processedRisks, // These are now objects { total, factors }
    bmi: Math.round(bmi * 10) / 10,
    rtpForecast: Math.round(maxRisk * 0.18 * (age / 24)), 
    valueAtRisk: formattedVar,
    rawMaxRisk: maxRisk
  };
}
