"""
Scoring algorithms and services.

Implements:
- Novelty scoring (is this new information for the user?)
- Depth scoring (is this substantive content?)
- Redundancy detection (similarity to previous content)
- Cognitive load estimation
- Contradiction detection
"""

import logging
import numpy as np
from typing import List, Tuple, Optional
from django.conf import settings
from django.db.models import Avg, Count, Q
from datetime import datetime, timedelta
from .models import DocumentScore, RedundancyDetection, ContradictionDetection, UserInsight
from analysis.models import Concept, DocumentConcept, Embedding, Claim
from ingestion.models import Document

logger = logging.getLogger('pkf.scoring')


class NoveltyScorer:
    """
    Calculate how much new information a document contains.
    
    Strategy:
    - Compare concepts to user's history
    - Weight by concept importance
    - Higher score = more novel concepts
    """
    
    def score(self, document: Document) -> Tuple[float, str]:
        """
        Calculate novelty score.
        
        Returns:
            (score: 0-1, explanation: str)
        """
        user = document.user
        
        # Get all concepts in this document
        doc_concepts = DocumentConcept.objects.filter(document=document).select_related('concept')
        
        if not doc_concepts.exists():
            return 0.0, "No concepts extracted yet."
        
        # Get user's historical concepts (before this document)
        historical_concepts = Concept.objects.filter(
            documents__document__user=user,
            documents__document__created_at__lt=document.created_at
        ).distinct()
        
        historical_concept_ids = set(historical_concepts.values_list('id', flat=True))
        
        # Calculate novelty
        new_concepts = []
        existing_concepts = []
        
        for doc_concept in doc_concepts:
            if doc_concept.concept.id not in historical_concept_ids:
                new_concepts.append(doc_concept.concept.name)
            else:
                existing_concepts.append(doc_concept.concept.name)
        
        total_concepts = len(new_concepts) + len(existing_concepts)
        
        if total_concepts == 0:
            novelty_score = 0.0
        else:
            novelty_score = len(new_concepts) / total_concepts
        
        # Generate explanation
        if novelty_score > 0.7:
            explanation = f"High novelty: {len(new_concepts)} out of {total_concepts} concepts are new to you."
        elif novelty_score > 0.4:
            explanation = f"Moderate novelty: {len(new_concepts)} new concepts out of {total_concepts} total."
        else:
            explanation = f"Low novelty: Most concepts ({len(existing_concepts)}) were already familiar."
        
        logger.debug(f"Novelty score for {document.id}: {novelty_score:.2f}")
        return novelty_score, explanation


class DepthScorer:
    """
    Calculate how substantive and detailed the content is.
    
    Indicators:
    - Length (longer = potentially more depth)
    - Concept density
    - Presence of claims/statistics
    - Sentence complexity
    """
    
    def score(self, document: Document) -> Tuple[float, str]:
        """
        Calculate depth score.
        
        Returns:
            (score: 0-1, explanation: str)
        """
        # Factor 1: Length score
        # Social media posts are typically shallow, long-form content can be deeper
        word_count = document.word_count
        
        if word_count < settings.SHALLOW_CONTENT_THRESHOLD:
            length_score = 0.2
        elif word_count < 500:
            length_score = 0.4
        elif word_count < 1000:
            length_score = 0.6
        elif word_count < 2000:
            length_score = 0.8
        else:
            length_score = 1.0
        
        # Factor 2: Concept density
        concepts_count = DocumentConcept.objects.filter(document=document).count()
        concept_density = concepts_count / (word_count / 100.0) if word_count > 0 else 0
        concept_score = min(1.0, concept_density / 5.0)  # Normalize
        
        # Factor 3: Claims/evidence
        claims_count = Claim.objects.filter(document=document).count()
        claims_score = min(1.0, claims_count / 10.0)  # Normalize
        
        # Weighted combination
        depth_score = (length_score * 0.4) + (concept_score * 0.4) + (claims_score * 0.2)
        
        # Generate explanation
        factors = []
        if length_score > 0.6:
            factors.append("substantial length")
        if concept_score > 0.5:
            factors.append("good concept density")
        if claims_score > 0.5:
            factors.append("multiple factual claims")
        
        if depth_score > 0.7:
            explanation = f"High depth: Content has {', '.join(factors)}."
        elif depth_score > 0.4:
            explanation = f"Moderate depth: Some substantive content with {word_count} words and {concepts_count} concepts."
        else:
            explanation = f"Low depth: Brief content ({word_count} words) with limited detail."
        
        logger.debug(f"Depth score for {document.id}: {depth_score:.2f}")
        return depth_score, explanation


