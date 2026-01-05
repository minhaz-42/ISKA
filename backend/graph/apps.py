from django.apps import AppConfig


class GraphConfig(AppConfig):
    """
    Graph app manages the personal knowledge graph,
    tracking relationships between concepts and documents.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'graph'
    verbose_name = 'Knowledge Graph'
