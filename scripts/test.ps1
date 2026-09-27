Write-Host "[TEST] Running RiskShield AI Enterprise Test Suite (Windows)..." -ForegroundColor Cyan

# 1. Backend Pytest
Write-Host "[TEST] Executing Backend Pytest..." -ForegroundColor Yellow
Set-Location backend
& .\.venv\Scripts\pytest.exe -o pythonpath=. tests -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Backend tests failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# 2. Frontend Checks
Write-Host "[TEST] Executing Frontend Lint..." -ForegroundColor Yellow
Set-Location frontend
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Frontend lint failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# 3. Documentation Image Verification
Write-Host "[TEST] Verifying Documentation Images..." -ForegroundColor Yellow
node scripts/verify_readme_images.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Documentation images check failed!" -ForegroundColor Red
    exit 1
}

# 4. Documentation Cross-Link Verification
Write-Host "[TEST] Verifying Documentation Cross-Links..." -ForegroundColor Yellow
node scripts/verify_all_docs.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Documentation cross-links check failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[SUCCESS] ALL TESTS AND CHECKS PASSED WITH ZERO ERRORS!" -ForegroundColor Green
