/**
 * TwinFit Predictive Injury Risk Engine
 * 
 * Calculates injury risk percentages for hamstrings, knees, and lower back
 * based on player data and environmental factors using a heuristic model.
 * 
 * @param {Object} player - Player object with training load, sleep, injury history
 * @param {Object} environmentalFactors - Object with expected_play_time (0-90) and temperature (-5 to 40)
 * @returns {Object} Risk percentages: { hamstrings, knees, lowerBack }
 */
export function calculateInjuryRisk(player, environmentalFactors) {
  const { recent_training_load, average_sleep_this_week, injury_history } = player;
  const { expected_play_time, temperature } = environmentalFactors;

  // Base Risk = (recent_training_load * 0.4) + (expected_play_time * 0.3)
  const baseRisk = (recent_training_load * 0.4) + (expected_play_time * 0.3);

  // Start each zone at the base risk
  let hamstrings = baseRisk;
  let knees = baseRisk;
  let lowerBack = baseRisk;

  // If average_sleep_this_week < 6, multiply the whole score by 1.3
  const sleepMultiplier = average_sleep_this_week < 6 ? 1.3 : 1.0;
  hamstrings *= sleepMultiplier;
  knees *= sleepMultiplier;
  lowerBack *= sleepMultiplier;

  // If temperature < 5°C, add +15 to knees
  if (temperature < 5) {
    knees += 15;
  }

  // If injury_history matches a specific zone, add +25 to that zone
  if (injury_history === "hamstring") {
    hamstrings += 25;
  }
  if (injury_history === "knee") {
    knees += 25;
  }
  if (injury_history === "lower_back") {
    lowerBack += 25;
  }

  // Cap all final values at 100%
  hamstrings = Math.min(Math.round(hamstrings * 10) / 10, 100);
  knees = Math.min(Math.round(knees * 10) / 10, 100);
  lowerBack = Math.min(Math.round(lowerBack * 10) / 10, 100);

  return {
    hamstrings,
    knees,
    lowerBack,
  };
}
