<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Observable Sales Data Generator

A toolkit for generating and analyzing synthetic monthly sales data in Observable notebooks. Create realistic time series with configurable trends, seasonality, and noise patterns.

## Features

- 🎯 **Data Generation**: Create monthly sales data with control over:
  - Base values and trends
  - Seasonal patterns
  - Random variation
  - Product categories
- 📊 **Visualization**: Ready-to-use with Observable Plot
- 📈 **Analysis**: Built-in trend analysis and statistics
- 💾 **Export**: Save as PNG (charts) or CSV (data)
- 🎲 **Reproducibility**: Seeded random number generation
- 🔄 **Presets**: Common patterns ready to use

## Quick Start

1. Create a new Observable notebook
2. Import the module from your published Gist:

```js
import Plot from "@observablehq/plot"
import { generateMonthlySalesData, presets } from "YOUR_GIST_URL"

// Generate two years of data
const data = generateMonthlySalesData(presets.default)

// Create a simple line chart
Plot.plot({
  marks: [
    Plot.line(data, { 
      x: "date", 
      y: "sales",
      stroke: "category" 
    })
  ]
})
```

## Publishing the Module

See [README_NOTEBOOK.md](README_NOTEBOOK.md) for detailed instructions on:
- Creating a Gist (manual or automated)
- Importing into Observable
- Using jsDelivr for repo-hosted files

## API Reference

### generateMonthlySalesData(options?)

Generates synthetic sales data with configurable patterns.

```js
const data = generateMonthlySalesData({
  count: 24,               // Number of months (1-120)
  startDate: '2024-01',    // Start date
  baseValue: 9000,         // Base sales (0-1M)
  trendPerMonth: 2500,     // Monthly trend (-100k to 100k)
  seasonalityAmplitude: 3600, // Seasonal range (0-100k)
  seasonalityPeriod: 12,   // Months per cycle (1-24)
  noiseAmount: 800,        // Random variation (0-100k)
  categories: ['widgets'], // Product categories
  rng: Math.random        // Random number generator
})
```

### Presets

Built-in parameter sets for common patterns:

```js
const patterns = {
  default: { /* balanced mix */ },
  highSeasonality: { /* strong seasons */ },
  strongTrend: { /* clear growth */ },
  highVolatility: { /* more noise */ },
  stable: { /* minimal change */ },
  quarterly: { /* 3-month cycle */ }
}
```

### Utility Functions

- **seededRng(seed)**: Create deterministic RNG
- **dataToCSV(data)**: Convert to CSV string
- **exportSvgToPng(svg, width?, height?, scale?)**: Save chart as PNG
- **exportDataAsCsvDownload(data, filename?)**: Download as CSV
- **analyzeTrends(data)**: Calculate statistics by category

## Example Notebook

A complete Observable notebook with interactive controls is included:
- Pattern preset selector
- Random seed input
- Chart with category colors
- Trend analysis display
- Export buttons (PNG/CSV)

To use it:
1. Run the setup script:
   ```powershell
   .\scripts\setup-observable.ps1
   ```
2. Follow the prompts to import the generated JSON

## Development

### Prerequisites

- Node.js
- npm
- GitHub CLI (for automated publishing)

### Installation

```bash
npm install
```

### Project Structure

```
├── services/
│   ├── notebook_cells.module.js   # Main module
│   └── ...
├── components/                    # React components
├── scripts/
│   └── setup-observable.ps1       # Publishing helper
├── NOTEBOOK_EXPORT/              # Observable exports
└── GIST_PAYLOAD/                # Ready-to-paste content
```

### Safety Features

The module includes comprehensive validation:
- Input parameter bounds checking
- Data structure validation
- Browser environment detection
- Error messages with context
- Safe defaults for all options

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details
