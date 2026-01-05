from django.contrib import admin
from .models import DocumentScore, RedundancyDetection, ContradictionDetection, UserInsight


@admin.register(DocumentScore)
class DocumentScoreAdmin(admin.ModelAdmin):
    """Admin interface for document scores."""
    
    list_display = [
        'document',
        'overall_value_score',
        'novelty_score',
        'depth_score',
        'redundancy_score',
        'cognitive_load_score',
        'calculated_at'
    ]
    list_filter = ['calculated_at']
    search_fields = ['document__title']
    readonly_fields = ['calculated_at']
    ordering = ['-overall_value_score']


@admin.register(RedundancyDetection)
class RedundancyDetectionAdmin(admin.ModelAdmin):
    """Admin interface for redundancy detections."""
    
    list_display = ['document', 'similar_to', 'similarity_score', 'overlap_percentage', 'detected_at']
    list_filter = ['detected_at']
    search_fields = ['document__title', 'similar_to__title']
    readonly_fields = ['id', 'detected_at']
    ordering = ['-similarity_score']


@admin.register(ContradictionDetection)
class ContradictionDetectionAdmin(admin.ModelAdmin):
    """Admin interface for contradiction detections."""
    
    list_display = ['document_a', 'document_b', 'confidence_score', 'user_confirmed', 'detected_at']
    list_filter = ['user_confirmed', 'detected_at']
    search_fields = ['claim_a_text', 'claim_b_text']
    readonly_fields = ['id', 'detected_at']
    ordering = ['-detected_at']


@admin.register(UserInsight)
class UserInsightAdmin(admin.ModelAdmin):
    """Admin interface for user insights."""
    
    list_display = [
        'user',
        'period_type',
        'period_start',
        'period_end',
        'total_documents',
        'avg_novelty_score',
        'redundancies_detected'
    ]
    list_filter = ['period_type', 'period_start']
    search_fields = ['user__username']
    readonly_fields = ['created_at']
    ordering = ['-period_end']
