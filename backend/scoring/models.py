"""
Data models for scoring system.

Tracks:
- Novelty scores (is this new information?)
- Depth scores (is this substantive?)
- Redundancy scores (have I seen this before?)
- Cognitive load (is this overwhelming?)
"""

from django.db import models
from ingestion.models import Document
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class DocumentScore(models.Model):
    """
    Comprehensive score for a document.
    
    All scores are 0-1, where:
    - Higher novelty = more new information
    - Higher depth = more substantive content
    - Higher redundancy = more repeated information
    - Higher cognitive_load = more mentally taxing
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='score')
    
    # Core scores (0-1 scale)
    novelty_score = models.FloatField(default=0.0, help_text="How much new information")
    depth_score = models.FloatField(default=0.0, help_text="How substantive/detailed")
    redundancy_score = models.FloatField(default=0.0, help_text="How much repetition")
    cognitive_load_score = models.FloatField(default=0.0, help_text="Mental effort required")
    
    # Composite score
    overall_value_score = models.FloatField(default=0.0, help_text="Weighted combination")
    
    # Explanations (transparent scoring)
    novelty_explanation = models.TextField(blank=True)
    depth_explanation = models.TextField(blank=True)
    redundancy_explanation = models.TextField(blank=True)
    cognitive_load_explanation = models.TextField(blank=True)
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-overall_value_score']
        indexes = [
            models.Index(fields=['-novelty_score']),
            models.Index(fields=['-overall_value_score']),
        ]
    
    def __str__(self):
        return f"Score for {self.document.title} (value: {self.overall_value_score:.2f})"


class RedundancyDetection(models.Model):
    """
    Tracks when content repeats information the user has seen before.
    
    Example: User reads 5 articles about the same event with
    the same information.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # The new document
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='redundancies')
    
    # Previous document(s) with similar content
    similar_to = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='repeated_in',
        help_text="Earlier document with similar content"
    )
    
    # Similarity metrics
    similarity_score = models.FloatField(help_text="Cosine similarity (0-1)")
    overlap_percentage = models.FloatField(help_text="% of concepts that overlap")
    
    # What's repeated
    repeated_concepts = models.JSONField(help_text="List of concept names that appear in both")
    repeated_claims = models.JSONField(help_text="List of similar claim IDs", default=list)
    
    # Explanation
    explanation = models.TextField(help_text="User-facing explanation of redundancy")
    
    detected_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-similarity_score']
        indexes = [
            models.Index(fields=['document', '-similarity_score']),
        ]
    
    def __str__(self):
        return f"Redundancy: {self.document.title} similar to {self.similar_to.title}"


class ContradictionDetection(models.Model):
    """
    Tracks when content contradicts information the user has seen before.
    
    Example: Document A says "X increased by 5%", Document B says "X decreased"
    
    NOTE: This does NOT judge which is correct, just flags the contradiction
    for user awareness.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    document_a = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='contradictions_as_a')
    document_b = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='contradictions_as_b')
    
    # What contradicts
    claim_a_id = models.UUIDField(help_text="Claim from document A")
    claim_b_id = models.UUIDField(help_text="Claim from document B")
    
    claim_a_text = models.TextField()
    claim_b_text = models.TextField()
    
    # Confidence in contradiction detection
    confidence_score = models.FloatField(help_text="How confident we are (0-1)")
    
    # Explanation
    explanation = models.TextField(help_text="Why these are contradictory")
    
    # User feedback (learning mechanism)
    user_confirmed = models.BooleanField(null=True, blank=True, help_text="User says this is a real contradiction")
    
    detected_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-detected_at']
        unique_together = ['document_a', 'document_b', 'claim_a_id', 'claim_b_id']
        indexes = [
            models.Index(fields=['-detected_at']),
            models.Index(fields=['document_a']),
            models.Index(fields=['document_b']),
        ]
    
    def __str__(self):
        return f"Contradiction between {self.document_a.title} and {self.document_b.title}"


class UserInsight(models.Model):
    """
    Aggregated insights for a user over time.
    
    Used for:
    - Weekly summary reports
    - Cognitive load tracking
    - Content consumption patterns
    """
    
    PERIOD_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='insights')
    
    period_type = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Content consumption stats
    total_documents = models.IntegerField(default=0)
    total_words_read = models.IntegerField(default=0)
    total_read_time = models.IntegerField(default=0, help_text="Minutes")
    
    # Quality metrics
    avg_novelty_score = models.FloatField(default=0.0)
    avg_depth_score = models.FloatField(default=0.0)
    avg_redundancy_score = models.FloatField(default=0.0)
    avg_cognitive_load = models.FloatField(default=0.0)
    
    # Detection counts
    redundancies_detected = models.IntegerField(default=0)
    contradictions_detected = models.IntegerField(default=0)
    emotional_patterns_detected = models.IntegerField(default=0)
    
    # Top concepts
    top_concepts = models.JSONField(help_text="List of most frequent concepts", default=list)
    
    # Novel information
    novel_concepts_count = models.IntegerField(default=0)
    
    # Summary
    summary = models.TextField(blank=True, help_text="Generated summary for user")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-period_end']
        unique_together = ['user', 'period_type', 'period_start']
        indexes = [
            models.Index(fields=['user', '-period_end']),
            models.Index(fields=['period_type', 'period_start']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.period_type} ({self.period_start} to {self.period_end})"
