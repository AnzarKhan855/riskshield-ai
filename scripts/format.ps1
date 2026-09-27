Write-Host "[FORMAT] Formatting RiskShield AI Codebase (Windows)..." -ForegroundColor Cyan

Set-Location frontend
npm run format
Set-Location ..

Write-Host "[SUCCESS] Codebase formatting complete!" -ForegroundColor Green
