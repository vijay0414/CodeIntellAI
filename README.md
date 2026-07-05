# CodeDoctor

### An AI agent that reviews, explains, debugs, optimizes, and translates your code — and generates interview questions based on it.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-API-F55036?style=flat)
![Gemini](https://img.shields.io/badge/Gemini-API-4285F4?style=flat&logo=google&logoColor=white)
![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render&logoColor=black)
![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## Overview

CodeDoctor is a full-stack AI-powered code intelligence tool built for developers who want more than just a linter. Paste any code snippet and get a structured review, plain-English explanation, automated debug analysis, performance optimization with complexity comparisons, cross-language translation, and interview questions — all from a single interface. The backend is fully stateless by design, meaning no code is ever stored server-side, and each feature runs as an independent API endpoint for clean separation and fast parallel loading.

**Live Demo:** [ADD YOUR LIVE URL HERE]

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔍 **Code Review** | Analyzes code for bugs, style issues, and security problems. Returns a 0–100 health score with categorized, severity-tagged findings. |
| 2 | 📖 **Code Explanation** | Plain-English walkthrough of what the code does. Includes a Beginner / Advanced mode toggle for audience-appropriate depth. |
| 3 | 🐛 **Debugger** | Takes a code snippet plus an error traceback, identifies the root cause, returns a corrected version and a prevention tip. |
| 4 | ⚡ **Optimizer** | Rewrites code for better performance. Shows before/after time complexity (e.g. O(n²) → O(n log n)) and a side-by-side diff view. |
| 5 | 🌐 **Language Translator** | Converts code logic into a target language while preserving exact behavior. Includes notes on language-specific concept mappings. |
| 6 | 🎯 **Interview Question Generator** | Detects patterns, algorithms, and data structures in your code, then generates relevant interview questions with difficulty tags and answer hints. |
| 7 | 📦 **Batch Review** | Upload multiple files at once. Returns a summary dashboard (average health score, most common issue, best/worst file) plus per-file results, processed concurrently. |

---

## Screenshots

> Replace the placeholders below with actual screenshots after deployment.

![Review Tab](./screenshots/review.png)
![Explanation Tab](./screenshots/explain.png)
![Debugger Tab](./screenshots/debug.png)
![Optimizer Tab](./screenshots/optimize.png)
![Translator Tab](./screenshots/translate.png)
![Interview Questions Tab](./screenshots/interview.png)
![Batch Review Tab](./screenshots/batch.png)

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework and build tooling |
| Tailwind CSS | Utility-first styling |
| Monaco Editor | Code input with full syntax highlighting |
| Zustand | Shared state across tabs (history, selected language, mode) |
| @tanstack/react-query | API data fetching and per-tab caching |
| Axios | HTTP client with response interceptors |
| react-diff-viewer | Before/after code diff rendering for the Optimizer |

### Backend
| Tool | Purpose |
|------|---------|
| FastAPI (Python 3.11+) | Async REST API framework |
| httpx | Async HTTP client for outbound LLM API calls |
| Pydantic v2 | Request/response validation and serialization |
| pydantic-settings | Environment variable management |
| uvicorn | ASGI server |

### AI Layer
| Provider | Role |
|----------|------|
| Groq API | Primary LLM — fast inference for review, explain, debug, interview |
| Gemini API | Fallback — used for longer reasoning tasks like optimize and translate |

---

## Architecture

```
┌─────────────────────────────────┐
│         User's Browser          │
│   React + Vite (Vercel)         │
│                                 │
│  Monaco Editor → Zustand Store  │
│  react-query → Axios client     │
└────────────┬────────────────────┘
             │  HTTPS API calls (/api/*)
             ▼
┌─────────────────────────────────┐
│      FastAPI Backend            │
│      (Render — Python 3.11)     │
│                                 │
│  /api/review                    │
│  /api/explain                   │
│  /api/debug                     │
│  /api/optimize    ──────────────┼──► Groq API  (primary)
│  /api/translate                 │
│  /api/interview-questions       │
│  /api/batch-review  ────────────┼──► Gemini API (fallback)
│         (asyncio.gather)        │
└─────────────────────────────────┘
       Stateless — no database
```

**Why stateless?** The backend holds no session state and writes to no database. Each request is self-contained: code in, structured JSON out. History is kept only in the user's browser via Zustand for the duration of their session. This eliminates infrastructure complexity, removes any risk of storing user code server-side, and keeps the free-tier deployment viable.

**Why separate endpoints per feature?** Each tab in the UI loads independently. A slow Optimize call (which may involve multiple LLM round-trips) never blocks the Explain tab from rendering. Each endpoint has its own focused prompt template, which produces significantly better structured output than a single "do everything" prompt.

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Python** 3.11 or higher
- A **Groq API key** — free at [console.groq.com](https://console.groq.com)
- *(Optional)* A **Gemini API key** — free at [aistudio.google.com](https://aistudio.google.com)

---

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/vijay0414/CodeIntellAI.git
cd CodeIntellAI/backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here   # optional
LLM_PROVIDER=groq
APP_ENV=development
```

```bash
# 5. Start the backend
uvicorn app.main:app --reload --port 8000
```

Backend will be running at `http://localhost:8000`. Verify with:
```bash
curl http://localhost:8000/health
# → {"status":"ok","env":"development"}
```

---

### Frontend Setup

```bash
# From the repo root
cd frontend

# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE=http://localhost:8000
```

```bash
# 3. Start the dev server
npm run dev
```

Frontend will be running at `http://localhost:5173`.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/review` | Analyze code for bugs, style, and security issues. Returns health score + tagged findings. |
| `POST` | `/api/explain` | Generate a plain-English explanation of the code. Supports `beginner` / `advanced` mode. |
| `POST` | `/api/debug` | Identify root cause of an error given code + traceback. Returns fix and prevention tip. |
| `POST` | `/api/optimize` | Rewrite code for better performance with before/after complexity analysis. |
| `POST` | `/api/translate` | Convert code to a target language with concept mapping notes. |
| `POST` | `/api/interview-questions` | Generate interview questions based on patterns detected in the submitted code. |
| `POST` | `/api/batch-review` | Review multiple files concurrently. Returns per-file results and a summary dashboard. |
| `GET`  | `/health` | Health check — returns service status and environment. |

---

## Project Structure

```
CodeIntellAI/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app factory, CORS, global error handlers
│   │   ├── config.py             # Pydantic settings (env vars)
│   │   ├── routers/              # One router per feature endpoint
│   │   │   ├── review.py
│   │   │   ├── explain.py
│   │   │   ├── debug.py
│   │   │   ├── optimize.py
│   │   │   ├── translate.py
│   │   │   ├── interview.py
│   │   │   └── batch_review.py
│   │   ├── services/
│   │   │   ├── llm_client.py     # Unified Groq/Gemini abstraction
│   │   │   ├── review_service.py
│   │   │   └── ...               # One service per feature
│   │   ├── schemas/              # Pydantic request/response models
│   │   └── utils/
│   │       ├── prompt_templates.py
│   │       └── json_parser.py    # Safe LLM JSON extraction with retry
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.ts          # Axios instance with base URL + interceptors
    │   │   └── endpoints.ts       # Typed API call functions
    │   ├── components/
    │   │   ├── CodeEditor.tsx     # Monaco editor wrapper
    │   │   ├── ReviewPanel.tsx
    │   │   ├── ExplanationPanel.tsx
    │   │   ├── DebugPanel.tsx
    │   │   ├── OptimizePanel.tsx
    │   │   ├── TranslatePanel.tsx
    │   │   ├── InterviewQuestionsPanel.tsx
    │   │   └── ...
    │   ├── hooks/                 # react-query hooks per feature
    │   ├── store/
    │   │   └── useAppStore.ts     # Zustand global state
    │   └── types/
    │       └── index.ts           # Shared TypeScript types
    ├── .env.example
    ├── vercel.json
    └── vite.config.ts
```

---

## Future Improvements

- **GitHub OAuth + PR integration** — connect a GitHub repo and run CodeDoctor directly on open pull requests
- **PDF / Markdown export** — download a formatted review report for code review meetings or portfolio documentation
- **Shareable read-only links** — generate a public permalink to a review result without requiring an account
- **VS Code extension** — run review, explain, and debug directly from the editor without switching to a browser tab

---
