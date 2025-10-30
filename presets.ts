import { type DataConfig } from './types';
import { DEFAULT_CONFIG } from './constants';

export interface Preset {
  name: string;
  config: DataConfig;
}

export const presets: Preset[] = [
  {
    name: 'Default: Trend + Seasonality',
    config: DEFAULT_CONFIG,
  },
  {
    name: 'Simple Linear Growth',
    config: {
      ...DEFAULT_CONFIG,
      numPoints: 50,
      dateField: 'timestamp',
      metricField: 'users',
      baseValue: 500,
      trend: 10,
      enableSeasonality: false,
      noise: 5,
      enableCategorical: false,
      functionName: 'generateLinearGrowthData',
    },
  },
  {
    name: 'Noisy Stock Data',
    config: {
      ...DEFAULT_CONFIG,
      numPoints: 200,
      metricField: 'price',
      startDate: '2023-01-01',
      baseValue: 150,
      trend: 0.5,
      enableSeasonality: false,
      noise: 25,
      enableCategorical: false,
      functionName: 'generateStockPriceData',
    },
  },
  {
    name: 'Monthly Sales (Seasonal)',
    config: {
      ...DEFAULT_CONFIG,
      numPoints: 24,
      metricField: 'sales',
      startDate: '2022-01-01',
      dateIncrement: 'month',
      baseValue: 50000,
      trend: 2500,
      enableSeasonality: true,
      seasonalityPeriod: 12,
      seasonalityAmplitude: 15000,
      noise: 5000,
      enableCategorical: true,
      categories: 'Widgets, Gadgets, Doodads',
      functionName: 'generateMonthlySalesData',
    },
  },
  {
    name: 'Categorical Event Mix',
    config: {
      ...DEFAULT_CONFIG,
      numPoints: 300,
      metricField: 'duration_ms',
      categoryField: 'event_type',
      baseValue: 100,
      trend: 0,
      enableSeasonality: false,
      noise: 20,
      enableCategorical: true,
      categories: 'page_view, click, form_submit, purchase',
      functionName: 'generateEventData',
    },
  }
];
