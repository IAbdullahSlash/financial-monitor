# FinMentor India — Complete Setup Guide

FinMentor India is a full-stack, AI-powered personal finance mentor for Indian users.

- **Frontend:** React + Vite
- **Backend:** FastAPI + Python
- **AI approach:** deterministic finance engines, Monte Carlo, optimization, and classical ML
- **No external LLM dependency required** (optional local Ollama support only)

---

## 1) What this runs

This project includes live backend-connected modules:

1. FIRE Path Planner
2. Money Health Score
3. Life Event Advisor
4. Tax Optimization (India)
5. Couples Planner
6. Mutual Fund Portfolio X-Ray
7. Live aggregated Dashboard (calls multiple backend engines in one refresh)

---

## 2) Prerequisites

Install the following on your machine:

- **Node.js** 18+
- **Python** 3.11+
- **pip** (comes with Python)

Optional (recommended for production-like setup):

- Redis
- PostgreSQL

---

## 3) Project structure

- Frontend app: `src/`
- Backend app: `backend/app/`
- Backend requirements: `backend/requirements.txt`
- Local NAV data source: `data_source/NAVAII.txt`

---

## 4) One-time setup (full stack)

From repo root (`d:/financial-monitor`):

### 4.1 Frontend dependencies

```bash
npm install
```

### 4.2 Python virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 4.3 Backend dependencies

```bash
pip install -r backend/requirements.txt
```

---

## 5) Environment configuration

Backend reads env vars via `backend/app/core/config.py`.

Create a file at `backend/.env`:

```env
app_env=dev

# Comma-separated list for local frontend origins
cors_origins=["http://localhost:3000","http://127.0.0.1:3000","http://localhost:5173","http://127.0.0.1:5173"]

postgres_url=postgresql+psycopg://postgres:postgres@localhost:5432/finmentor
redis_url=redis://localhost:6379/0

# Use a real Fernet key in production
encryption_key=change-me-use-fernet-key

# Provided Alpha Vantage key (can be replaced later)
alpha_vantage_api_key=CEIIV1DU5SWDJY1P

# Local NAV source file (required)
nav_file_path=data_source/NAVAII.txt
mfapi_base_url=https://api.mfapi.in/mf

# Optional local LLM explanation layer (disabled by default)
ollama_enabled=false
ollama_model=mistral
ollama_base_url=http://localhost:11434/api/generate
```

Create a file at `.env.local` (repo root) for frontend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 6) Run the complete platform

Open **two terminals** from repo root.

### Terminal A: Backend

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Backend docs:

- Swagger: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

### Terminal B: Frontend

```bash
npm run dev
```

Frontend app:

- http://localhost:3000

---

## 7) Verify end-to-end integration

Open frontend pages and click the compute actions:

- `/fire-planner` → generates FIRE plan from backend
- `/health-score` → computes weighted + ML-calibrated health score
- `/life-advisor` → returns life-event recommendations
- `/tax-wizard` → compares old/new regime and deductions
- `/couples-planner` → joint tax optimization output
- `/portfolio-xray` → upload CSV, run X-Ray, NAV lookup, market quote
- `/` (dashboard) → **Refresh Live Outputs** to aggregate multiple backend modules

---

## 8) API summary

Base path: `/api/v1`

- `POST /fire/plan`
- `POST /health-score/score`
- `POST /life-events/advise`
- `POST /tax/optimize`
- `POST /couples/plan`
- `POST /portfolio/upload-statement`
- `POST /portfolio/xray`
- `GET /portfolio/nav/{scheme_code}`
- `GET /portfolio/market/quote/{symbol}`
- `GET /portfolio/market/daily/{symbol}?compact=true`

System endpoint:

- `GET /health`

---

## 9) Data used by backend

1. **Local NAV data (primary)**
   - `data_source/NAVAII.txt`
2. **MFAPI fallback**
   - `https://api.mfapi.in/mf/{scheme_code}`
3. **Alpha Vantage market data**
   - Uses `alpha_vantage_api_key`
4. **User input payloads**
   - Financial profile, tax data, transactions, planning inputs

---

## 10) Portfolio upload format

Portfolio statement CSV currently expects these columns:

```csv
scheme_code,scheme_name,date,amount,units,txn_type
119551,Fund A,2025-01-15,10000,123.45,buy
119551,Fund A,2025-02-15,10000,120.11,buy
```

Date format should be ISO (`YYYY-MM-DD`).

---

## 11) Troubleshooting

### Frontend cannot reach backend (CORS / network)

- Ensure backend is running on `http://127.0.0.1:8000`
- Ensure frontend `.env.local` has `VITE_API_BASE_URL=http://127.0.0.1:8000`
- Restart both frontend and backend after env changes

### NAV lookup errors

- Confirm file exists: `data_source/NAVAII.txt`
- Confirm `nav_file_path` in `backend/.env` is `data_source/NAVAII.txt`

### Alpha Vantage errors

- Verify `alpha_vantage_api_key`
- Be aware of free-tier rate limits

### Redis/Postgres unavailable

- Current app has fallbacks for cache and can run without active DB wiring for core calculations

---

## 12) Production notes

Before production deployment, add:

- JWT auth + role-based access
- Tenant isolation and audit logs
- Managed Redis/PostgreSQL
- Secret management (do not keep keys in plaintext env files)
- CI/CD + automated tests

---

## 13) Additional docs

Detailed backend capabilities are documented in:

- `backend_features.txt`
