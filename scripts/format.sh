#!/usr/bin/env bash
set -e

echo "🎨 Formatting RiskShield AI Codebase..."

cd frontend
npm run format || true
cd ..

echo "✅ Codebase formatting complete!"
