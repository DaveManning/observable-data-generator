/**
 * @fileoverview Monthly sales data generator and analysis module for Observable notebooks.
 * 
 * This module provides utilities for generating synthetic sales data with configurable
 * patterns (trend, seasonality, noise) and analyzing the results. It's designed for
 * use in Observable notebooks but can work in any modern JavaScript environment.
 * 
 * The module uses CDN imports for dependencies so it can be imported directly from
 * a Gist or jsDelivr URL without local installation.
 * 
 * @example
 * ```js
 * import { generateMonthlySalesData, presets } from "https://gist.githubusercontent.com/<user>/<id>/raw/notebook_cells.module.js";
 * 
 * // Generate 24 months of data with default settings
 * const data = generateMonthlySalesData(presets.default);
 * 
 * // Analyze trends
 * const trends = analyzeTrends(data);
 * ```
 */

import seedrandom from "seedrandom";
import * as d3 from "d3";

/**
 * Validates the options object for generateMonthlySalesData.
 * @private
 * @param {Object} opts - The options to validate
 * @param {number} [opts.count=24] - Number of months to generate (1-120)
 * @param {string|Date} [opts.startDate='2024-01-01'] - Start date for the series
 * @param {number} [opts.baseValue=9000] - Base sales value (0-1,000,000)
 * @param {number} [opts.trendPerMonth=2500] - Monthly trend (-100,000 to 100,000)
 * @param {number} [opts.seasonalityAmplitude=3600] - Seasonal variation (0-100,000)
 * @param {number} [opts.seasonalityPeriod=12] - Months per season (1-24)
 * @param {number} [opts.noiseAmount=800] - Random noise amount (0-100,000)
 * @param {string[]} [opts.categories] - Product categories
 * @param {function} [opts.rng] - Custom random number generator
 * @returns {string[]} Array of validation errors, empty if valid
 */
function validateOptions(opts) {
  const errors = [];
  
  // Count validation
  if (typeof opts.count !== 'undefined') {
    if (!Number.isInteger(opts.count)) errors.push('count must be an integer');
    if (opts.count < 0) errors.push('count must be non-negative');
    if (opts.count > 120) errors.push('count must be ≤ 120 months (10 years)');
  }

  // Date validation
  if (typeof opts.startDate !== 'undefined') {
    const date = new Date(opts.startDate);
    if (isNaN(date.getTime())) errors.push('startDate must be a valid date string or Date object');
    if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
      errors.push('startDate year must be between 1900 and 2100');
    }
  }

  // Numeric bounds validation
  const numericBounds = {
    baseValue: { min: 0, max: 1e6, desc: 'base sales value' },
    trendPerMonth: { min: -1e5, max: 1e5, desc: 'monthly trend' },
    seasonalityAmplitude: { min: 0, max: 1e5, desc: 'seasonality amplitude' },
    seasonalityPeriod: { min: 1, max: 24, desc: 'seasonality period (months)' },
    noiseAmount: { min: 0, max: 1e5, desc: 'noise amount' }
  };

  Object.entries(numericBounds).forEach(([key, { min, max, desc }]) => {
    if (typeof opts[key] !== 'undefined') {
      const val = opts[key];
      if (typeof val !== 'number' || isNaN(val)) {
        errors.push(`${key} must be a number`);
      } else if (val < min || val > max) {
        errors.push(`${key} must be between ${min} and ${max} (${desc})`);
      }
    }
  });

  // Categories validation
  if (typeof opts.categories !== 'undefined') {
    if (!Array.isArray(opts.categories)) {
      errors.push('categories must be an array');
    } else {
      if (opts.categories.length === 0) errors.push('categories array cannot be empty');
      if (opts.categories.some(c => typeof c !== 'string')) {
        errors.push('all category names must be strings');
      }
      if (new Set(opts.categories).size !== opts.categories.length) {
        errors.push('category names must be unique');
      }
    }
  }

  // RNG validation
  if (typeof opts.rng !== 'undefined' && typeof opts.rng !== 'function') {
    errors.push('rng must be a function');
  }

  return errors;
}

