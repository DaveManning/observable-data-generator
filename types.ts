
export interface DataConfig {
  numPoints: number;
  dateField: string;
  metricField: string;
  categoryField: string;
  startDate: string;
  dateIncrement: 'day' | 'week' | 'month' | 'year';
  baseValue: number;
  trend: number;
  enableSeasonality: boolean;
  seasonalityPeriod: number;
  seasonalityAmplitude: number;
  noise: number;
  enableCategorical: boolean;
  categories: string;
  functionName: string;
}
   