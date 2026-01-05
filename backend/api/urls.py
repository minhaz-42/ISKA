"""
URL configuration for API endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentViewSet,
    ConceptViewSet,
    RedundancyViewSet,
    ContradictionViewSet,
    UserInsightViewSet,
    knowledge_graph_view,
    rebuild_graph_view,
    dashboard_stats_view,
    recent_documents_view,
    live_stream_view,
    live_snippet_view,
    insight_cards_view,
    auth_register_view,
    auth_login_view,
    auth_logout_view,
    auth_me_view,
)

# Create router for viewsets
router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'concepts', ConceptViewSet, basename='concept')
router.register(r'redundancies', RedundancyViewSet, basename='redundancy')
router.register(r'contradictions', ContradictionViewSet, basename='contradiction')
router.register(r'insights', UserInsightViewSet, basename='insight')

# URL patterns
urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Knowledge graph
    path('graph/', knowledge_graph_view, name='knowledge-graph'),
    path('graph/rebuild/', rebuild_graph_view, name='rebuild-graph'),
    
    # Dashboard
    path('dashboard/stats/', dashboard_stats_view, name='dashboard-stats'),
    path('dashboard/recent/', recent_documents_view, name='recent-documents'),

    # Insight-first APIs
    path('insight-cards/', insight_cards_view, name='insight-cards'),

    # Live monitor (SSE + snippet ingest)
    path('live/stream/', live_stream_view, name='live-stream'),
    path('live/snippet/', live_snippet_view, name='live-snippet'),

    # Auth (JSON)
    path('auth/register/', auth_register_view, name='auth-register'),
    path('auth/login/', auth_login_view, name='auth-login'),
    path('auth/logout/', auth_logout_view, name='auth-logout'),
    path('auth/me/', auth_me_view, name='auth-me'),
    
    # Authentication (DRF browsable session login)
    path('auth/session/', include('rest_framework.urls')),
]
