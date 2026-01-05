from django.apps import AppConfig


class ScoringConfig(AppConfig):
    """
    Scoring app calculates novelty, depth, redundancy,
    and cognitive load scores.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'scoring'
    verbose_name = 'Content Scoring'
