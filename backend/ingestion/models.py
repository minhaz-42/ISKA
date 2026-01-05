"""
Data models for content ingestion.

Design principles:
- Store minimal metadata per document
- Track source for transparency
- Support multiple content types
- Enable versioning for updates
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class Document(models.Model):
    """
    Represents a single piece of content ingested by the user.
    
    This could be:
    - An uploaded PDF, markdown, or text file
    - A pasted web article
    - A social media post/thread
    """
    
    CONTENT_TYPE_CHOICES = [
        ('pdf', 'PDF Document'),
        ('docx', 'Word Document (DOCX)'),
        ('markdown', 'Markdown'),
        ('text', 'Plain Text'),
        ('html', 'HTML Document'),
        ('web', 'Web Article'),
        ('social', 'Social Media Post'),
    ]
    
    SOURCE_TYPE_CHOICES = [
        ('upload', 'User Upload'),
        ('paste', 'User Paste'),
        ('url', 'URL Fetch'),
        ('extension', 'Browser Extension'),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    
    title = models.CharField(max_length=500, blank=True)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    
    # Raw content storage
    raw_content = models.TextField(help_text="Original unprocessed content")
    normalized_content = models.TextField(blank=True, help_text="Cleaned and normalized text")
    
    # Metadata
    source_url = models.URLField(blank=True, null=True, max_length=2000)
    source_name = models.CharField(max_length=200, blank=True, help_text="e.g., Twitter, Medium, etc.")
    author = models.CharField(max_length=200, blank=True)
    
    # File info (for uploads)
    file = models.FileField(upload_to='documents/%Y/%m/%d/', blank=True, null=True)
    file_size = models.IntegerField(blank=True, null=True, help_text="Size in bytes")
    
    # Processing status
    is_processed = models.BooleanField(default=False)
    processing_error = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    ingested_at = models.DateTimeField(default=timezone.now, help_text="When user added this content")
    
    # Content metrics (calculated during processing)
    word_count = models.IntegerField(default=0)
    char_count = models.IntegerField(default=0)
    estimated_read_time = models.IntegerField(default=0, help_text="In minutes")
    
    class Meta:
        ordering = ['-ingested_at']
        indexes = [
            models.Index(fields=['user', '-ingested_at']),
            models.Index(fields=['content_type']),
            models.Index(fields=['is_processed']),
        ]
    
    def __str__(self):
        return f"{self.title or 'Untitled'} ({self.content_type})"
    
    def calculate_metrics(self):
        """Calculate basic content metrics."""
        if self.normalized_content:
            self.word_count = len(self.normalized_content.split())
            self.char_count = len(self.normalized_content)
            # Rough estimate: 200 words per minute
            self.estimated_read_time = max(1, self.word_count // 200)


class ContentChunk(models.Model):
    """
    A semantic chunk of a document.
    
    Documents are split into chunks for:
    - More granular analysis
    - Better embedding performance
    - Precise similarity matching
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    
    # Chunk content
    text = models.TextField()
    chunk_index = models.IntegerField(help_text="Position in document")
    
    # Metadata
    word_count = models.IntegerField(default=0)
    char_count = models.IntegerField(default=0)
    
    # Processing
    embedding_generated = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['document', 'chunk_index']
        unique_together = ['document', 'chunk_index']
        indexes = [
            models.Index(fields=['document', 'chunk_index']),
        ]
    
    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.document.title}"


class SocialMediaPost(models.Model):
    """
    Additional metadata for social media content.
    
    Extends Document model with social-specific fields.
    """
    
    PLATFORM_CHOICES = [
        ('twitter', 'Twitter/X'),
        ('reddit', 'Reddit'),
        ('youtube', 'YouTube'),
        ('linkedin', 'LinkedIn'),
        ('other', 'Other'),
    ]
    
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='social_metadata')
    
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    post_id = models.CharField(max_length=200, blank=True)
    post_url = models.URLField(max_length=2000)
    
    # Engagement metrics (if available)
    likes_count = models.IntegerField(blank=True, null=True)
    comments_count = models.IntegerField(blank=True, null=True)
    shares_count = models.IntegerField(blank=True, null=True)
    
    # Thread info
    is_thread = models.BooleanField(default=False)
    thread_position = models.IntegerField(blank=True, null=True)
    
    posted_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Social Media Post"
        verbose_name_plural = "Social Media Posts"
    
    def __str__(self):
        return f"{self.platform} post: {self.document.title}"
