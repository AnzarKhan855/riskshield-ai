#!/usr/bin/env bash
set -e

echo "🚀 Deploying RiskShield AI via Production Containers..."

if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH."
    exit 1
fi

docker compose -f docker-compose.prod.yml down --remove-orphans
docker compose -f docker-compose.prod.yml up --build -d

echo "⏳ Waiting for services to achieve healthy status..."
sleep 5

docker compose -f docker-compose.prod.yml ps

echo "🎉 Deployment successful! Accessible on http://localhost:3000"