/**
 * Generates synthetic monthly sales data with configurable patterns.
 * 
 * Creates a time series of monthly sales data with the following components:
 * - Base value: Starting point for all sales
 * - Trend: Linear increase/decrease per month
 * - Seasonality: Sinusoidal pattern with configurable period
 * - Noise: Random variation using provided or seeded RNG
 * 
 * @param {Object} [opts={}] - Configuration options
 * @param {number} [opts.count=24] - Number of months to generate (1-120)
 * @param {string|Date} [opts.startDate='2024-01-01'] - Start date for the series
 * @param {number} [opts.baseValue=9000] - Base sales value (0-1,000,000)
 * @param {number} [opts.trendPerMonth=2500] - Monthly trend (-100,000 to 100,000)
 * @param {number} [opts.seasonalityAmplitude=3600] - Seasonal variation (0-100,000)
 * @param {number} [opts.seasonalityPeriod=12] - Months per season (1-24)
 * @param {number} [opts.noiseAmount=800] - Random noise amount (0-100,000)
 * @param {string[]} [opts.categories=['fixtures','furniture','appliances']] - Product categories
 * @param {function} [opts.rng=Math.random] - Custom random number generator
 * @returns {Array<{date: string, sales: number, category: string, index: number}>} Generated data
 * @throws {Error} If any options are invalid
 * 
 * @example
 * ```js
 * // Generate 2 years of data with high seasonality
 * const data = generateMonthlySalesData({
 *   count: 24,
 *   seasonalityAmplitude: 8000,
 *   categories: ['widgets', 'gadgets']
 * });
 * ```
 */
export function generateMonthlySalesData(opts = {}) {
  // Validate all options before starting
  const errors = validateOptions(opts);
  if (errors.length > 0) {
    throw new Error('Invalid options:\n- ' + errors.join('\n- '));
  }

  const {
    count = 24,
    startDate = '2024-01-01T00:00:00Z',
    baseValue = 9000,
    trendPerMonth = 2500,
    seasonalityAmplitude = 3600,
    seasonalityPeriod = 12,
    noiseAmount = 800,
    categories = ['fixtures', 'furniture', 'appliances'],
    rng = Math.random,
  } = opts;

  const numPoints = Math.max(0, Math.trunc(count || 0));
  const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
  if (isNaN(start.getTime())) throw new Error('Invalid start date');

  const data = [];
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
      index: i,
      _date: new Date(currentDate)
    });
  }
  return data;
}

/**
 * Predefined parameter sets for common data patterns.
 * Each preset generates 24 months of data with different characteristics.
 * 
 * @constant {Object}
 * @property {Object} default - Balanced mix of trend and seasonality
 * @property {Object} highSeasonality - Strong seasonal pattern
 * @property {Object} strongTrend - Dominant upward trend
 * @property {Object} highVolatility - More noise and shorter seasons
 * @property {Object} stable - Minimal trend and seasonality
 * @property {Object} quarterly - Three-month seasonal cycle
 */
export const presets = {
  default: { count:24, baseValue:9000, trendPerMonth:2500, seasonalityPeriod:12, seasonalityAmplitude:3600, noiseAmount:800, seed:42 },
  highSeasonality: { count:24, baseValue:10000, trendPerMonth:1000, seasonalityPeriod:12, seasonalityAmplitude:8000, noiseAmount:500, seed:42 },
  strongTrend: { count:24, baseValue:5000, trendPerMonth:4000, seasonalityPeriod:12, seasonalityAmplitude:2000, noiseAmount:500, seed:42 },
  highVolatility: { count:24, baseValue:10000, trendPerMonth:1500, seasonalityPeriod:6, seasonalityAmplitude:4000, noiseAmount:2000, seed:42 },
  stable: { count:24, baseValue:10000, trendPerMonth:500, seasonalityPeriod:12, seasonalityAmplitude:1000, noiseAmount:300, seed:42 },
  quarterly: { count:24, baseValue:8000, trendPerMonth:1000, seasonalityPeriod:3, seasonalityAmplitude:3000, noiseAmount:600, seed:42 }
};

/**
 * Creates a deterministic random number generator using the provided seed.
 * Uses the seedrandom library for consistent results across runs.
 * 
 * @param {number|string} seed - Seed value for the RNG
 * @returns {function} A function that returns random numbers in [0,1)
 * @example
 * ```js
 * const rng = seededRng(42);
 * const data = generateMonthlySalesData({ rng });
 * ```
 */
export function seededRng(seed) {
  const r = seedrandom(String(seed));
  return () => r();
}

/**
 * Validates a data array for CSV export or trend analysis.
 * @private
 * @param {Array<Object>} data - Array of data records
 * @param {string} data[].date - Date in YYYY-MM-DD format
 * @param {string} data[].category - Category name
 * @param {number} data[].sales - Sales value
 * @throws {Error} If data is invalid
 */
