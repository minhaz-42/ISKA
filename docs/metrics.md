# Metrics & Scoring Methodology

## Overview

All scoring in PKF is **transparent** and **explainable**. This document details exactly how each metric is calculated.

---

## Core Metrics

### 1. Novelty Score

**Purpose**: How much new information does this document contain?

**Range**: 0.0 to 1.0 (higher = more novel)

**Algorithm**:
```python
def calculate_novelty(document, user):
    # Extract concepts from document
    document_concepts = get_concepts(document)
    
    # Get concepts user has seen before
    historical_concepts = get_user_historical_concepts(user, before=document.created_at)
    
    # Calculate percentage that are new
    new_concepts = [c for c in document_concepts if c not in historical_concepts]
    
    novelty_score = len(new_concepts) / len(document_concepts)
    
    return novelty_score
```

**Factors**:
- Concept comparison to user history
- Only considers content user has already read
- First-time concepts score high

**Interpretation**:
- **0.0-0.3**: Low novelty (mostly familiar concepts)
- **0.3-0.7**: Moderate novelty (mix of new and familiar)
- **0.7-1.0**: High novelty (mostly new concepts)

**Example Explanations**:
- "High novelty: 12 out of 15 concepts are new to you."
- "Low novelty: You've already read about most of these topics."

---

### 2. Depth Score

**Purpose**: How substantive and detailed is the content?

**Range**: 0.0 to 1.0 (higher = more depth)

**Algorithm**:
```python
def calculate_depth(document):
    # Factor 1: Content length
    if word_count < 200:
        length_score = 0.2
    elif word_count < 500:
        length_score = 0.4
    elif word_count < 1000:
        length_score = 0.6
    elif word_count < 2000:
        length_score = 0.8
    else:
        length_score = 1.0
    
    # Factor 2: Concept density (concepts per 100 words)
    concept_density = concepts_count / (word_count / 100)
    concept_score = min(1.0, concept_density / 5.0)
    
    # Factor 3: Factual claims
    claims_score = min(1.0, claims_count / 10.0)
    
    # Weighted average
    depth_score = (length_score * 0.4) + (concept_score * 0.4) + (claims_score * 0.2)
    
    return depth_score
```

**Factors**:
- **Length** (40% weight): Longer content can be more detailed
- **Concept density** (40% weight): Rich conceptual content
- **Claims** (20% weight): Presence of factual statements

**Interpretation**:
- **0.0-0.3**: Shallow (brief, limited detail)
- **0.3-0.7**: Moderate (some substance)
- **0.7-1.0**: Deep (substantive, detailed)

**Example Explanations**:
- "High depth: 2,500 words with detailed analysis and 8 factual claims."
- "Low depth: Brief post with 150 words and limited detail."

**Important**: Depth ≠ Quality. A deep article can still be wrong. This measures detail, not accuracy.

---

### 3. Redundancy Score

**Purpose**: How much does this repeat what you've already read?

**Range**: 0.0 to 1.0 (higher = more redundant)

**Algorithm**:
```python
def calculate_redundancy(document, user):
    # Generate document embedding (average of chunk embeddings)
    document_vector = get_document_embedding(document)
    
    # Get recent documents by user
    recent_docs = get_recent_documents(user, limit=50)
    
    max_similarity = 0.0
    
    for prev_doc in recent_docs:
        prev_vector = get_document_embedding(prev_doc)
        
        # Cosine similarity
        similarity = cosine_similarity(document_vector, prev_vector)
        
        if similarity > max_similarity:
            max_similarity = similarity
    
    return max_similarity
```

**Factors**:
- **Semantic similarity**: Using sentence-transformer embeddings
- **Concept overlap**: Shared concepts between documents
- **Recency**: Compares to last 50 documents

**Threshold**: 0.85 (configurable)
- Above threshold = redundancy detected

**Interpretation**:
- **0.0-0.5**: Unique content
- **0.5-0.85**: Some overlap
- **0.85-1.0**: High redundancy

**Example Explanations**:
- "High redundancy: 89% similar to 'Article X' from 3 days ago."
- "Low redundancy: This appears to be unique content."

---

### 4. Cognitive Load Score

**Purpose**: How mentally taxing is this content to process?

**Range**: 0.0 to 1.0 (higher = more taxing)

**Algorithm**:
```python
def calculate_cognitive_load(document):
    # Factor 1: Length (very long = tiring)
    if word_count < 500:
        length_load = 0.2
    elif word_count < 1500:
        length_load = 0.5
    elif word_count < 3000:
        length_load = 0.7
    else:
        length_load = 0.9
    
    # Factor 2: Concept density (too many = overwhelming)
    concept_density = concepts_count / (word_count / 100)
    if concept_density > 8:
        concept_load = 0.9
    elif concept_density > 5:
        concept_load = 0.6
    else:
        concept_load = 0.3
    
    # Factor 3: Emotional patterns (manipulation taxes cognition)
    emotional_load = min(1.0, emotional_patterns_count * 0.3)
    
    # Weighted average
    cognitive_load = (length_load * 0.4) + (concept_load * 0.4) + (emotional_load * 0.2)
    
    return cognitive_load
```

**Factors**:
- **Length** (40%): Very long content is tiring
- **Density** (40%): Too many concepts is overwhelming
- **Emotional patterns** (20%): Manipulation adds cognitive tax

**Interpretation**:
- **0.0-0.3**: Easy to process
- **0.3-0.7**: Moderate effort
- **0.7-1.0**: High effort (consider breaks)

