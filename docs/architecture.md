# System Architecture

## Overview

Personal Knowledge Firewall (PKF) is a privacy-focused system for analyzing information consumption patterns. It uses a modular Django architecture with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────┐
│   Frontend UI   │  ← React + TypeScript
└────────┬────────┘
         │
         │ REST API
         ↓
┌─────────────────┐
│   Django API    │  ← REST endpoints (api/)
└────────┬────────┘
         │
         ├──→ Ingestion ──→ Document Processing
         │                   ├── PDF extraction
         │                   ├── Text normalization
         │                   └── Chunking
         │
         ├──→ Analysis ───→ NLP Pipeline
         │                   ├── spaCy (concepts)
         │                   ├── Transformers (embeddings)
         │                   ├── Claim extraction
         │                   └── Emotional patterns
         │
         ├──→ Scoring ────→ Algorithms
         │                   ├── Novelty scorer
         │                   ├── Depth scorer
         │                   ├── Redundancy detector
         │                   └── Cognitive load estimator
         │
         └──→ Graph ──────→ Knowledge Graph
                             ├── NetworkX processing
                             ├── Concept relationships
                             └── Graph analysis
```

## Data Flow

### 1. Document Ingestion

```
User Upload/Paste
      ↓
TextNormalizer (ingestion/normalization.py)
      ├── Extract text (PDF/HTML/Markdown)
      ├── Clean & normalize
      └── Generate title
      ↓
TextChunker
      ├── Split into semantic chunks
      └── Create ContentChunk objects
      ↓
Database (Document + ContentChunks)
```

### 2. Analysis Pipeline

```
Document
      ↓
NLPProcessor (analysis/services.py)
      ├── spaCy: Extract concepts & entities
      ├── Transformers: Generate embeddings
      ├── Extract factual claims
      └── Detect emotional patterns
      ↓
Database (Concepts, Embeddings, Claims, Patterns)
```

### 3. Scoring Pipeline

```
Document + Analysis Results
      ↓
NoveltyScorer
      └── Compare concepts to user history
      ↓
DepthScorer
      └── Length + concept density + claims
      ↓
RedundancyDetector
      └── Cosine similarity of embeddings
      ↓
CognitiveLoadEstimator
      └── Length + density + emotional patterns
      ↓
Calculate Overall Value Score
      ↓
Database (DocumentScore, RedundancyDetection)
```

### 4. Graph Construction

```
User's Documents
      ↓
GraphBuilder (graph/services.py)
      ├── Create concept nodes
      ├── Find co-occurrences
      ├── Weight by source quality
      └── Build NetworkX graph
      ↓
Calculate Centrality
      └── Find most connected concepts
      ↓
Save Relationships
      ↓
Database (ConceptRelationship, UserKnowledgeGraph)
```

## Database Schema

### Core Tables

**ingestion_document**
- Stores all ingested content
- Links to User
- Contains raw and normalized text
- Metadata: source, timestamps, metrics

**ingestion_contentchunk**
- Semantic chunks of documents
- Used for embeddings and analysis

**analysis_concept**
- Unique concepts extracted from documents
- Frequency tracking

**analysis_documentconcept**
- Many-to-many: documents ↔ concepts
- Relevance scores

**analysis_embedding**
- Vector embeddings for semantic search
- Links to ContentChunk

**scoring_documentscore**
- All scores for a document
- Includes explanations

**graph_conceptrelationship**
- Relationships between concepts
- Strength and weighting

## Technology Stack

### Backend Framework
- **Django 5.0**: Web framework
- **Django REST Framework**: API layer
- **PostgreSQL/SQLite**: Database

### NLP & ML
- **spaCy**: Named entity recognition, NLP
- **sentence-transformers**: Semantic embeddings
- **FAISS**: Vector similarity search
- **NumPy**: Numerical operations

### Graph Processing
- **NetworkX**: Graph construction and analysis
- Alternative: Neo4j for large-scale graphs

### Infrastructure
- **gunicorn**: WSGI server (production)
- **nginx**: Reverse proxy (production)
- **Celery**: Async task processing (future)
- **Redis**: Caching & message broker (future)

## API Design

### RESTful Principles
- Resource-based URLs
- Standard HTTP methods (GET, POST, DELETE)
- JSON responses
- Pagination for list endpoints

### Authentication
- Session-based (development)
- JWT tokens (production recommendation)
- Per-user data isolation

### Endpoints Structure
```
/api/
  /documents/        # CRUD + upload/paste
  /concepts/         # Read-only + related
  /redundancies/     # Read-only
  /contradictions/   # Read-only + confirm
  /insights/         # Read-only
  /graph/            # Graph metadata + rebuild
  /dashboard/        # Aggregated stats
```

## Processing Pipeline

### Synchronous (Real-time)
1. Document upload/paste
2. Text normalization
3. Chunking
4. Save to database

### Asynchronous (Background - Future)
1. NLP analysis (spaCy, embeddings)
2. Scoring calculations
3. Graph updates
4. Insight generation

Currently all processing is synchronous. For production, move heavy processing to Celery tasks.

## Scalability Considerations

### Current Design (Single User)
- SQLite database
- Synchronous processing
- In-memory graph operations

### Future Scale (Multiple Users)
- PostgreSQL with pgvector extension
- Celery + Redis for async processing
- Distributed vector store (Milvus, Pinecone)
- Neo4j for knowledge graphs
- Caching layer (Redis)

## Security

### Data Privacy
- User data isolation (QuerySet filtering)
- No cross-user data access
- Local-first processing

### Input Validation
- File type checking
- Size limits (25MB default)
- Content sanitization

### Authentication & Authorization
- User authentication required for all endpoints
- CSRF protection
- CORS configuration for frontend

## Monitoring & Logging

### Logging
- Structured logging to console and file
- Separate loggers per app (ingestion, analysis, etc.)
- Log levels: DEBUG (dev), INFO (prod)

### Future: Observability
- Prometheus metrics
- Sentry error tracking
- Application performance monitoring

## Development Workflow

1. **Local Development**
   - SQLite database
   - Django development server
   - Debug mode ON

2. **Testing**
   - pytest for unit tests
   - Factory Boy for fixtures
   - Coverage reporting

3. **Production**
   - PostgreSQL database
   - gunicorn + nginx
   - Debug mode OFF
   - Environment-based configuration

## Design Decisions

### Why Django?
- Mature ORM for complex relationships
- Admin interface for debugging
- DRF for quick API development
- Large ecosystem

### Why spaCy?
- Fast, production-ready
- Good English models
- Easy entity extraction

### Why sentence-transformers?
- State-of-art semantic embeddings
- Easy to use
- Good balance of quality/speed

### Why NetworkX?
- Simple graph operations
- Good for moderate-sized graphs
- Python-native

### Why Local-First?
- Privacy by design
- No external dependencies
- User owns data
- Faster processing

## Future Architecture

### Microservices (if needed)
```
API Gateway
    ├── Ingestion Service
    ├── Analysis Service (GPU-enabled)
    ├── Scoring Service
    └── Graph Service
```

### Event-Driven
```
Document Uploaded
    ↓
Event Bus (Kafka/RabbitMQ)
    ├──→ Analysis Worker
    ├──→ Scoring Worker
    └──→ Graph Worker
```

This architecture supports the system's goals while maintaining simplicity, privacy, and transparency.