function validateData(data) {
  if (!Array.isArray(data)) throw new Error('data must be an array');
  if (data.length === 0) throw new Error('data array cannot be empty');
  
  const required = ['date', 'category', 'sales'];
  data.forEach((row, i) => {
    required.forEach(field => {
      if (!(field in row)) {
        throw new Error(`Missing required field '${field}' at row ${i}`);
      }
    });
    if (typeof row.sales !== 'number' || isNaN(row.sales)) {
      throw new Error(`Invalid sales value at row ${i}: ${row.sales}`);
    }
    if (!row.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error(`Invalid date format at row ${i}: ${row.date}`);
    }
  });
}

export function dataToCSV(data) {
  validateData(data);
  const headers = ['date','category','sales'];
  return [headers.join(','), ...data.map(r => [r.date, r.category, r.sales].join(','))].join('\n');
}

/**
 * Checks if code is running in a browser environment.
 * @private
 * @param {string} functionName - Name of the function requiring browser APIs
 * @throws {Error} If window or document is not available
 */
function requireBrowser(functionName) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error(`${functionName} requires a browser environment (window and document objects)`);
  }
}

/**
 * Exports an SVG element as a PNG file with download prompt.
 * 
 * @param {SVGElement} svgNode - The SVG element to export
 * @param {number} [width=900] - Output width in pixels
 * @param {number} [height=480] - Output height in pixels
 * @param {number} [scale=2] - Scale factor for higher resolution
 * @returns {Promise<void>} Resolves when download starts
 * @throws {Error} If not in browser or invalid parameters
 * 
 * @example
 * ```js
 * const svg = chart.querySelector('svg');
 * await exportSvgToPng(svg, 1200, 600);
 * ```
 */
export async function exportSvgToPng(svgNode, width = 900, height = 480, scale = 2) {
  requireBrowser('exportSvgToPng');
  
  // Validate inputs
  if (!(svgNode instanceof SVGElement)) {
    throw new Error('svgNode must be an SVG element');
  }
  if (!Number.isFinite(width) || width <= 0) throw new Error('width must be a positive number');
  if (!Number.isFinite(height) || height <= 0) throw new Error('height must be a positive number');
  if (!Number.isFinite(scale) || scale <= 0) throw new Error('scale must be a positive number');
  
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const svgString = new XMLSerializer().serializeToString(svgNode);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(url);
  const pngUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = pngUrl;
  a.download = 'sales-chart.png';
  a.click();
}

export function exportDataAsCsvDownload(data, filename = 'sales_data.csv') {
  requireBrowser('exportDataAsCsvDownload');
  
  // Validate inputs
  validateData(data);
  if (typeof filename !== 'string' || !filename.trim()) {
    throw new Error('filename must be a non-empty string');
  }
  if (!filename.endsWith('.csv')) filename += '.csv';
  
  const csv = dataToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Analyzes sales trends by category using simple linear regression.
 * 
 * For each category, calculates:
 * - slope: average change in sales per month
 * - intercept: estimated baseline sales
 * - R²: goodness of fit (0-1, higher is better)
 * 
 * @param {Array<Object>} data - Array of data records
 * @param {string} data[].date - Date in YYYY-MM-DD format
 * @param {string} data[].category - Category name
 * @param {number} data[].sales - Sales value
 * @returns {Object.<string, {slope: number, intercept: number, r2: number}>} Results by category
 * @throws {Error} If data is invalid or insufficient
 * 
 * @example
 * ```js
 * const trends = analyzeTrends(data);
 * // { 
 * //   fixtures: { slope: 250, intercept: 9000, r2: 0.85 },
 * //   furniture: { slope: 180, intercept: 8500, r2: 0.72 }
 * // }
 * ```
 */
export function analyzeTrends(data) {
  // Validate input data
  validateData(data);
  if (data.length < 2) {
    throw new Error('Need at least 2 data points for trend analysis');
  }
  
  const byCategory = d3.group(data, d => d.category);
  const res = {};
  for (const [cat, points] of byCategory) {
    const sorted = points.slice().sort((a,b) => a._date - b._date);
    if (sorted.length < 2) { res[cat] = null; continue; }
    const x = sorted.map((_, i) => i);
    const y = sorted.map(d => d.sales);
    const n = x.length;
    const sx = d3.sum(x);
    const sy = d3.sum(y);
    const sxy = d3.sum(x.map((xi,i) => xi * y[i]));
    const sx2 = d3.sum(x.map(xi => xi * xi));
    const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const intercept = (sy - slope * sx) / n;
    const predicted = x.map(xi => slope * xi + intercept);
    const ssRes = d3.sum(y.map((yi,i) => (yi - predicted[i])**2));
    const ssTot = d3.sum(y.map(yi => (yi - d3.mean(y))**2));
    const r2 = 1 - ssRes / ssTot;
    res[cat] = { slope, intercept, r2 };
  }
  return res;
}