**Example Explanations**:
- "High cognitive load: 4,000 words with dense concepts. Consider taking breaks."
- "Low cognitive load: Easy to process and digest."

**Note**: High load doesn't mean bad. Academic papers should have high load.

---

### 5. Overall Value Score

**Purpose**: Composite score of content value to user.

**Range**: 0.0 to 1.0 (higher = more valuable)

**Algorithm**:
```python
def calculate_overall_value(novelty, depth, redundancy):
    # Weighted combination
    value = (novelty * 0.30) + (depth * 0.25) - (redundancy * 0.25)
    
    # Clamp to 0-1 range
    value = max(0.0, min(1.0, value))
    
    return value
```

**Weights** (configurable):
- **Novelty**: 30%
- **Depth**: 25%
- **Redundancy**: -25% (negative weight)
- **Cognitive Load**: Not included (informational only)

**Interpretation**:
- **0.7-1.0**: High value (novel, deep, unique)
- **0.4-0.7**: Moderate value
- **0.0-0.4**: Low value (redundant or shallow)

**Note**: This is subjective. Users can adjust weights based on preferences.

---

## Detection Metrics

### Redundancy Detection

**Trigger**: Similarity score > 0.85 (threshold)

**Output**:
```json
{
  "similarity_score": 0.89,
  "similar_document": {
    "title": "Previous Article",
    "date": "2024-01-15"
  },
  "overlap_percentage": 0.73,
  "repeated_concepts": ["machine learning", "neural networks", "transformers"],
  "explanation": "This is 89% similar to 'Previous Article' from Jan 15. They share 12 concepts."
}
```

### Contradiction Detection

**Algorithm** (Future Enhancement):
1. Extract claims from documents
2. Generate claim embeddings
3. Find semantically similar claims
4. Use Natural Language Inference (NLI) model to detect contradiction
5. Flag if contradiction score > threshold

**Current Status**: Basic framework in place, needs NLI model integration.

### Emotional Pattern Detection

**Patterns Detected**:

1. **Outrage Bait**
   - Keywords: outrageous, shocking, unbelievable, insane, crazy, disgusting
   - Intensity: count / 5.0 (normalized)

2. **False Urgency**
   - Keywords: act now, hurry, limited time, urgent, immediately, breaking
   - Intensity: count / 3.0

3. **Hyperbole**
   - Metric: Exclamation point count
   - Threshold: > 5 exclamation points
   - Intensity: count / 20.0

**Output**:
```json
{
  "pattern_type": "outrage",
  "matched_phrases": ["shocking", "unbelievable", "outrageous"],
  "intensity_score": 0.6,
  "explanation": "Uses outrage-inducing language that may trigger emotional responses."
}
```

---

## Aggregated Metrics

### User Insights (Weekly)

**Calculated**: Every week for each user

**Metrics**:
```python
{
  "period": "2024-01-15 to 2024-01-21",
  "total_documents": 23,
  "total_words": 45000,
  "total_read_time": 225,  # minutes
  
  "avg_novelty": 0.62,
  "avg_depth": 0.71,
  "avg_redundancy": 0.34,
  "avg_cognitive_load": 0.55,
  
  "redundancies_detected": 5,
  "contradictions_detected": 2,
  "emotional_patterns_detected": 8,
  
  "top_concepts": [
    {"name": "climate change", "count": 12},
    {"name": "machine learning", "count": 8}
  ],
  
  "novel_concepts_count": 47,
  
  "summary": "This week you read 23 articles (225 min). You encountered 47 new concepts, but 5 articles were similar to previous content."
}
```

---

## Calibration & Tuning

### User Feedback

Users can provide feedback to improve scoring:
- "This was actually novel to me" → Adjust concept matching
- "This redundancy was a false positive" → Tune similarity threshold

### Configurable Parameters

In `settings.py`:
```python
SIMILARITY_THRESHOLD = 0.85  # Redundancy detection
CONTRADICTION_THRESHOLD = 0.75  # Contradiction detection
MIN_CONTENT_LENGTH = 50  # Minimum for analysis
SHALLOW_CONTENT_THRESHOLD = 200  # Words

SCORING_WEIGHTS = {
    'novelty': 0.3,
    'depth': 0.25,
    'redundancy': 0.25,
    'cognitive_load': 0.2,
}
```

Users can adjust these for personalization.

---

## Limitations

### What We CAN'T Measure

1. **Accuracy**: We don't fact-check
2. **Quality**: We measure depth, not correctness
3. **Bias**: We don't detect political lean
4. **Trustworthiness**: We don't rate sources
5. **Readability**: We don't measure how well-written something is

### Known Issues

1. **New Users**: Novelty scores are inflated (everything is new)
2. **Domain Specificity**: Technical jargon may confuse concept extraction
3. **Language**: Only supports English currently
4. **Sarcasm**: Emotional pattern detection can misfire on sarcasm
5. **Short Content**: Scoring less reliable for <100 words

---

## Future Improvements

1. **Personalized Thresholds**: Learn from user feedback
2. **Domain Adaptation**: Better handling of technical content
3. **Multi-language**: Support more languages
4. **Advanced NLI**: Better contradiction detection
5. **Readability Metrics**: Add Flesch-Kincaid, etc.
6. **Bias Detection**: Detect manipulation without judging opinions
7. **Citation Analysis**: Weight content with more sources higher

---

## Transparency Commitment

Every score includes:
1. **The number** (what the score is)
2. **The explanation** (why this score was assigned)
3. **The evidence** (what data supports this)

Users can always:
- See the algorithm
- Understand the logic
- Adjust the parameters
- Provide feedback

**No black boxes. Full transparency.**
