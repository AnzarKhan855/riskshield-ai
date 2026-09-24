#!/usr/bin/env bash
set -e

echo "🚀 Bootstrapping RiskShield AI Enterprise Development Environment..."

# 1. Backend Setup
echo "📦 Setting up Python Backend..."
cd backend
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
if [ ! -f ".env" ]; then
  cp .env.example .env
fi
cd ..

# 2. Frontend Setup
echo "⚛️ Setting up Next.js Frontend..."
cd frontend
npm install
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
fi
cd ..

echo "✅ RiskShield AI Development Environment Ready!"
echo "   Run 'make run-backend' to launch FastAPI on :8000"
echo "   Run 'make run-frontend' to launch Next.js on :3000"
