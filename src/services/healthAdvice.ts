/**
 * Health Advice Service
 *
 * Generates personalized health advisory messages based on the current
 * AQI category and the user's health conditions (from their profile).
 *
 * Messages are organized by NAQI category × health condition, with
 * a general fallback for users without specific health conditions.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HealthAdviceResult {
  /** The headline advice for the current AQI level */
  headline: string;
  /** Personalized message based on health conditions */
  message: string;
  /** Emoji icon hinting at severity */
  icon: string;
  /** Actionable precautions */
  precautions: string[];
}

// ─── Advice Database ─────────────────────────────────────────────────────────

type AQICategoryKey =
  | "Good"
  | "Satisfactory"
  | "Moderate"
  | "Poor"
  | "Very Poor"
  | "Severe";

/**
 * Personalized advice per AQI category × health condition.
 * Each condition maps to { message, precautions[] }.
 */
const HEALTH_ADVICE_MAP: Record<
  AQICategoryKey,
  {
    headline: string;
    icon: string;
    general: { message: string; precautions: string[] };
    conditions: Record<string, { message: string; precautions: string[] }>;
  }
> = {
  Good: {
    headline: "Air quality is great!",
    icon: "😊",
    general: {
      message:
        "Air quality is excellent today. Perfect for outdoor activities like jogging, cycling, or a walk in the park.",
      precautions: [],
    },
    conditions: {
      asthma: {
        message:
          "Air quality is excellent. Safe for all activities — enjoy the outdoors without worry. A great day for some fresh air!",
        precautions: ["Carry your inhaler as a standard precaution."],
      },
      copd: {
        message:
          "Air quality is excellent today. Light outdoor activity is safe and encouraged. Enjoy the fresh air!",
        precautions: [
          "Keep rescue medication accessible as always.",
          "Stay hydrated during outdoor activities.",
        ],
      },
      heart_disease: {
        message:
          "Air quality poses no cardiac risk today. Moderate outdoor exercise is perfectly safe.",
        precautions: ["Maintain your regular medication schedule."],
      },
      allergies: {
        message:
          "Air quality is great. Pollen and particulate levels are low — a good day for outdoor time.",
        precautions: [
          "Check local pollen forecasts separately if you have seasonal allergies.",
        ],
      },
    },
  },

  Satisfactory: {
    headline: "Air quality is acceptable",
    icon: "🙂",
    general: {
      message:
        "Air quality is acceptable. Most people can continue outdoor activities normally.",
      precautions: [
        "Sensitive individuals may want to limit prolonged outdoor exertion.",
      ],
    },
    conditions: {
      asthma: {
        message:
          "Air quality is mostly fine, but prolonged outdoor exercise may cause minor irritation. Keep activities moderate.",
        precautions: [
          "Keep your inhaler accessible.",
          "Watch for early symptoms like mild wheezing.",
        ],
      },
      copd: {
        message:
          "Air quality is acceptable but not ideal for extended outdoor time. Short walks are fine; avoid strenuous activities.",
        precautions: [
          "Limit outdoor exertion to 30-minute sessions.",
          "Stay in well-ventilated indoor spaces.",
        ],
      },
      heart_disease: {
        message:
          "Air quality is acceptable. Light outdoor activity is safe, but avoid intense workouts outdoors.",
        precautions: [
          "Monitor heart rate during outdoor activities.",
          "Stay hydrated.",
        ],
      },
      allergies: {
        message:
          "Air quality is acceptable. Minor pollutants may trigger mild reactions in highly sensitive individuals.",
        precautions: [
          "Consider an antihistamine if you feel nasal congestion.",
          "Keep windows mostly closed during peak hours.",
        ],
      },
    },
  },

  Moderate: {
    headline: "Air quality is moderate",
    icon: "😐",
    general: {
      message:
        "Air quality is moderate. The general public is unlikely to be affected, but sensitive groups should take care.",
      precautions: [
        "Reduce prolonged outdoor exertion if you feel discomfort.",
        "Keep windows closed during peak pollution hours.",
      ],
    },
    conditions: {
      asthma: {
        message:
          "Air quality may trigger mild symptoms. Avoid prolonged outdoor activity and keep your rescue inhaler nearby at all times.",
        precautions: [
          "Use your preventer inhaler as prescribed.",
          "Keep your reliever/rescue inhaler on you.",
          "Prefer indoor exercise today.",
        ],
      },
      copd: {
        message:
          "Air quality could worsen breathing difficulty. Minimize outdoor time and use prescribed bronchodilators proactively.",
        precautions: [
          "Avoid outdoor exertion entirely.",
          "Use bronchodilators as directed by your doctor.",
          "Run air purifiers indoors if available.",
        ],
      },
      heart_disease: {
        message:
          "Moderate air quality can strain the cardiovascular system. Avoid outdoor cardio and stay in well-ventilated areas.",
        precautions: [
          "Avoid outdoor jogging or cycling.",
          "Monitor blood pressure more frequently today.",
          "Stay in air-conditioned or purified environments.",
        ],
      },
      allergies: {
        message:
          "Moderate pollution levels are likely to trigger allergic reactions. Limit outdoor exposure and consider preventive medication.",
        precautions: [
          "Take antihistamines proactively.",
          "Keep doors and windows closed.",
          "Shower after returning from outdoors.",
        ],
      },
    },
  },

  Poor: {
    headline: "Air quality is poor",
    icon: "😷",
    general: {
      message:
        "Air quality is poor. Everyone should reduce outdoor exposure. Sensitive groups must stay indoors.",
      precautions: [
        "Avoid prolonged outdoor activity.",
        "Keep windows and doors closed.",
        "Use air purifiers indoors if available.",
      ],
    },
    conditions: {
      asthma: {
        message:
          "Air quality is poor today. Avoid outdoor activity entirely. Keep your inhaler accessible and watch for worsening symptoms.",
        precautions: [
          "Stay indoors with windows sealed.",
          "Use your rescue inhaler at first sign of tightness.",
          "Run an air purifier in your room.",
          "Consider wearing an N95 mask if you must go outside.",
        ],
      },
      copd: {
        message:
          "Dangerous conditions for COPD patients. Stay indoors, keep oxygen support ready, and contact your doctor if symptoms flare.",
        precautions: [
          "Do not go outdoors under any circumstance.",
          "Keep supplemental oxygen ready.",
          "Use prescribed nebulizer treatments.",
          "Seek medical help if breathlessness worsens.",
        ],
      },
      heart_disease: {
        message:
          "Poor air quality significantly increases cardiac risk. Stay indoors, avoid all exertion, and monitor symptoms closely.",
        precautions: [
          "Avoid all physical exertion.",
          "Monitor blood pressure and heart rate frequently.",
          "Keep emergency cardiac medication accessible.",
          "Call emergency services if chest pain or irregular heartbeat occurs.",
        ],
      },
      allergies: {
        message:
          "High pollutant levels will aggravate allergies severely. Stay indoors with air filtration running.",
        precautions: [
          "Take prescribed allergy medication.",
          "Use HEPA air purifiers.",
          "Avoid opening windows or doors.",
          "Wash face and hands thoroughly if exposed outdoors.",
        ],
      },
    },
  },

  "Very Poor": {
    headline: "Air quality is very poor",
    icon: "🚨",
    general: {
      message:
        "Air quality is very poor. Avoid all outdoor activities. Everyone — including healthy individuals — should stay indoors.",
      precautions: [
        "Stay indoors at all times.",
        "Use air purifiers on maximum setting.",
        "Wear N95 masks if outdoor travel is essential.",
        "Seal windows and doors.",
      ],
    },
    conditions: {
      asthma: {
        message:
          "Very dangerous for asthma patients. Do not go outside. Use preventive medication and keep emergency contacts ready.",
        precautions: [
          "Use preventer inhaler as prescribed — do not skip doses.",
          "Keep rescue inhaler and nebulizer ready.",
          "Seal all windows and run air purifiers.",
          "Have emergency hospital numbers accessible.",
        ],
      },
      copd: {
        message:
          "Extremely hazardous air quality for COPD. Stay indoors with oxygen support. Alert your doctor and family.",
        precautions: [
          "Use continuous oxygen therapy if prescribed.",
          "Do not leave your home.",
          "Notify your pulmonologist of conditions.",
          "Head to the nearest hospital if oxygen levels drop below 90%.",
        ],
      },
      heart_disease: {
        message:
          "Very poor air quality creates severe cardiac risk. Complete indoor rest is essential. Alert your cardiologist.",
        precautions: [
          "Avoid all physical activity.",
          "Keep nitroglycerin / emergency meds at hand.",
          "Use pulse oximeter to monitor oxygen levels.",
          "Seek emergency care at any sign of chest discomfort.",
        ],
      },
      allergies: {
        message:
          "Extreme pollution will trigger severe allergic reactions. Stay indoors with air purification at maximum capacity.",
        precautions: [
          "Double dose antihistamines if doctor-approved.",
          "Use HEPA purifiers in every occupied room.",
          "Keep nasal saline spray for congestion relief.",
          "Avoid cooking fumes or incense — they add to indoor pollution.",
        ],
      },
    },
  },

  Severe: {
    headline: "Health emergency — Severe AQI",
    icon: "⛔",
    general: {
      message:
        "SEVERE air quality. Health emergency for everyone. Stay indoors, seal your home, and avoid any exposure.",
      precautions: [
        "Do not go outdoors for any reason.",
        "Seal all windows, doors, and ventilation gaps.",
        "Run air purifiers at maximum.",
        "Wear N95 masks even indoors if purifier is unavailable.",
        "Seek medical help if breathing difficulty occurs.",
      ],
    },
    conditions: {
      asthma: {
        message:
          "CRITICAL for asthma patients. This air is immediately dangerous. Stay sealed indoors. Use all prescribed medications. Call for medical help if symptoms appear.",
        precautions: [
          "Take all prescribed preventive medication.",
          "Keep nebulizer running and rescue inhaler at arm's reach.",
          "Seal every gap in your room — tape windows if needed.",
          "Do NOT go outside under any circumstance.",
          "Call 108 (ambulance) immediately if an attack begins.",
        ],
      },
      copd: {
        message:
          "LIFE-THREATENING conditions for COPD patients. Remain on oxygen, contact your doctor urgently, and prepare for hospital visit.",
        precautions: [
          "Stay on supplemental oxygen continuously.",
          "Contact your pulmonologist immediately.",
          "Have your hospital bag ready.",
          "Call 108 if SpO2 drops below 88%.",
          "Do not attempt any physical movement beyond essentials.",
        ],
      },
      heart_disease: {
        message:
          "CRITICAL cardiac risk. Severe air pollution can trigger heart attacks and strokes. Absolute rest indoors. Alert your cardiologist now.",
        precautions: [
          "Complete bed rest — no physical activity.",
          "Take all cardiac medications on schedule.",
          "Keep aspirin and nitroglycerin accessible.",
          "Monitor blood pressure every hour.",
          "Call 108 immediately at any sign of chest pain.",
        ],
      },
      allergies: {
        message:
          "Extremely dangerous conditions. Severe air pollution will cause intense allergic reactions. Full indoor shelter required.",
        precautions: [
          "Maximum antihistamine dosage (as prescribed).",
          "Use HEPA purifiers in all rooms.",
          "Wet-mop floors to reduce settled particles.",
          "Seal all windows and doors completely.",
          "Seek medical attention if anaphylactic symptoms appear.",
        ],
      },
    },
  },
};

