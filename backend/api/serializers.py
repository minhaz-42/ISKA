"""
Serializers for REST API.

Convert Django models to JSON and vice versa.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
from ingestion.models import Document, ContentChunk, SocialMediaPost
from analysis.models import Concept, DocumentConcept, Claim, EmotionalPattern
from scoring.models import DocumentScore, RedundancyDetection, ContradictionDetection, UserInsight
from graph.models import ConceptRelationship, UserKnowledgeGraph


# ====================
# Ingestion Serializers
# ====================

class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model."""
    
    # Include score if available
    score = serializers.SerializerMethodField()
    concepts = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'content_type', 'source_type', 'source_url', 'source_name',
            'author', 'normalized_content', 'word_count', 'char_count',
            'estimated_read_time', 'is_processed', 'created_at', 'ingested_at',
            'score', 'concepts'
        ]
        read_only_fields = ['id', 'is_processed', 'created_at', 'word_count', 'char_count']
    
    def get_score(self, obj):
        if hasattr(obj, 'score'):
            return DocumentScoreSerializer(obj.score).data
        return None
    
    def get_concepts(self, obj):
        concepts = obj.concepts.select_related('concept')[:10]
        return [{'name': dc.concept.name, 'relevance': dc.relevance_score} for dc in concepts]


class DocumentUploadSerializer(serializers.Serializer):
    """Serializer for document upload."""
    
    file = serializers.FileField()
    content_type = serializers.ChoiceField(choices=['auto', 'pdf', 'docx', 'html', 'text', 'markdown'])
    title = serializers.CharField(required=False, allow_blank=True)


class ContentPasteSerializer(serializers.Serializer):
    """Serializer for pasted content."""
    
    content = serializers.CharField()
    content_type = serializers.ChoiceField(choices=['web', 'social', 'text', 'markdown'])
    title = serializers.CharField(required=False, allow_blank=True)
    source_url = serializers.URLField(required=False, allow_blank=True)
    source_name = serializers.CharField(required=False, allow_blank=True)


class SocialMediaPostSerializer(serializers.ModelSerializer):
    """Serializer for social media post metadata."""
    
    class Meta:
        model = SocialMediaPost
        fields = ['platform', 'post_id', 'post_url', 'likes_count', 'comments_count',
                  'shares_count', 'is_thread', 'posted_at']


# ====================
# Analysis Serializers
# ====================

class ConceptSerializer(serializers.ModelSerializer):
    """Serializer for Concept model."""
    
    class Meta:
        model = Concept
        fields = ['id', 'name', 'document_count', 'total_mentions', 'first_seen', 'last_seen']


class DocumentConceptSerializer(serializers.ModelSerializer):
    """Serializer for DocumentConcept relationship."""
    
    concept = ConceptSerializer(read_only=True)
    
    class Meta:
        model = DocumentConcept
        fields = ['concept', 'mention_count', 'relevance_score']


class ClaimSerializer(serializers.ModelSerializer):
    """Serializer for Claim model."""
    
    class Meta:
        model = Claim
        fields = ['id', 'text', 'claim_type', 'confidence_score', 'created_at']


class EmotionalPatternSerializer(serializers.ModelSerializer):
    """Serializer for EmotionalPattern model."""
    
    class Meta:
        model = EmotionalPattern
        fields = ['pattern_type', 'matched_phrases', 'context', 'intensity_score', 'explanation']


# ====================
# Scoring Serializers
# ====================

class DocumentScoreSerializer(serializers.ModelSerializer):
    """Serializer for DocumentScore model."""
    
    class Meta:
        model = DocumentScore
        fields = [
            'novelty_score', 'depth_score', 'redundancy_score', 'cognitive_load_score',
            'overall_value_score', 'novelty_explanation', 'depth_explanation',
            'redundancy_explanation', 'cognitive_load_explanation', 'calculated_at'
        ]


class RedundancyDetectionSerializer(serializers.ModelSerializer):
    """Serializer for RedundancyDetection model."""
    
    similar_document = serializers.SerializerMethodField()
    
    class Meta:
        model = RedundancyDetection
        fields = [
            'id', 'similar_document', 'similarity_score', 'overlap_percentage',
            'repeated_concepts', 'explanation', 'detected_at'
        ]
    
    def get_similar_document(self, obj):
        return {
            'id': obj.similar_to.id,
            'title': obj.similar_to.title,
            'ingested_at': obj.similar_to.ingested_at,
        }


class ContradictionDetectionSerializer(serializers.ModelSerializer):
    """Serializer for ContradictionDetection model."""
    
    document_a_info = serializers.SerializerMethodField()
    document_b_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ContradictionDetection
        fields = [
            'id', 'document_a_info', 'document_b_info', 'claim_a_text', 'claim_b_text',
            'confidence_score', 'explanation', 'user_confirmed', 'detected_at'
        ]
    
    def get_document_a_info(self, obj):
        return {'id': obj.document_a.id, 'title': obj.document_a.title}
    
    def get_document_b_info(self, obj):
        return {'id': obj.document_b.id, 'title': obj.document_b.title}


class UserInsightSerializer(serializers.ModelSerializer):
    """Serializer for UserInsight model."""
    
    class Meta:
        model = UserInsight
        fields = [
            'id', 'period_type', 'period_start', 'period_end', 'total_documents',
            'total_words_read', 'total_read_time', 'avg_novelty_score', 'avg_depth_score',
            'avg_redundancy_score', 'avg_cognitive_load', 'redundancies_detected',
            'contradictions_detected', 'emotional_patterns_detected', 'top_concepts',
            'novel_concepts_count', 'summary', 'created_at'
        ]


# ====================
# Graph Serializers
# ====================

class ConceptRelationshipSerializer(serializers.ModelSerializer):
    """Serializer for ConceptRelationship model."""
    
    concept_a = ConceptSerializer(read_only=True)
    concept_b = ConceptSerializer(read_only=True)
    
    class Meta:
        model = ConceptRelationship
        fields = [
            'id', 'concept_a', 'concept_b', 'relationship_type', 'strength',
            'weighted_strength', 'co_occurrence_count'
        ]


class UserKnowledgeGraphSerializer(serializers.ModelSerializer):
    """Serializer for UserKnowledgeGraph model."""
    
    class Meta:
        model = UserKnowledgeGraph
        fields = [
            'total_concepts', 'total_relationships', 'total_documents',
            'top_concepts', 'last_updated'
        ]


# ====================
# Dashboard Serializers
# ====================

class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    
    total_documents = serializers.IntegerField()
    total_words = serializers.IntegerField()
    total_concepts = serializers.IntegerField()
    avg_novelty = serializers.FloatField()
    avg_depth = serializers.FloatField()
    recent_redundancies = serializers.IntegerField()
    recent_contradictions = serializers.IntegerField()


# ====================
# Auth Serializers
# ====================

class UserPublicSerializer(serializers.ModelSerializer):
    """Minimal public user info for the frontend."""

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, value):
        User = get_user_model()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def create(self, validated_data):
        User = get_user_model()
        email = (validated_data.get('email') or '').strip()

        user = User.objects.create_user(
            username=validated_data['username'],
            email=email,
            password=validated_data['password'],
        )

        token, _ = Token.objects.get_or_create(user=user)
        return user, token


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs.get('username'), password=attrs.get('password'))
        if not user:
            raise serializers.ValidationError('Invalid username or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account is disabled.')

        attrs['user'] = user
        return attrs

    def create(self, validated_data):
        user = validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return user, token
