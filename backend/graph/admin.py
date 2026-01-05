from django.contrib import admin
from .models import ConceptRelationship, UserKnowledgeGraph, ConceptEvolution


@admin.register(ConceptRelationship)
class ConceptRelationshipAdmin(admin.ModelAdmin):
    """Admin interface for concept relationships."""
    
    list_display = ['concept_a', 'concept_b', 'relationship_type', 'strength', 'weighted_strength', 'co_occurrence_count']
    list_filter = ['relationship_type', 'created_at']
    search_fields = ['concept_a__name', 'concept_b__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-weighted_strength']


@admin.register(UserKnowledgeGraph)
class UserKnowledgeGraphAdmin(admin.ModelAdmin):
    """Admin interface for user knowledge graphs."""
    
    list_display = ['user', 'total_concepts', 'total_relationships', 'total_documents', 'last_updated']
    list_filter = ['last_updated', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'last_updated']


@admin.register(ConceptEvolution)
class ConceptEvolutionAdmin(admin.ModelAdmin):
    """Admin interface for concept evolution tracking."""
    
    list_display = ['concept', 'user', 'document', 'understanding_depth', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['concept__name', 'user__username']
    readonly_fields = ['id', 'timestamp']
    ordering = ['-timestamp']
