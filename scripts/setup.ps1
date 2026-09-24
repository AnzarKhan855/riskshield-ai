Write-Host "[SETUP] Bootstrapping RiskShield AI Enterprise Development Environment (Windows)..." -ForegroundColor Cyan

# 1. Backend Setup
Write-Host "[SETUP] Setting up Python Backend..." -ForegroundColor Yellow
Set-Location backend
if (-Not (Test-Path ".venv")) {
    python -m venv .venv
}
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\pip.exe install -r requirements.txt
if (-Not (Test-Path ".env")) {
    Copy-Item .env.example .env -ErrorAction SilentlyContinue
}
Set-Location ..

# 2. Frontend Setup
Write-Host "[SETUP] Setting up Next.js Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
if (-Not (Test-Path ".env.local")) {
    Set-Content -Path ".env.local" -Value "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1"
}
Set-Location ..

Write-Host "[SUCCESS] RiskShield AI Development Environment Ready!" -ForegroundColor Green
Write-Host "   Run backend: cd backend; .\.venv\Scripts\uvicorn.exe main:app --reload --port 8000"
Write-Host "   Run frontend: cd frontend; npm run dev"
