/**
 * notebook_cells.js — A plain JavaScript module extracted from the prototype notebook
 *
 * This file contains the generator, presets, and helper utilities in valid JS
 * form so it can be required/imported by teammates or used as a reference when
 * building an Observable notebook.
 *
 * Note: Browser-only helpers (exportSvgToPng, exportDataAsCsvDownload) require
 * a DOM. If you run tests in Node, avoid calling those functions or mock the
 * DOM.
 */

import seedrandom from "seedrandom";
import * as d3 from "d3";

export function generateMonthlySalesData(opts = {}) {
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

export const presets = {
  default: { count:24, baseValue:9000, trendPerMonth:2500, seasonalityPeriod:12, seasonalityAmplitude:3600, noiseAmount:800, seed:42 },
  highSeasonality: { count:24, baseValue:10000, trendPerMonth:1000, seasonalityPeriod:12, seasonalityAmplitude:8000, noiseAmount:500, seed:42 },
  strongTrend: { count:24, baseValue:5000, trendPerMonth:4000, seasonalityPeriod:12, seasonalityAmplitude:2000, noiseAmount:500, seed:42 },
  highVolatility: { count:24, baseValue:10000, trendPerMonth:1500, seasonalityPeriod:6, seasonalityAmplitude:4000, noiseAmount:2000, seed:42 },
  stable: { count:24, baseValue:10000, trendPerMonth:500, seasonalityPeriod:12, seasonalityAmplitude:1000, noiseAmount:300, seed:42 },
  quarterly: { count:24, baseValue:8000, trendPerMonth:1000, seasonalityPeriod:3, seasonalityAmplitude:3000, noiseAmount:600, seed:42 }
};

export function seededRng(seed) {
  const rng = seedrandom(String(seed));
  return () => rng();
}

export function dataToCSV(data) {
  const headers = ['date','category','sales'];
  return [headers.join(','), ...data.map(r => [r.date, r.category, r.sales].join(','))].join('\n');
}

export async function exportSvgToPng(svgNode, width = 900, height = 480, scale = 2) {
  if (typeof document === 'undefined') throw new Error('exportSvgToPng requires a browser environment');
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
  if (typeof document === 'undefined') throw new Error('exportDataAsCsvDownload requires a browser environment');
  const csv = dataToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function analyzeTrends(data) {
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
