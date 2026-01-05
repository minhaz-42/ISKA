from django.apps import AppConfig


class AnalysisConfig(AppConfig):
    """
    Analysis app handles NLP processing, concept extraction,
    and embedding generation.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'analysis'
    verbose_name = 'Content Analysis'
