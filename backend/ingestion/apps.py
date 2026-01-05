from django.apps import AppConfig


class IngestionConfig(AppConfig):
    """
    Ingestion app handles document upload, text extraction,
    normalization, and chunking.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ingestion'
    verbose_name = 'Content Ingestion'
