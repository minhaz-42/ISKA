"""
Data models for analysis results.

Stores:
- Extracted concepts and entities
- Embeddings for similarity search
- Claims and statements
"""

from django.db import models
from ingestion.models import Document, ContentChunk
import uuid


class Concept(models.Model):
    """
    A concept or topic extracted from content.
    
    Examples: "climate change", "machine learning", "economic policy"
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Concept details
    name = models.CharField(max_length=200, unique=True)
    normalized_name = models.CharField(max_length=200, db_index=True)
    
    # Frequency tracking
    document_count = models.IntegerField(default=0, help_text="How many documents mention this")
    total_mentions = models.IntegerField(default=0, help_text="Total times mentioned across all docs")
    
    # Timestamps
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-document_count', '-total_mentions']
        indexes = [
            models.Index(fields=['normalized_name']),
            models.Index(fields=['-document_count']),
        ]
    
    def __str__(self):
        return self.name


class DocumentConcept(models.Model):
    """
    Relationship between a document and concepts it contains.
    
    Tracks which concepts appear in which documents.
    """
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='concepts')
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='documents')
    
    # How prominently this concept appears
    mention_count = models.IntegerField(default=1)
    relevance_score = models.FloatField(default=0.0, help_text="How central is this concept (0-1)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['document', 'concept']
        indexes = [
            models.Index(fields=['document', '-relevance_score']),
            models.Index(fields=['concept', '-mention_count']),
        ]
    
    def __str__(self):
        return f"{self.concept.name} in {self.document.title}"


class Claim(models.Model):
    """
    A factual claim or statement extracted from content.
    
    Examples:
    - "The economy grew by 3% in 2023"
    - "Climate models predict 2°C warming by 2050"
    
    Used for:
    - Detecting contradictions
    - Tracking repeated claims
    - Identifying novel information
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='claims')
    chunk = models.ForeignKey(ContentChunk, on_delete=models.CASCADE, related_name='claims', null=True)
    
    # Claim content
    text = models.TextField()
    normalized_text = models.TextField(help_text="Cleaned version for comparison")
    
    # Classification
    claim_type = models.CharField(
        max_length=50,
        choices=[
            ('factual', 'Factual Statement'),
            ('opinion', 'Opinion'),
            ('prediction', 'Prediction'),
            ('statistic', 'Statistic/Number'),
        ],
        default='factual'
    )
    
    # Context
    surrounding_context = models.TextField(blank=True, help_text="Text around this claim")
    
    # Metrics
    confidence_score = models.FloatField(default=0.0, help_text="Confidence in extraction (0-1)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document', '-created_at']),
            models.Index(fields=['claim_type']),
        ]
    
    def __str__(self):
        preview = self.text[:100] + '...' if len(self.text) > 100 else self.text
        return f"Claim: {preview}"


class Embedding(models.Model):
    """
    Vector embedding for semantic similarity search.
    
    Stored as JSON array. In production, consider moving to:
    - FAISS index
    - Chroma DB
    - PostgreSQL pgvector extension
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # What this embedding represents
    chunk = models.OneToOneField(ContentChunk, on_delete=models.CASCADE, related_name='embedding')
    
    # Embedding vector (stored as JSON for now)
    # In production, use pgvector or external vector DB
    vector = models.JSONField(help_text="Embedding vector as list of floats")
    model_name = models.CharField(max_length=100, help_text="Which model generated this")
    vector_dimension = models.IntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['chunk']),
        ]
    
    def __str__(self):
        return f"Embedding for {self.chunk}"


class EmotionalPattern(models.Model):
    """
    Tracks emotional manipulation patterns in content.
    
    Detects:
    - Outrage bait
    - Fear-mongering
    - Clickbait language
    - Emotional manipulation
    
    NOTE: This is NOT about judging opinions, but detecting
    manipulation tactics that reduce information quality.
    """
    
    PATTERN_TYPES = [
        ('outrage', 'Outrage Bait'),
        ('fear', 'Fear-Mongering'),
        ('urgency', 'False Urgency'),
        ('clickbait', 'Clickbait Language'),
        ('hyperbole', 'Hyperbole'),
    ]
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='emotional_patterns')
    
    pattern_type = models.CharField(max_length=50, choices=PATTERN_TYPES)
    
    # Evidence
    matched_phrases = models.JSONField(help_text="List of phrases that triggered detection")
    context = models.TextField(help_text="Surrounding text for transparency")
    
    # Scoring
    intensity_score = models.FloatField(help_text="How strong is this pattern (0-1)")
    
    # Explanation for user
    explanation = models.TextField(help_text="Why this was flagged")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-intensity_score']
        indexes = [
            models.Index(fields=['document', 'pattern_type']),
        ]
    
    def __str__(self):
        return f"{self.get_pattern_type_display()} in {self.document.title}"
