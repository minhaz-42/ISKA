"""
REST API views.

Endpoints:
- Document upload and management
- Content analysis results
- Scoring and insights
- Knowledge graph exploration
- Dashboard data
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.contrib.auth import login as django_login, logout as django_logout
from django.http import StreamingHttpResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Sum
from datetime import datetime, timedelta

import json
import queue
import threading
import time
from typing import Any, Dict, List, Set

from ingestion.models import Document, SocialMediaPost
from ingestion.services import DocumentProcessor
from analysis.models import Concept, DocumentConcept, Claim, EmotionalPattern
from analysis.services import process_document_analysis
from scoring.models import DocumentScore, RedundancyDetection, ContradictionDetection, UserInsight
from scoring.services import calculate_document_scores
from graph.models import ConceptRelationship, UserKnowledgeGraph
from graph.services import build_user_graph, update_concept_evolution

from .serializers import (
    DocumentSerializer, DocumentUploadSerializer, ContentPasteSerializer,
    ConceptSerializer, DocumentConceptSerializer, ClaimSerializer,
    EmotionalPatternSerializer, DocumentScoreSerializer,
    RedundancyDetectionSerializer, ContradictionDetectionSerializer,
    UserInsightSerializer, ConceptRelationshipSerializer,
    UserKnowledgeGraphSerializer, DashboardStatsSerializer,
    RegisterSerializer, LoginSerializer, UserPublicSerializer
)

import logging

from analysis.insights import analyze_snippet, insights_from_document_explanations

logger = logging.getLogger('pkf.api')


# ====================
# Auth (JSON)
# ====================


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_register_view(request):
    """Register a new user and return an auth token."""

    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user, token = serializer.create(serializer.validated_data)

    return Response(
        {
            'token': token.key,
            'user': UserPublicSerializer(user).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login_view(request):
    """Login and return an auth token (creates one if missing)."""

    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user, token = serializer.create(serializer.validated_data)

    # Optional: also set a session for same-origin UI.
    try:
        django_login(request, user)
    except Exception:
        pass

    return Response({'token': token.key, 'user': UserPublicSerializer(user).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auth_logout_view(request):
    """Logout: delete current token (if any) and clear session."""

    # TokenAuthentication attaches request.auth as a Token instance.
    tok = getattr(request, 'auth', None)
    if isinstance(tok, Token):
        tok.delete()

    try:
        django_logout(request)
    except Exception:
        pass

    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_me_view(request):
    """Return current authenticated user."""

    return Response({'user': UserPublicSerializer(request.user).data})


# --- Live monitor (in-memory, dev-friendly) ---
# NOTE: This is intentionally simple and process-local.
# In production, use Redis/pubsub or a proper event bus.
_LIVE_SUBSCRIBERS: List["queue.Queue[Dict[str, Any]]"] = []
_LIVE_LOCK = threading.Lock()
_SEEN_SNIPPET_HASHES: Set[str] = set()


def _sse_pack(event: str, data: Dict[str, Any]) -> str:
    return f"event: {event}\n" + f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _broadcast_live(event: str, payload: Dict[str, Any]) -> None:
    with _LIVE_LOCK:
        dead: List[queue.Queue] = []
        for q in _LIVE_SUBSCRIBERS:
            try:
                q.put_nowait({"event": event, "data": payload})
            except Exception:
                dead.append(q)
        if dead:
            _LIVE_SUBSCRIBERS[:] = [q for q in _LIVE_SUBSCRIBERS if q not in dead]


# In development, keep the API easy to use from the frontend.
# In non-DEBUG environments, require authentication.
DEV_PERMISSION_CLASSES = [AllowAny] if settings.DEBUG else [IsAuthenticated]


def get_active_user(request):
    """Return the authenticated user, or a stable demo user in DEBUG."""

    if getattr(request, 'user', None) and request.user.is_authenticated:
        return request.user

    if not settings.DEBUG:
        return request.user

    User = get_user_model()
    username = getattr(settings, 'PKF_DEV_USERNAME', None) or 'demo'
    user, _ = User.objects.get_or_create(username=username)
    return user


# ====================
# Document Management
# ====================

class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for document CRUD operations.
    
    Endpoints:
    - GET /api/documents/ - List all documents
    - POST /api/documents/ - Create (not used directly, use upload/paste)
    - GET /api/documents/{id}/ - Get document details
    - DELETE /api/documents/{id}/ - Delete document
    - POST /api/documents/upload/ - Upload file
    - POST /api/documents/paste/ - Paste content
    - POST /api/documents/{id}/reprocess/ - Reprocess document
    """
    
    serializer_class = DocumentSerializer
    permission_classes = DEV_PERMISSION_CLASSES
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['content_type', 'source_type', 'is_processed']
    search_fields = ['title', 'normalized_content']
    ordering_fields = ['created_at', 'ingested_at', 'word_count']
    ordering = ['-ingested_at']
    
    def get_queryset(self):
        """Only return documents for current user."""
        user = get_active_user(self.request)
        return Document.objects.filter(user=user).select_related('score')
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        Upload a file (PDF, text, markdown).
        
        POST /api/documents/upload/
        Body: multipart/form-data with 'file' and 'content_type'
        """
        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        content_type = serializer.validated_data['content_type']
        
        # Process file
        processor = DocumentProcessor()
        user = get_active_user(request)
        document, success = processor.process_uploaded_file(
            file=file,
            user=user,
            content_type=content_type
        )
        
        if success:
            # Run analysis pipeline
            process_document_analysis(document)
            calculate_document_scores(document)
            update_concept_evolution(document)
            
            return Response(
                DocumentSerializer(document).data,
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {'error': 'Failed to process file', 'detail': document.processing_error},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def paste(self, request):
        """
        Add pasted content.
        
        POST /api/documents/paste/
        Body: JSON with 'content', 'content_type', optional 'title', 'source_url'
        """
        serializer = ContentPasteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = get_active_user(request)
        # Process content
        processor = DocumentProcessor()
        document, success = processor.process_pasted_content(
            content=serializer.validated_data['content'],
            user=user,
            content_type=serializer.validated_data['content_type'],
            title=serializer.validated_data.get('title'),
            source_url=serializer.validated_data.get('source_url'),
            source_name=serializer.validated_data.get('source_name'),
        )
        
        if success:
            # Run analysis pipeline
            process_document_analysis(document)
            calculate_document_scores(document)
            update_concept_evolution(document)
            
            return Response(
                DocumentSerializer(document).data,
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {'error': 'Failed to process content', 'detail': document.processing_error},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def reprocess(self, request, pk=None):
        """
        Reprocess a document (re-run analysis and scoring).
        
        POST /api/documents/{id}/reprocess/
        """
        document = self.get_object()
        
        try:
            process_document_analysis(document)
            calculate_document_scores(document)
            update_concept_evolution(document)
            
            return Response({'status': 'success'})
        except Exception as e:
            logger.error(f"Failed to reprocess document {document.id}: {e}")
            return Response(
                {'error': 'Failed to reprocess', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ====================
# Analysis
# ====================

class ConceptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing concepts.
    
    Endpoints:
    - GET /api/concepts/ - List all concepts for user
    - GET /api/concepts/{id}/ - Get concept details
    - GET /api/concepts/{id}/documents/ - Get documents containing concept
    - GET /api/concepts/{id}/related/ - Get related concepts
    """
    
    serializer_class = ConceptSerializer
    permission_classes = DEV_PERMISSION_CLASSES
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'normalized_name']
    ordering_fields = ['document_count', 'total_mentions', 'first_seen']
    ordering = ['-document_count']
    
    def get_queryset(self):
        """Only return concepts seen by current user."""
        user = get_active_user(self.request)
        return Concept.objects.filter(
            documents__document__user=user
        ).distinct()
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get documents containing this concept."""
        concept = self.get_object()
        
        document_concepts = DocumentConcept.objects.filter(
            concept=concept,
            document__user=request.user
        ).select_related('document').order_by('-relevance_score')
        
        return Response(DocumentConceptSerializer(document_concepts, many=True).data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """Get related concepts."""
        concept = self.get_object()
        
        # Get relationships
        relationships = ConceptRelationship.objects.filter(
            concept_a=concept
        ).select_related('concept_b').order_by('-weighted_strength')[:20]
        
        return Response(ConceptRelationshipSerializer(relationships, many=True).data)


# ====================
# Scoring & Insights
# ====================

class RedundancyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing redundancy detections.
    
    Endpoints:
    - GET /api/redundancies/ - List all redundancies
    - GET /api/redundancies/{id}/ - Get redundancy details
    """
    
    serializer_class = RedundancyDetectionSerializer
    permission_classes = DEV_PERMISSION_CLASSES
    ordering = ['-detected_at']
    
    def get_queryset(self):
        user = get_active_user(self.request)
        return RedundancyDetection.objects.filter(
            document__user=user
        ).select_related('document', 'similar_to')


class ContradictionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing contradiction detections.
    
    Endpoints:
    - GET /api/contradictions/ - List all contradictions
    - GET /api/contradictions/{id}/ - Get contradiction details
    - POST /api/contradictions/{id}/confirm/ - Confirm contradiction
    """
    
    serializer_class = ContradictionDetectionSerializer
    permission_classes = DEV_PERMISSION_CLASSES
    ordering = ['-detected_at']
    
    def get_queryset(self):
        user = get_active_user(self.request)
        return ContradictionDetection.objects.filter(
            document_a__user=user
        ).select_related('document_a', 'document_b')
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """User confirms this is a real contradiction."""
        contradiction = self.get_object()
        contradiction.user_confirmed = True
        contradiction.save()
        
        return Response({'status': 'confirmed'})


class UserInsightViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user insights.
    
    Endpoints:
    - GET /api/insights/ - List all insights
    - GET /api/insights/latest/ - Get latest insight
    """
    
    serializer_class = UserInsightSerializer
    permission_classes = DEV_PERMISSION_CLASSES
    ordering = ['-period_end']
    
    def get_queryset(self):
        user = get_active_user(self.request)
        return UserInsight.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the most recent insight."""
        insight = self.get_queryset().first()
        
        if insight:
            return Response(UserInsightSerializer(insight).data)
        else:
            return Response({'message': 'No insights yet'}, status=status.HTTP_404_NOT_FOUND)


# ====================
# Knowledge Graph
# ====================

@api_view(['GET'])
@permission_classes(DEV_PERMISSION_CLASSES)
def knowledge_graph_view(request):
    """
    Get user's knowledge graph data.
    
    GET /api/graph/
    """
    user = get_active_user(request)
    
    # Get or build graph metadata
    try:
        graph_meta = UserKnowledgeGraph.objects.get(user=user)
    except UserKnowledgeGraph.DoesNotExist:
        # Build graph
        build_user_graph(user)
        graph_meta = UserKnowledgeGraph.objects.get(user=user)
    
    return Response(UserKnowledgeGraphSerializer(graph_meta).data)


@api_view(['POST'])
@permission_classes(DEV_PERMISSION_CLASSES)
def rebuild_graph_view(request):
    """
    Rebuild user's knowledge graph.
    
    POST /api/graph/rebuild/
    """
    user = get_active_user(request)
    
    try:
        graph = build_user_graph(user)
        graph_meta = UserKnowledgeGraph.objects.get(user=user)
        
        return Response({
            'status': 'success',
            'graph': UserKnowledgeGraphSerializer(graph_meta).data
        })
    except Exception as e:
        logger.error(f"Failed to rebuild graph for user {user.id}: {e}")
        return Response(
            {'error': 'Failed to rebuild graph', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ====================
# Dashboard
# ====================

@api_view(['GET'])
@permission_classes(DEV_PERMISSION_CLASSES)
def dashboard_stats_view(request):
    """
    Get dashboard statistics.
    
    GET /api/dashboard/stats/
    """
    user = get_active_user(request)
    
    # Get aggregated stats
    documents = Document.objects.filter(user=user)
    
    stats = {
        'total_documents': documents.count(),
        'total_words': documents.aggregate(Sum('word_count'))['word_count__sum'] or 0,
        'total_concepts': Concept.objects.filter(
            documents__document__user=user
        ).distinct().count(),
    }
    
    # Average scores
    scores = DocumentScore.objects.filter(document__user=user)
    score_aggs = scores.aggregate(
        avg_novelty=Avg('novelty_score'),
        avg_depth=Avg('depth_score'),
    )
    
    stats['avg_novelty'] = score_aggs['avg_novelty'] or 0.0
    stats['avg_depth'] = score_aggs['avg_depth'] or 0.0
    
    # Recent detections (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    
    stats['recent_redundancies'] = RedundancyDetection.objects.filter(
        document__user=user,
        detected_at__gte=week_ago
    ).count()
    
    stats['recent_contradictions'] = ContradictionDetection.objects.filter(
        document_a__user=user,
        detected_at__gte=week_ago
    ).count()
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes(DEV_PERMISSION_CLASSES)
def recent_documents_view(request):
    """
    Get recent documents with scores.
    
    GET /api/dashboard/recent/
    """
    user = get_active_user(request)
    limit = int(request.query_params.get('limit', 10))
    
    documents = Document.objects.filter(
        user=user,
        is_processed=True
    ).select_related('score').order_by('-ingested_at')[:limit]
    
    return Response(DocumentSerializer(documents, many=True).data)


# ====================
# Insight-First APIs
# ====================

@api_view(["GET"])
@permission_classes(DEV_PERMISSION_CLASSES)
def insight_cards_view(request):
    """Return insight-style cards derived from existing Document score explanations."""

    user = get_active_user(request)
    limit = int(request.query_params.get('limit', 25))

    documents = (
        Document.objects.filter(user=user, is_processed=True)
        .select_related('score')
        .order_by('-ingested_at')[:limit]
    )

    cards: List[Dict[str, Any]] = []
    for doc in documents:
        score = getattr(doc, 'score', None)
        if not score:
            continue

        title = getattr(doc, 'title', '') or getattr(doc, 'filename', '') or '(untitled)'
        insights = insights_from_document_explanations(
            title=title,
            novelty_explanation=getattr(score, 'novelty_explanation', '') or '',
            depth_explanation=getattr(score, 'depth_explanation', '') or '',
            redundancy_explanation=getattr(score, 'redundancy_explanation', '') or '',
            cognitive_load_explanation=getattr(score, 'cognitive_load_explanation', '') or '',
        )
        if not insights:
            continue

        cards.append(
            {
                'document_id': doc.id,
                'title': title,
                'created_at': doc.created_at.isoformat() if getattr(doc, 'created_at', None) else None,
                'insights': insights,
            }
        )

    return Response({'cards': cards})


# ====================
# Live Monitor (SSE)
# ====================

@api_view(["GET"])
@permission_classes(DEV_PERMISSION_CLASSES)
def live_stream_view(request):
    """Server-Sent Events stream for Live Monitor."""

    def gen():
        q: "queue.Queue[Dict[str, Any]]" = queue.Queue(maxsize=100)
        with _LIVE_LOCK:
            _LIVE_SUBSCRIBERS.append(q)

        # initial hello + keep-alive
        yield _sse_pack("hello", {"ok": True, "ts": time.time()})
        last_ping = time.time()

        try:
            while True:
                now = time.time()
                if now - last_ping >= 15:
                    yield _sse_pack("ping", {"ts": now})
                    last_ping = now

                try:
                    msg = q.get(timeout=1.0)
                except queue.Empty:
                    continue

                yield _sse_pack(msg.get("event", "message"), msg.get("data", {}))
        finally:
            with _LIVE_LOCK:
                if q in _LIVE_SUBSCRIBERS:
                    _LIVE_SUBSCRIBERS.remove(q)

    resp = StreamingHttpResponse(gen(), content_type="text/event-stream")
    resp["Cache-Control"] = "no-cache"
    resp["X-Accel-Buffering"] = "no"
    return resp


@api_view(["POST"])
@permission_classes(DEV_PERMISSION_CLASSES)
def live_snippet_view(request):
    """Analyze a snippet and broadcast resulting insights (no DB writes)."""

    body = request.data or {}
    text = (body.get('text') or '').strip()
    url = (body.get('url') or '').strip()
    source = (body.get('source') or '').strip()  # e.g. "extension", "web", "paste"

    toggles = body.get('toggles') or {}
    enable_ai = bool(toggles.get('enable_ai', True))
    enable_misinfo = bool(toggles.get('enable_misinfo', True))
    enable_emotion = bool(toggles.get('enable_emotion', True))

    if not text:
        return Response({'error': "Missing 'text'"}, status=status.HTTP_400_BAD_REQUEST)

    insights = analyze_snippet(
        text,
        seen_hashes=_SEEN_SNIPPET_HASHES,
        enable_ai=enable_ai,
        enable_misinfo=enable_misinfo,
        enable_emotion=enable_emotion,
    )
    insight_dicts = [i.to_dict() for i in insights]

    event = {
        'kind': 'live_insights',
        'source': source or 'snippet',
        'url': url,
        'snippet': ' '.join(text.split())[:600],
        'insights': insight_dicts,
        'created_at': time.time(),
    }

    if insight_dicts:
        _broadcast_live('insight', event)

    return Response({'ok': True, 'insights': insight_dicts})
