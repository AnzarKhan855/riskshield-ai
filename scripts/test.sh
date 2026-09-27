#!/usr/bin/env bash
set -e

echo "🧪 Running RiskShield AI Enterprise Test Suite..."

# 1. Backend Pytest
echo "🐍 Executing Backend Pytest..."
cd backend
source .venv/bin/activate
pytest -o pythonpath=. tests/ -v
cd ..

# 2. Frontend Checks
echo "⚛️ Executing Frontend Lint..."
cd frontend
npm run lint
cd ..

# 3. Documentation Image Check
echo "📸 Verifying Documentation Images..."
node scripts/verify_readme_images.js

# 4. Documentation Cross-Link Check
echo "🔗 Verifying Documentation Cross-Links..."
node scripts/verify_all_docs.js

echo "🎉 ALL TESTS AND CHECKS PASSED WITH ZERO ERRORS!"
