"""
Data models for knowledge graph.

Tracks:
- Relationships between concepts
- Source weighting (long-form > short posts)
- Concept evolution over time
"""

from django.db import models
from django.contrib.auth.models import User
from analysis.models import Concept
from ingestion.models import Document
import uuid


class ConceptRelationship(models.Model):
    """
    Relationship between two concepts.
    
    Examples:
    - "climate change" related to "carbon emissions"
    - "machine learning" related to "neural networks"
    
    Built from co-occurrence in documents.
    """
    
    RELATIONSHIP_TYPES = [
        ('related', 'Related Topic'),
        ('subtopic', 'Subtopic Of'),
        ('contradicts', 'Contradicts'),
        ('supports', 'Supports'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    concept_a = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='relationships_as_a')
    concept_b = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='relationships_as_b')
    
    relationship_type = models.CharField(max_length=50, choices=RELATIONSHIP_TYPES, default='related')
    
    # Strength of relationship
    strength = models.FloatField(default=0.0, help_text="How strongly related (0-1)")
    co_occurrence_count = models.IntegerField(default=0, help_text="How many docs have both")
    
    # Source quality weighting
    # Long-form sources weighted higher than social media
    weighted_strength = models.FloatField(default=0.0, help_text="Strength adjusted for source quality")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['concept_a', 'concept_b', 'relationship_type']
        indexes = [
            models.Index(fields=['concept_a', '-strength']),
            models.Index(fields=['concept_b', '-strength']),
        ]
    
    def __str__(self):
        return f"{self.concept_a.name} -> {self.concept_b.name} ({self.relationship_type})"


class UserKnowledgeGraph(models.Model):
    """
    Metadata about a user's personal knowledge graph.
    
    Used for:
    - Graph statistics
    - Search and navigation
    - Concept exploration
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='knowledge_graph')
    
    # Graph statistics
    total_concepts = models.IntegerField(default=0)
    total_relationships = models.IntegerField(default=0)
    total_documents = models.IntegerField(default=0)
    
    # Most central concepts (hubs in the graph)
    top_concepts = models.JSONField(default=list, help_text="Most connected concepts")
    
    # Graph last updated
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "User Knowledge Graph"
        verbose_name_plural = "User Knowledge Graphs"
    
    def __str__(self):
        return f"Knowledge Graph for {self.user.username}"


class ConceptEvolution(models.Model):
    """
    Track how a concept's understanding evolves over time.
    
    Example: User's understanding of "machine learning" evolves
    as they read more about it.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='concept_evolutions')
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='evolutions')
    
    # Snapshot of understanding at this point
    document = models.ForeignKey(Document, on_delete=models.CASCADE, help_text="Document that updated understanding")
    
    # Related concepts at this point
    related_concepts = models.JSONField(help_text="Snapshot of related concepts")
    
    # Depth of understanding
    understanding_depth = models.IntegerField(default=1, help_text="How many times encountered")
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['concept', 'timestamp']
        indexes = [
            models.Index(fields=['user', 'concept', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.concept.name} evolution at {self.timestamp}"
