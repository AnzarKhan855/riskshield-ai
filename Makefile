# RiskShield AI — Enterprise Developer Automation Makefile
.PHONY: help setup setup-backend setup-frontend test test-backend test-frontend lint format run-backend run-frontend docker-up docker-down screenshots verify clean

help:
	@echo "RiskShield AI — Enterprise Command Palette"
	@echo "==========================================="
	@echo "make setup          - Install all backend and frontend dependencies"
	@echo "make test           - Run complete backend and frontend test suites"
	@echo "make test-backend   - Run Pytest test suite with coverage"
	@echo "make test-frontend  - Run frontend lint and type checks"
	@echo "make lint           - Run lint checks across entire codebase"
	@echo "make format         - Format Python and frontend code"
	@echo "make run-backend    - Launch FastAPI backend server (:8000)"
	@echo "make run-frontend   - Launch Next.js frontend dev server (:3000)"
	@echo "make docker-up      - Launch multi-container stack via Docker Compose"
	@echo "make docker-down    - Stop and remove Docker containers"
	@echo "make screenshots    - Execute Playwright headless screenshot suite"
	@echo "make verify         - Verify all documentation image links exist"
	@echo "make clean          - Remove temporary caches and virtual environments"

setup: setup-backend setup-frontend

setup-backend:
	cd backend && python -m venv .venv && pip install -r requirements.txt

setup-frontend:
	cd frontend && npm install

test: test-backend test-frontend

test-backend:
	cd backend && pytest -o pythonpath=. tests/ -v

test-frontend:
	cd frontend && npm run lint

lint:
	cd frontend && npm run lint

format:
	cd frontend && npm run format

run-backend:
	cd backend && uvicorn main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

screenshots:
	node scripts/capture_all_screenshots.js

verify:
	node scripts/verify_readme_images.js

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
