<VSCode.Cell language="markdown">
# Interactive Sales Data Generator

This notebook provides an interactive sales data generator with visualization, analysis, and export capabilities. You can use it to:
- Generate realistic sales data with seasonality, trends, and noise
- Visualize the data with interactive filters and overlays
- Analyze trends and year-over-year changes
- Export data as CSV or charts as PNG

## Quick Start
1. Run all cells in order (everything is reactive)
2. Use the parameter controls to adjust the generator
3. Use the visualization controls to explore the data
4. Export results as needed

## Requirements
- Observable Runtime
- Imports: Plot, html, d3 (automatically imported below)
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Import required libraries
import { Plot } from "@observablehq/plot";
import { html } from "htl";
import * as d3 from "d3";
import seedrandom from "https://cdn.skypack.dev/seedrandom";
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Generator function
function generateMonthlySalesData(opts = {}) {
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
  
  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date');
  }

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
      index: i
    });
  }
  return data;
}
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Predefined patterns
presets = {
  default: { count:24, baseValue:9000, trendPerMonth:2500, seasonalityPeriod:12, seasonalityAmplitude:3600, noiseAmount:800, seed:42 },
  highSeasonality: { count:24, baseValue:10000, trendPerMonth:1000, seasonalityPeriod:12, seasonalityAmplitude:8000, noiseAmount:500, seed:42 },
  strongTrend: { count:24, baseValue:5000, trendPerMonth:4000, seasonalityPeriod:12, seasonalityAmplitude:2000, noiseAmount:500, seed:42 },
  highVolatility: { count:24, baseValue:10000, trendPerMonth:1500, seasonalityPeriod:6, seasonalityAmplitude:4000, noiseAmount:2000, seed:42 },
  stable: { count:24, baseValue:10000, trendPerMonth:500, seasonalityPeriod:12, seasonalityAmplitude:1000, noiseAmount:300, seed:42 },
  quarterly: { count:24, baseValue:8000, trendPerMonth:1000, seasonalityPeriod:3, seasonalityAmplitude:3000, noiseAmount:600, seed:42 }
};
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Parameter controls
viewof params = Inputs.form([
  Inputs.select(Object.keys(presets), { label: "Preset Pattern", value: "default" }),
  Inputs.range([1, 48], { label: "Number of Months", value: 24, step: 1 }),
  Inputs.range([1000, 20000], { label: "Base Value ($)", value: 9000, step: 500 }),
  Inputs.range([-5000, 5000], { label: "Monthly Trend ($)", value: 2500, step: 100 }),
  Inputs.range([3, 24], { label: "Seasonality Period (months)", value: 12, step: 1 }),
  Inputs.range([0, 10000], { label: "Seasonality Amplitude ($)", value: 3600, step: 100 }),
  Inputs.range([0, 2000], { label: "Noise Amount ($)", value: 800, step: 50 }),
  Inputs.number([1, 99999], { label: "Random Seed", value: 42 })
]);
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Generate data with seeded RNG
data = (() => {
  try {
    const rng = seedrandom(String(params.seed));
    const raw = generateMonthlySalesData({ ...params, rng });
    raw.forEach(d => d._date = new Date(d.date));
    return raw;
  } catch (err) {
    console.error('Data generation error:', err);
    return [];
  }
})()
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Visualization controls
viewof vizControls = Inputs.form([
  Inputs.select(['1m', '3m', '6m', '12m', '24m', 'all'], {
    label: 'Time Window',
    value: 'all'
  }),
  Inputs.range([1, 12], {
    label: 'Moving Average (months)',
    value: 3,
    step: 1
  }),
  ...Array.from(new Set(data.map(d => d.category))).map(cat =>
    Inputs.toggle({
      label: cat,
      value: true
    })
  )
]);
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Filtered data and moving averages
{
  // Filter data based on controls
  const selectedCategories = Object.entries(vizControls)
    .filter(([k, v]) => typeof v === 'boolean' && v)
    .map(([k]) => k);

  const timeWindowMonths = vizControls[0] === 'all' ? Infinity : parseInt(vizControls[0]);
  const now = new Date(Math.max(...data.map(d => d._date)));
  const minDate = new Date(now);
  minDate.setMonth(minDate.getMonth() - timeWindowMonths);

  filteredData = data.filter(d => 
    selectedCategories.includes(d.category) &&
    (timeWindowMonths === Infinity || d._date >= minDate)
  );

  // Compute moving averages
  const window = vizControls[1];
  movingAverages = !window || window <= 1 ? [] : 
    selectedCategories.flatMap(category => {
      const points = filteredData
        .filter(d => d.category === category)
        .sort((a, b) => a._date - b._date);
      
      const halfWindow = Math.floor(window / 2);
      return points.map((point, i) => {
        const start = Math.max(0, i - halfWindow);
        const end = Math.min(points.length, i + halfWindow + 1);
        const avg = d3.mean(points.slice(start, end), d => d.sales);
        return avg !== undefined ? {
          date: point.date,
          _date: point._date,
          sales: avg,
          category,
          isMA: true
        } : null;
      }).filter(Boolean);
    });
}
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Interactive Plot
Plot.plot({
  height: 480,
  marginLeft: 70,
  style: {
    background: 'white',
    fontSize: '12px'
  },
  x: {
    label: 'Date',
    tickFormat: d => d.toISOString().slice(0,10),
    grid: true
  },
  y: {
    label: 'Sales ($)',
    grid: true
  },
  marks: [
    Plot.line(filteredData, {
      x: '_date',
      y: 'sales',
      stroke: 'category',
      strokeWidth: 1.5,
      sort: true
    }),
    Plot.dot(filteredData, {
      x: '_date',
      y: 'sales',
      fill: 'category',
      r: 3
    }),
    Plot.line(movingAverages, {
      x: '_date',
      y: 'sales',
      stroke: 'category',
      strokeWidth: 2,
      strokeDasharray: '4,4',
      sort: true
    })
  ],
  color: {
    legend: true,
    scheme: 'tableau10'
  }
})
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Export helpers
function exportToPNG(svgNode, width, height, scale = 2) {
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const svgString = new XMLSerializer().serializeToString(svgNode);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'sales-chart.png';
      a.click();
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
}

function exportToCSV(data) {
  const headers = ['date', 'category', 'sales'];
  const csv = [
    headers.join(','),
    ...data.map(row => [row.date, row.category, row.sales].join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sales_data.csv';
  a.click();
  URL.revokeObjectURL(url);
}
</VSCode.Cell>

<VSCode.Cell language="javascript">
// Export buttons
viewof exportControls = html`<div style="display: flex; gap: 8px; margin: 1em 0;">
  <button onclick=${async () => {
    const plot = document.querySelector('.plot-container svg');
    if (plot) await exportToPNG(plot, 900, 480);
  }}>Export Chart as PNG</button>
  <button onclick=${() => exportToCSV(filteredData)}>Export Data as CSV</button>
</div>`
</VSCode.Cell>

<VSCode.Cell language="markdown">
## Sharing Instructions

### Option 1: Share as Observable Notebook
1. Create a new notebook at https://observablehq.com
2. Copy all cells from this notebook
3. Share the URL with your team

### Option 2: Embed in Your App
1. Use the Observable Runtime to embed:
```html
<div id="generator"></div>
<script type="module">
  import { Runtime, Inspector } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
  import notebook from "YOUR_PUBLISHED_NOTEBOOK_URL";
  
  const runtime = new Runtime();
  const main = runtime.module(notebook, Inspector.into("#generator"));
</script>