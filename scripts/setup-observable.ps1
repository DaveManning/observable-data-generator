# PowerShell script to create Gist and set up Observable notebook
# Requires: GitHub CLI (gh) installed and authenticated

param(
    [string]$GistDescription = "Observable helper module: generateMonthlySalesData, presets, CSV/PNG helpers"
)

$ErrorActionPreference = "Stop"

function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Verify prerequisites
if (-not (Test-Command "gh")) {
    Write-Error @"
GitHub CLI (gh) is not installed. Please:
1. Install from https://cli.github.com
2. Run 'gh auth login' to authenticate
3. Try this script again
"@
    exit 1
}

# Check if gh is authenticated
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error @"
GitHub CLI is not authenticated. Please:
1. Run 'gh auth login'
2. Follow the prompts to log in
3. Try this script again
"@
    exit 1
}

# Verify required files exist
$moduleFile = "GIST_PAYLOAD/notebook_cells.module.js"
$templateFile = "NOTEBOOK_EXPORT/sales-data-notebook.json"

if (-not (Test-Path $moduleFile)) {
    Write-Error "Module file not found: $moduleFile"
    exit 1
}
if (-not (Test-Path $templateFile)) {
    Write-Error "Notebook template not found: $templateFile"
    exit 1
}

# Ensure output directory exists
$outputDir = "NOTEBOOK_EXPORT"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

Write-Host "Creating Gist from module..." -ForegroundColor Cyan

# Create Gist and capture the response
$gistResponse = gh gist create GIST_PAYLOAD/notebook_cells.module.js --public --desc $GistDescription | Out-String

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create Gist. Ensure GitHub CLI is installed and you're authenticated."
    exit 1
}

# Extract Gist ID from the response URL
$gistUrl = $gistResponse.Trim()
$gistId = $gistUrl -replace "https://gist.github.com/[^/]+/", ""
$gistUsername = (gh api user -q .login)

if ([string]::IsNullOrEmpty($gistId)) {
    Write-Error "Could not extract Gist ID from response: $gistResponse"
    exit 1
}

Write-Host "Gist created successfully!" -ForegroundColor Green
Write-Host "Gist URL: $gistUrl"

# Generate the raw URL for the module
$rawUrl = "https://gist.githubusercontent.com/$gistUsername/$gistId/raw/notebook_cells.module.js"

Write-Host "`nUpdating notebook with Gist URL..." -ForegroundColor Cyan

# Read the notebook template
$notebookContent = Get-Content -Raw NOTEBOOK_EXPORT/sales-data-notebook.json

# Replace placeholder with actual values
$notebookContent = $notebookContent -replace '<your-username>', $gistUsername
$notebookContent = $notebookContent -replace '<gist-id>', $gistId

# Save the updated notebook
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputPath = "NOTEBOOK_EXPORT/sales-data-notebook-$timestamp.json"
$notebookContent | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host "Done! Next steps:" -ForegroundColor Green
Write-Host "1. Import $outputPath into Observable:" -ForegroundColor Yellow
Write-Host "   - Go to https://observablehq.com" -ForegroundColor Gray
Write-Host "   - Click '+ New' → 'Import notebook'" -ForegroundColor Gray
Write-Host "   - Select the generated file: $outputPath" -ForegroundColor Gray
Write-Host "`nRaw module URL (for manual imports):" -ForegroundColor Yellow
Write-Host $rawUrl -ForegroundColor Gray