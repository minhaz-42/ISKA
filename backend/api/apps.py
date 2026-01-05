from django.apps import AppConfig


class ApiConfig(AppConfig):
    """
    API app provides REST endpoints for the frontend.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    verbose_name = 'REST API'