// ─── Service Function ────────────────────────────────────────────────────────

/**
 * Generates a personalized health advisory based on AQI category
 * and the user's health conditions.
 *
 * @param aqiCategory       The NAQI category name (e.g. "Poor", "Severe")
 * @param healthConditions  Array of user's health conditions from their profile (e.g. ["asthma", "heart_disease"])
 * @returns                 A HealthAdviceResult with headline, message, icon, and precautions
 */
export function getHealthAdvice(
  aqiCategory: string,
  healthConditions: string[]
): HealthAdviceResult {
  const categoryKey = aqiCategory as AQICategoryKey;
  const advice = HEALTH_ADVICE_MAP[categoryKey];

  // Fallback for unknown categories
  if (!advice) {
    return {
      headline: "Air quality data unavailable",
      message:
        "Unable to determine AQI category. Please check back later or verify your location settings.",
      icon: "❓",
      precautions: ["Monitor air quality through official CPCB channels."],
    };
  }

  // If user has no health conditions, return the general advice
  if (!healthConditions || healthConditions.length === 0) {
    return {
      headline: advice.headline,
      message: advice.general.message,
      icon: advice.icon,
      precautions: advice.general.precautions,
    };
  }

  // Find the most relevant condition (prioritize the most severe one)
  // Priority order: copd > heart_disease > asthma > allergies
  const CONDITION_PRIORITY = ["copd", "heart_disease", "asthma", "allergies"];

  const primaryCondition = CONDITION_PRIORITY.find((c) =>
    healthConditions.includes(c)
  );

  if (primaryCondition && advice.conditions[primaryCondition]) {
    const conditionAdvice = advice.conditions[primaryCondition];

    // Merge precautions from multiple conditions if user has more than one
    const allPrecautions = new Set(conditionAdvice.precautions);
    for (const condition of healthConditions) {
      if (condition !== primaryCondition && advice.conditions[condition]) {
        advice.conditions[condition].precautions.forEach((p) =>
          allPrecautions.add(p)
        );
      }
    }

    return {
      headline: advice.headline,
      message: conditionAdvice.message,
      icon: advice.icon,
      precautions: Array.from(allPrecautions),
    };
  }

  // Fallback to general advice if conditions don't match our database
  return {
    headline: advice.headline,
    message: advice.general.message,
    icon: advice.icon,
    precautions: advice.general.precautions,
  };
}
