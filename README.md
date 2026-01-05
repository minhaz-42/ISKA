# Personal Knowledge Firewall (PKF)

> A mindful assistant for your attention. Calm signals and explanations as you read.

PKF is a privacy-first system that helps you manage information overload by analyzing what you read, extracting concepts, and generating explainable scores. It **does not** judge opinions, block content, or "fact-check" you — it highlights patterns and explains why.

## ✨ Features

### 🎯 Core Capabilities
- **Document Analysis** — Upload PDFs, paste articles, or add text for NLP-powered insights
- **Pattern Detection** — Identify persuasive language, repetition, and content density
- **Explainable Scores** — Novelty, depth, redundancy, and cognitive load with transparent reasoning
- **Knowledge Graph** — Connect concepts across your reading history

### 🌐 Browser Extension (Chrome MV3)
- **Live Monitor** — Subtle inline signals while you browse
- **Auto-Summarize** — Generate summaries of articles as you read
- **Persistent Insights** — Keep insights visible until you dismiss them

### 🎨 Design Philosophy
- **Calm by default** — No urgency language, no attention traps
- **Explanation-first** — Every signal comes with context
- **Privacy-focused** — Your data stays yours; local processing when possible
- **Non-judgmental** — We notice patterns, not opinions

## 🚀 Quick Start

### Prerequisites
- Python **3.10+** (recommended: 3.11)
- Node.js **18+**

### 1. Clone & Setup

```bash
git clone https://github.com/minhaz-42/PKF-Personal-Knowledge-Firewall.git
cd PKF-Personal-Knowledge-Firewall

# Create Python virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt
python -m spacy download en_core_web_sm

# Run database migrations
python manage.py migrate

# Install frontend dependencies
npm --prefix frontend install
npm --prefix frontend run build
```

### 2. Run the App

```bash
python manage.py runserver
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

### 3. Development Mode

```bash
# Hot reload (Django + Vite dev server)
npm run dev:vite

# Or: Django + continuous frontend builds
npm run dev
```

## 📁 Project Structure

```
├── backend/                 # Django + DRF backend
│   ├── pkf/                 # Django project settings
│   ├── api/                 # REST API endpoints
│   ├── ingestion/           # Upload/paste + normalization
│   ├── analysis/            # NLP (concepts, embeddings)
│   ├── scoring/             # Scoring algorithms
│   └── graph/               # Knowledge graph
├── frontend/                # React + TypeScript + Tailwind
│   └── src/
│       ├── design/          # Calm design system components
│       ├── pages/           # Dashboard, Insights, Settings, etc.
│       └── ui/              # Shell and navigation
├── extension/               # Chrome MV3 extension
│   └── pkf/                 # Content script + popup
├── docs/                    # Architecture, ethics, metrics
└── package.json             # Dev scripts
```

## 🔌 API Reference

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Create account |
| `/api/auth/login/` | POST | Get auth token |
| `/api/auth/logout/` | POST | Invalidate token |
| `/api/auth/me/` | GET | Current user info |

### Documents
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents/upload/` | POST | Upload file (PDF, DOCX, HTML, TXT, MD) |
| `/api/documents/paste/` | POST | Paste text content |
| `/api/documents/` | GET | List all documents |
| `/api/documents/<id>/` | GET | Document details with analysis |

## 🧩 Browser Extension

### Installation (Development)
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/pkf/` folder

### Features
- **Live Monitor** — Toggle real-time signals on any webpage
- **Summarize Now** — Generate a summary of the current article
- **Keep Insights** — Persist signals until you dismiss them

## 🎨 Design System

PKF uses a custom calm design system inspired by Notion, Arc Browser, and Linear:

### Components
- `SoftButton` — Calm button variants (primary, secondary, ghost, subtle)
- `InsightCard` — Expandable insight cards with tone-based styling
- `CalmNotice` — Info, success, warning, and tip notices
- `ExplanationBox` — Context boxes with source attribution
- `SubtleToggle` — Toggle switches with descriptions
- `ReadingSignalBadge` — Pattern type indicators

### Color Palette
| Token | Light | Dark |
|-------|-------|------|
| Primary | `#5B7FD3` | `#7AA2F7` |
| Secondary | `#D4A853` | `#E5C98A` |
| Success | `#6DAA7E` | `#7BC99A` |
| Warning | `#D4A853` | `#E5C98A` |

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [Metrics & Scoring](docs/metrics.md)
- [Ethics & Privacy](docs/ethics.md)

## 🔒 Non-Negotiable Principles

- ✅ User-owned data
- ✅ Explicit opt-in for monitoring
- ✅ Read-only analysis (never blocks content)
- ✅ No DMs / no private messages
- ✅ No keystroke logging
- ✅ Transparent explanations for every score

## 🛠 Troubleshooting

<details>
<summary><strong>Module not found / wrong Python</strong></summary>

```bash
source .venv/bin/activate
python manage.py runserver
```
</details>

<details>
<summary><strong>Auth endpoints return 401</strong></summary>

Ensure you're sending `Authorization: Token <token>` header. Log in via the UI to store the token.
</details>

<details>
<summary><strong>UI looks outdated</strong></summary>

```bash
npm --prefix frontend run build
```
</details>

<details>
<summary><strong>Port 8000 is stuck</strong></summary>

```bash
npm run backend:stop
npm run backend:restart
```
</details>

## 📄 License

This project is under active development. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <em>Built with calm intention. No dark patterns. No urgency traps.</em>
</p>
