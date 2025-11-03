// Generator parameter types
interface GeneratorParams {
  count: number;
  baseValue: number;
  trendPerMonth: number;
  seasonalityPeriod: number;
  seasonalityAmplitude: number;
  noiseAmount: number;
  seed: number;
}

export const presetPatterns: Record<string, GeneratorParams> = {
  default: {
    count: 24,
    baseValue: 9000,
    trendPerMonth: 2500,
    seasonalityPeriod: 12,
    seasonalityAmplitude: 3600,
    noiseAmount: 800,
    seed: 42
  },
  highSeasonality: {
    count: 24,
    baseValue: 10000,
    trendPerMonth: 1000,
    seasonalityPeriod: 12,
    seasonalityAmplitude: 8000, // Strong seasonal pattern
    noiseAmount: 500,
    seed: 42
  },
  strongTrend: {
    count: 24,
    baseValue: 5000,
    trendPerMonth: 4000, // Strong upward trend
    seasonalityPeriod: 12,
    seasonalityAmplitude: 2000,
    noiseAmount: 500,
    seed: 42
  },
  highVolatility: {
    count: 24,
    baseValue: 10000,
    trendPerMonth: 1500,
    seasonalityPeriod: 6, // Shorter cycles
    seasonalityAmplitude: 4000,
    noiseAmount: 2000, // High noise
    seed: 42
  },
  stable: {
    count: 24,
    baseValue: 10000,
    trendPerMonth: 500, // Minimal trend
    seasonalityPeriod: 12,
    seasonalityAmplitude: 1000, // Mild seasonality
    noiseAmount: 300, // Low noise
    seed: 42
  },
  quarterly: {
    count: 24,
    baseValue: 8000,
    trendPerMonth: 1000,
    seasonalityPeriod: 3, // Quarterly cycles
    seasonalityAmplitude: 3000,
    noiseAmount: 600,
    seed: 42
  }
};