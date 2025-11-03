import { generateMonthlySalesData } from './services/generateMonthlySalesData';
import { SalesDataExample } from './components/SalesDataExample';

const data = generateMonthlySalesData({
  count: 12,
  seasonalityPeriod: 12, // change to 12 for yearly seasonality
  rng: () => 0.42, // simple deterministic RNG for testing; replace with a seeded PRNG for better control
});

console.log(data.slice(0, 3));

export type GeneratedRecord = {
  date: string; // YYYY-MM-DD
  sales: number; // rounded integer, >= 0
  category: string;
};

export interface GenerateOptions {
  count?: number;
  startDate?: string | Date;
  baseValue?: number;
  trendPerMonth?: number;
  seasonalityAmplitude?: number;
  seasonalityPeriod?: number;
  noiseAmount?: number;
  categories?: string[];
  rng?: () => number; // returns number in [0,1)
}

/**
 * Generate monthly sales data.
 *
 * Options mirror the original implementation but are all optional and typed.
 */
export function generateMonthlySalesData(options: GenerateOptions = {}): GeneratedRecord[] {
  const {
    count = 24,
    startDate = '2024-01-01T00:00:00Z',
    baseValue = 9000,
    trendPerMonth = 2500,
    seasonalityAmplitude = 3600,
    seasonalityPeriod = 12, // months per cycle (12 = yearly seasonality)
    noiseAmount = 800,
    categories = ['fixtures', 'furniture', 'appliances'],
    rng = Math.random,
  } = options;

  const numPoints = Math.max(0, Math.trunc(count ?? 0));
  const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);

  const data: GeneratedRecord[] = [];

  for (let i = 0; i < numPoints; i++) {
    const currentDate = new Date(start);
    currentDate.setUTCMonth(currentDate.getUTCMonth() + i);

    const trendValue = trendPerMonth * i;
    const seasonalityValue = seasonalityAmplitude * Math.sin((2 * Math.PI * i) / seasonalityPeriod);
    const noiseValue = (rng() - 0.5) * 2 * noiseAmount;

    const sales = baseValue + trendValue + seasonalityValue + noiseValue;
    const category = categories[Math.floor(rng() * categories.length)];

    data.push({
      date: currentDate.toISOString().slice(0, 10),
      sales: Math.max(0, Math.round(sales)),
      category,
    });
  }

  return data;
}