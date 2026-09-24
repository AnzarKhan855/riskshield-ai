# 🤝 Contributing to RiskShield AI

Thank you for your interest in contributing to **RiskShield AI**! We welcome contributions from engineers, researchers, data scientists, and technical writers.

---

## 1. Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 2. Development Workflow

### 2.1 Fork & Clone
```bash
git clone https://github.com/your-username/riskshield-ai.git
cd riskshield-ai
```

### 2.2 Branch Naming Conventions
- `feat/feature-name`: New features or enhancements
- `fix/bug-description`: Bug fixes
- `perf/optimization`: Performance improvements
- `docs/documentation-update`: Documentation changes
- `test/test-addition`: Adding or improving tests

### 2.3 Local Environment Setup
```bash
# Run one-command setup
make setup
```

---

## 3. Coding Standards & Guidelines

### Python (Backend)
- Adhere to **PEP 8** and **Google Python Style Guide**.
- Ensure all new functions include type hints (`from typing import ...`).
- Document all public methods with Google-style docstrings:
  ```python
  def compute_risk_score(amount: float, velocity: int) -> float:
      """Computes normalized composite risk score.

      Args:
          amount: Transaction dollar value.
          velocity: Historical 1-hour transaction frequency.

      Returns:
          Composite risk score bounded between 0.0 and 100.0.
      """
  ```

### TypeScript / React (Frontend)
- Use functional components with TypeScript interfaces.
- Strictly avoid `any` types.
- Follow Tailwind CSS naming conventions with utility classes.

---

## 4. Pull Request Checklist

Before opening a pull request, ensure:
- [ ] Backend tests pass: `make test-backend`
- [ ] Frontend linter passes: `make lint-frontend`
- [ ] Code is formatted: `make format`
- [ ] New features include corresponding unit/integration tests
- [ ] Documentation is updated in `docs/` where applicable
