"""
URL Configuration for Personal Knowledge Firewall

Routes:
- /admin/ - Django admin interface
- /api/ - All REST API endpoints
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from .views import index, frontend_assets

urlpatterns = [
    path('', index, name='index'),
    path('assets/<path:path>', frontend_assets, name='frontend-assets'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
