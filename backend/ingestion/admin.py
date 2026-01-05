from django.contrib import admin
from .models import Document, ContentChunk, SocialMediaPost


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin interface for documents."""
    
    list_display = ['title', 'user', 'content_type', 'source_type', 'is_processed', 'created_at']
    list_filter = ['content_type', 'source_type', 'is_processed', 'created_at']
    search_fields = ['title', 'normalized_content']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('id', 'user', 'title', 'content_type', 'source_type')
        }),
        ('Content', {
            'fields': ('raw_content', 'normalized_content')
        }),
        ('Metadata', {
            'fields': ('source_url', 'source_name', 'author')
        }),
        ('File Info', {
            'fields': ('file', 'file_size')
        }),
        ('Processing', {
            'fields': ('is_processed', 'processing_error')
        }),
        ('Metrics', {
            'fields': ('word_count', 'char_count', 'estimated_read_time')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'ingested_at')
        }),
    )


@admin.register(ContentChunk)
class ContentChunkAdmin(admin.ModelAdmin):
    """Admin interface for content chunks."""
    
    list_display = ['document', 'chunk_index', 'word_count', 'embedding_generated']
    list_filter = ['embedding_generated', 'created_at']
    search_fields = ['text']
    readonly_fields = ['id', 'created_at']


@admin.register(SocialMediaPost)
class SocialMediaPostAdmin(admin.ModelAdmin):
    """Admin interface for social media posts."""
    
    list_display = ['document', 'platform', 'posted_at', 'is_thread']
    list_filter = ['platform', 'is_thread', 'posted_at']
    search_fields = ['post_url', 'post_id']
