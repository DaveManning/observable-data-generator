
import { type DataConfig } from './types';

export const DEFAULT_CONFIG: DataConfig = {
  numPoints: 100,
  dateField: 'date',
  metricField: 'value',
  categoryField: 'category',
  startDate: '2023-01-01',
  dateIncrement: 'day',
  baseValue: 1000,
  trend: 5,
  enableSeasonality: true,
  seasonalityPeriod: 7,
  seasonalityAmplitude: 200,
  noise: 50,
  enableCategorical: true,
  categories: 'Alpha, Bravo, Charlie',
  functionName: 'generateSampleData',
};
   