from django.contrib import admin
from .models import Concept, DocumentConcept, Claim, Embedding, EmotionalPattern


@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    """Admin interface for concepts."""
    
    list_display = ['name', 'document_count', 'total_mentions', 'first_seen', 'last_seen']
    list_filter = ['first_seen', 'last_seen']
    search_fields = ['name', 'normalized_name']
    readonly_fields = ['id', 'first_seen', 'last_seen']
    ordering = ['-document_count', '-total_mentions']


@admin.register(DocumentConcept)
class DocumentConceptAdmin(admin.ModelAdmin):
    """Admin interface for document-concept relationships."""
    
    list_display = ['document', 'concept', 'mention_count', 'relevance_score']
    list_filter = ['created_at']
    search_fields = ['document__title', 'concept__name']
    ordering = ['-relevance_score']


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    """Admin interface for claims."""
    
    list_display = ['get_preview', 'document', 'claim_type', 'confidence_score', 'created_at']
    list_filter = ['claim_type', 'created_at']
    search_fields = ['text', 'normalized_text']
    readonly_fields = ['id', 'created_at']
    
    def get_preview(self, obj):
        return obj.text[:100] + '...' if len(obj.text) > 100 else obj.text
    get_preview.short_description = 'Claim Preview'


@admin.register(Embedding)
class EmbeddingAdmin(admin.ModelAdmin):
    """Admin interface for embeddings."""
    
    list_display = ['chunk', 'model_name', 'vector_dimension', 'created_at']
    list_filter = ['model_name', 'created_at']
    readonly_fields = ['id', 'created_at', 'vector']
    
    # Don't show vector in list (too large)
    exclude = ['vector']


@admin.register(EmotionalPattern)
class EmotionalPatternAdmin(admin.ModelAdmin):
    """Admin interface for emotional patterns."""
    
    list_display = ['document', 'pattern_type', 'intensity_score', 'created_at']
    list_filter = ['pattern_type', 'created_at']
    search_fields = ['document__title', 'explanation']
    readonly_fields = ['created_at']
    ordering = ['-intensity_score']