class RedundancyDetector:
    """
    Detect when content repeats information the user has already seen.
    
    Uses:
    - Embedding similarity
    - Concept overlap
    """
    
    def __init__(self, similarity_threshold: float = None):
        self.similarity_threshold = similarity_threshold or settings.SIMILARITY_THRESHOLD
    
    def detect(self, document: Document) -> Tuple[float, str, List[RedundancyDetection]]:
        """
        Detect redundancy with previous documents.
        
        Returns:
            (redundancy_score: 0-1, explanation: str, redundancies: List)
        """
        user = document.user
        
        # Get embeddings for this document
        doc_embeddings = Embedding.objects.filter(
            chunk__document=document
        ).select_related('chunk')
        
        if not doc_embeddings.exists():
            return 0.0, "No embeddings available for comparison.", []
        
        # Get average embedding for this document
        doc_vectors = [emb.vector for emb in doc_embeddings]
        doc_vector = np.mean(doc_vectors, axis=0)
        
        # Get previous documents by same user
        previous_docs = Document.objects.filter(
            user=user,
            created_at__lt=document.created_at,
            is_processed=True
        ).order_by('-created_at')[:50]  # Check last 50 documents
        
        redundancies = []
        max_similarity = 0.0
        
        for prev_doc in previous_docs:
            # Get embeddings for previous document
            prev_embeddings = Embedding.objects.filter(
                chunk__document=prev_doc
            )
            
            if not prev_embeddings.exists():
                continue
            
            prev_vectors = [emb.vector for emb in prev_embeddings]
            prev_vector = np.mean(prev_vectors, axis=0)
            
            # Calculate cosine similarity
            similarity = self._cosine_similarity(doc_vector, prev_vector)
            
            if similarity > max_similarity:
                max_similarity = similarity
            
            # If highly similar, create redundancy detection
            if similarity > self.similarity_threshold:
                # Get concept overlap
                doc_concepts = set(DocumentConcept.objects.filter(
                    document=document
                ).values_list('concept__name', flat=True))
                
                prev_concepts = set(DocumentConcept.objects.filter(
                    document=prev_doc
                ).values_list('concept__name', flat=True))
                
                overlap = doc_concepts.intersection(prev_concepts)
                overlap_pct = len(overlap) / len(doc_concepts) if doc_concepts else 0
                
                explanation = (
                    f"This content is {similarity*100:.0f}% similar to '{prev_doc.title}' "
                    f"from {prev_doc.ingested_at.strftime('%Y-%m-%d')}. "
                    f"They share {len(overlap)} concepts."
                )
                
                redundancy = RedundancyDetection(
                    document=document,
                    similar_to=prev_doc,
                    similarity_score=similarity,
                    overlap_percentage=overlap_pct,
                    repeated_concepts=list(overlap),
                    explanation=explanation
                )
                redundancies.append(redundancy)
        
        # Calculate overall redundancy score
        redundancy_score = max_similarity
        
        # Generate explanation
        if redundancies:
            explanation = f"High redundancy detected: {len(redundancies)} similar document(s) found."
        else:
            explanation = "Low redundancy: This content appears to be unique compared to your recent reading."
        
        logger.info(f"Redundancy score for {document.id}: {redundancy_score:.2f}")
        return redundancy_score, explanation, redundancies
    
    def _cosine_similarity(self, vec1, vec2):
        """Calculate cosine similarity between two vectors."""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)


