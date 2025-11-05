Observable notebook — publish & import helper module

This file documents how to publish and import the sales data generator module into Observable. You can choose between automated setup (recommended) or manual steps.

## Option 1: Automated Setup (Recommended)

Prerequisites:
- [GitHub CLI](https://cli.github.com/) installed and authenticated
- PowerShell 5.1 or later

Steps:
1. Run the setup script from the project root:
```powershell
.\scripts\setup-observable.ps1
```

The script will:
- Create a public Gist with the module code
- Generate a customized Observable notebook JSON
- Print the import URL and next steps

## Option 2: Manual Setup

### A. Create the Gist

1. Open https://gist.github.com and sign in
2. Click "New gist"
3. Settings:
   - Filename: `notebook_cells.module.js`
   - Description: "Observable helper module: generateMonthlySalesData, presets, CSV/PNG helpers"
   - Content: Copy from `GIST_PAYLOAD/notebook_cells.module.js`
   - Visibility: Public
4. Click "Create public gist"
5. Click "Raw" and copy the URL (format: `https://gist.githubusercontent.com/<username>/<id>/raw/notebook_cells.module.js`)

### B. Import the Notebook

Method 1 — Import prepared notebook:
1. Open `NOTEBOOK_EXPORT/sales-data-notebook.json`
2. Replace `<your-username>` and `<gist-id>` with your values
3. Go to https://observablehq.com
4. Click "+ New" → "Import notebook"
5. Select your edited JSON file

Method 2 — Create from scratch:
1. Go to https://observablehq.com
2. Click "+ New" → "Blank notebook"
3. Add cells:
   ```js
   // Import Plot & module
   import Plot from "@observablehq/plot"
   import { generateMonthlySalesData, presets } from "YOUR_GIST_RAW_URL"

   // Generate data
   const data = generateMonthlySalesData({ ...presets.default, seed: 42 })

   // Create chart
   Plot.plot({
     marks: [
       Plot.line(data, { x: "date", y: "sales", stroke: "category" })
     ]
   })
   ```

## Alternative: Use jsDelivr (for repo files)

If you've committed `services/notebook_cells.module.js` to this repo, you can import directly:

```js
import { generateMonthlySalesData } from "https://cdn.jsdelivr.net/gh/DaveManning/observable-data-generator@main/services/notebook_cells.module.js"
```

Replace `main` with a commit SHA for reproducibility.

## Features included in the prepared notebook

The notebook JSON export (`NOTEBOOK_EXPORT/sales-data-notebook.json`) includes:
- Interactive controls (pattern presets, random seed)
- Time series visualization with Plot
- Category-colored lines and points
- Trend analysis with statistics
- PNG/CSV export buttons
- Usage documentation

## Tips & Best Practices

1. Version control:
   - Pin imports to specific Gist revisions or commit SHAs
   - Save notebook versions when making significant changes

2. Performance:
   - Generate smaller datasets while prototyping
   - Use the seeded RNG for reproducibility

3. Sharing:
   - Share the notebook URL after publishing
   - Include the Gist URL in notebook documentation
   - Consider forking for team modifications