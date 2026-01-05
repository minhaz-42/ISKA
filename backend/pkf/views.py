from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpRequest, HttpResponse
from django.views.static import serve


def _dist_dir() -> Path:
    # settings.BASE_DIR == <repo>/backend
    repo_root = Path(settings.BASE_DIR).parent
    return repo_root / 'frontend' / 'dist'


def frontend_index(request: HttpRequest) -> HttpResponse:
    """Serve the built frontend if present (no Vite required)."""

    dist = _dist_dir()
    index_file = dist / 'index.html'
    if not index_file.exists():
        raise Http404('Frontend not built')
    return FileResponse(open(index_file, 'rb'), content_type='text/html; charset=utf-8')


def frontend_assets(request: HttpRequest, path: str) -> HttpResponse:
    dist = _dist_dir()
    assets_dir = dist / 'assets'
    if not assets_dir.exists():
        raise Http404('No frontend assets')
    return serve(request, path, document_root=str(assets_dir))


def index(request: HttpRequest) -> HttpResponse:
    # If the frontend is built, serve it directly.
    try:
        return frontend_index(request)
    except Http404:
        pass

    frontend_url = 'http://127.0.0.1:5173/'
    api_url = request.build_absolute_uri('/api/')

    html = f"""<!doctype html>
<html lang=\"en\">
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>PKF Backend</title>
  </head>
  <body>
    <main style=\"max-width: 820px; margin: 40px auto; padding: 0 16px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;\">
      <h1>Personal Knowledge Firewall</h1>
      <p>Django backend is running.</p>

      <h2>Open</h2>
      <ul>
        <li><a href=\"{frontend_url}\">Frontend (Vite dev server)</a></li>
        <li><a href=\"{api_url}\">API root</a></li>
      </ul>

      <h2>Status</h2>
      <ul>
        <li>DEBUG: {str(settings.DEBUG)}</li>
        <li>Tip: To build the frontend for Django to serve, run <code>npm run build</code>. For hot-reload, run <code>npm run dev:vite</code>.</li>
      </ul>
    </main>
  </body>
</html>"""

    return HttpResponse(html)