class CognitiveLoadEstimator:
    """
    Estimate the mental effort required to process content.
    
    Factors:
    - Content length
    - Concept density
    - Sentence complexity
    - Emotional manipulation (adds cognitive tax)
    """
    
    def estimate(self, document: Document) -> Tuple[float, str]:
        """
        Estimate cognitive load.
        
        Returns:
            (load_score: 0-1, explanation: str)
        """
        # Factor 1: Length (very long = higher load)
        word_count = document.word_count
        if word_count < 500:
            length_load = 0.2
        elif word_count < 1500:
            length_load = 0.5
        elif word_count < 3000:
            length_load = 0.7
        else:
            length_load = 0.9
        
        # Factor 2: Concept density (too many concepts = overwhelming)
        concepts_count = DocumentConcept.objects.filter(document=document).count()
        concept_density = concepts_count / (word_count / 100.0) if word_count > 0 else 0
        
        if concept_density > 8:
            concept_load = 0.9
        elif concept_density > 5:
            concept_load = 0.6
        else:
            concept_load = 0.3
        
        # Factor 3: Emotional patterns (manipulation taxes cognition)
        from analysis.models import EmotionalPattern
        emotional_patterns = EmotionalPattern.objects.filter(document=document).count()
        emotional_load = min(1.0, emotional_patterns * 0.3)
        
        # Weighted combination
        cognitive_load = (length_load * 0.4) + (concept_load * 0.4) + (emotional_load * 0.2)
        
        # Generate explanation
        factors = []
        if length_load > 0.6:
            factors.append(f"lengthy content ({word_count} words)")
        if concept_load > 0.6:
            factors.append("high concept density")
        if emotional_load > 0.3:
            factors.append("emotional content")
        
        if cognitive_load > 0.7:
            explanation = f"High cognitive load: {', '.join(factors)}. Consider taking breaks."
        elif cognitive_load > 0.4:
            explanation = f"Moderate cognitive load: {', '.join(factors) if factors else 'Manageable complexity'}."
        else:
            explanation = "Low cognitive load: Easy to process and digest."
        
        logger.debug(f"Cognitive load for {document.id}: {cognitive_load:.2f}")
        return cognitive_load, explanation


def calculate_document_scores(document: Document) -> DocumentScore:
    """
    Calculate all scores for a document.
    
    Main entry point for scoring system.
    """
    novelty_scorer = NoveltyScorer()
    depth_scorer = DepthScorer()
    redundancy_detector = RedundancyDetector()
    cognitive_estimator = CognitiveLoadEstimator()
    
    # Calculate individual scores
    novelty_score, novelty_explanation = novelty_scorer.score(document)
    depth_score, depth_explanation = depth_scorer.score(document)
    redundancy_score, redundancy_explanation, redundancies = redundancy_detector.detect(document)
    cognitive_load, cognitive_explanation = cognitive_estimator.estimate(document)
    
    # Save redundancies
    if redundancies:
        RedundancyDetection.objects.bulk_create(redundancies)
    
    # Calculate overall value score
    # Higher novelty and depth = more value
    # Higher redundancy = less value
    # Cognitive load is informational, not part of value
    weights = settings.SCORING_WEIGHTS
    overall_value = (
        novelty_score * weights['novelty'] +
        depth_score * weights['depth'] -
        redundancy_score * weights['redundancy']
    )
    overall_value = max(0.0, min(1.0, overall_value))  # Clamp to 0-1
    
    # Create or update score
    score, created = DocumentScore.objects.update_or_create(
        document=document,
        defaults={
            'novelty_score': novelty_score,
            'depth_score': depth_score,
            'redundancy_score': redundancy_score,
            'cognitive_load_score': cognitive_load,
            'overall_value_score': overall_value,
            'novelty_explanation': novelty_explanation,
            'depth_explanation': depth_explanation,
            'redundancy_explanation': redundancy_explanation,
            'cognitive_load_explanation': cognitive_explanation,
        }
    )
    
    logger.info(f"Calculated scores for document {document.id}: overall_value={overall_value:.2f}")
    return score
