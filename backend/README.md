# Personal Knowledge Firewall (PKF) - Backend

A Django-based backend system for analyzing information consumption patterns, detecting repetition, contradictions, and cognitive overload.

## 🎯 Project Goal

Build a system that helps users manage information overload and misinformation by analyzing the content they consume (documents, web articles, and social media), detecting repetition, contradictions, low-value content, misleading patterns, and cognitive overload — **WITHOUT judging opinions or controlling content**.

## 🏗️ Architecture

```
backend/
├── pkf/                    # Django project settings
│   ├── settings.py        # Configuration
│   ├── urls.py           # Root URL routing
│   └── wsgi.py           # WSGI application
│
├── ingestion/             # Document ingestion & normalization
│   ├── models.py         # Document, ContentChunk, SocialMediaPost
│   ├── normalization.py  # Text cleaning & chunking
│   └── services.py       # Document processing
│
├── analysis/              # NLP & content analysis
│   ├── models.py         # Concept, Claim, Embedding, EmotionalPattern
│   └── services.py       # spaCy & sentence-transformers
│
├── scoring/               # Scoring algorithms
│   ├── models.py         # DocumentScore, Redundancy, Contradiction
│   └── services.py       # Novelty, Depth, Redundancy, CognitiveLoad
│
├── graph/                 # Knowledge graph
│   ├── models.py         # ConceptRelationship, UserKnowledgeGraph
│   └── services.py       # NetworkX graph operations
│
└── api/                   # REST API
    ├── serializers.py    # DRF serializers
    ├── views.py          # API endpoints
    └── urls.py           # API routing
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Virtual environment tool (venv, conda, etc.)
- spaCy English model

### Installation

1. **Create and activate virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Download spaCy model:**

```bash
python -m spacy download en_core_web_sm
```

4. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run migrations:**

```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser:**

```bash
python manage.py createsuperuser
```

7. **Run development server:**

```bash
python manage.py runserver
```

If you are running from the repo root (recommended), use the workspace virtualenv explicitly:

```bash
./.venv/bin/python backend/manage.py runserver
```

Server will start at `http://localhost:8000`

## 📡 API Endpoints

### Documents

- `POST /api/documents/upload/` - Upload file (PDF, text, markdown)
- `POST /api/documents/paste/` - Add pasted content
- `GET /api/documents/` - List all documents
- `GET /api/documents/{id}/` - Get document details
- `DELETE /api/documents/{id}/` - Delete document
- `POST /api/documents/{id}/reprocess/` - Reprocess document

### Concepts

- `GET /api/concepts/` - List all concepts
- `GET /api/concepts/{id}/` - Get concept details
- `GET /api/concepts/{id}/documents/` - Documents containing concept
- `GET /api/concepts/{id}/related/` - Related concepts

### Analysis Results

- `GET /api/redundancies/` - List redundancy detections
- `GET /api/contradictions/` - List contradiction detections
- `POST /api/contradictions/{id}/confirm/` - Confirm contradiction

### Insights

- `GET /api/insights/` - List all insights
- `GET /api/insights/latest/` - Get latest insight

### Knowledge Graph

- `GET /api/graph/` - Get graph metadata
- `POST /api/graph/rebuild/` - Rebuild graph

### Dashboard

- `GET /api/dashboard/stats/` - Get dashboard statistics
- `GET /api/dashboard/recent/` - Get recent documents

## 🔐 Authentication

Currently uses Django's session authentication. For production, consider adding:
- JWT tokens
- OAuth2
- API key authentication

## 🧪 Testing

```bash
pytest
```

## 📊 Database

- **Development**: SQLite (default)
- **Production**: PostgreSQL (recommended)

To switch to PostgreSQL, uncomment the database configuration in `pkf/settings.py` and set environment variables.

## 🎨 Code Style

```bash
# Format code
black .

# Lint code
flake8 .
```

## 📝 Key Features

### 1. Document Ingestion
- Upload PDFs, markdown, text files
- Paste web articles or social media content
- Automatic text normalization and chunking

### 2. NLP Analysis
- Concept extraction using spaCy
- Claim detection
- Embedding generation with sentence-transformers
- Emotional pattern detection

### 3. Scoring System
- **Novelty Score**: How much new information?
- **Depth Score**: How substantive is the content?
- **Redundancy Score**: Have you seen this before?
- **Cognitive Load**: How mentally taxing?

All scores come with transparent explanations.

### 4. Knowledge Graph
- Build personal concept networks
- Track concept relationships
- Weight long-form sources higher than social media
- Concept evolution over time

### 5. Detections
- **Redundancy**: Similar content to what you've read
- **Contradictions**: Conflicting information
- **Emotional Patterns**: Manipulation tactics

## 🛡️ Privacy & Ethics

- All data is user-owned and stored locally
- No external analytics or tracking
- Explicit opt-in for all features
- Transparent explanations for all detections
- No opinion or political bias scoring
- Read-only analysis (never blocks content)

See [docs/ethics.md](../docs/ethics.md) for detailed ethical considerations.

## 🔧 Configuration

Key settings in `pkf/settings.py`:

- `SPACY_MODEL`: spaCy model to use
- `SENTENCE_TRANSFORMER_MODEL`: Embedding model
- `SIMILARITY_THRESHOLD`: Redundancy detection threshold
- `SCORING_WEIGHTS`: Weight factors for scoring

## 📦 Dependencies

Core dependencies:
- Django 5.0
- Django REST Framework
- spaCy
- sentence-transformers
- NetworkX
- FAISS (for vector similarity)

See `requirements.txt` for complete list.

## 🐛 Troubleshooting

**spaCy model not found:**
```bash
python -m spacy download en_core_web_sm
```

**Database migrations fail:**
```bash
python manage.py migrate --run-syncdb
```

**Import errors:**
```bash
pip install -r requirements.txt
```

## 📈 Future Enhancements

- PostgreSQL pgvector for embeddings
- Celery for async processing
- Redis for caching
- Real-time updates via WebSockets
- Advanced contradiction detection with NLI models

## 👥 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Document all functions and classes
4. Run black and flake8 before committing
5. Update this README if needed

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- spaCy for NLP capabilities
- sentence-transformers for embeddings
- NetworkX for graph operations
- Django & DRF for the framework
