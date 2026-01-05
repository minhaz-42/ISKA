"""
NLP and concept extraction services.

Uses spaCy for:
- Named entity recognition
- Noun phrase extraction
- Sentence segmentation

Uses sentence-transformers for:
- Semantic embeddings
- Similarity search
"""

import logging
import spacy
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple
from collections import Counter
from django.conf import settings
from .models import Concept, DocumentConcept, Claim, Embedding, EmotionalPattern
from ingestion.models import Document, ContentChunk

logger = logging.getLogger('pkf.analysis')


class NLPProcessor:
    """
    Main NLP processing service.
    
    Handles concept extraction, embedding generation, and claim detection.
    """
    
    def __init__(self):
        # Load spaCy model
        try:
            self.nlp = spacy.load(settings.SPACY_MODEL)
            logger.info(f"Loaded spaCy model: {settings.SPACY_MODEL}")
        except OSError:
            logger.error(f"spaCy model {settings.SPACY_MODEL} not found. Run: python -m spacy download {settings.SPACY_MODEL}")
            self.nlp = None
        
        # Load sentence transformer
        try:
            self.embedding_model = SentenceTransformer(settings.SENTENCE_TRANSFORMER_MODEL)
            logger.info(f"Loaded embedding model: {settings.SENTENCE_TRANSFORMER_MODEL}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            self.embedding_model = None
    
    def extract_concepts(self, document: Document) -> List[DocumentConcept]:
        """
        Extract concepts from document.
        
        Strategy:
        - Named entities (people, organizations, locations)
        - Noun phrases (important topics)
        - Deduplicate and normalize
        
        Returns list of DocumentConcept objects (not saved).
        """
        if not self.nlp:
            logger.error("spaCy model not loaded")
            return []
        
        doc = self.nlp(document.normalized_content)
        
        # Extract entities
        concepts_dict = {}
        
        # Named entities
        for ent in doc.ents:
            if ent.label_ in ['PERSON', 'ORG', 'GPE', 'EVENT', 'PRODUCT', 'LAW']:
                normalized = self._normalize_concept(ent.text)
                if normalized:
                    concepts_dict[normalized] = concepts_dict.get(normalized, 0) + 1
        
        # Noun phrases (limit to important ones)
        for chunk in doc.noun_chunks:
            # Filter out very short or common phrases
            if len(chunk.text.split()) >= 2:
                normalized = self._normalize_concept(chunk.text)
                if normalized and len(normalized) > 3:
                    concepts_dict[normalized] = concepts_dict.get(normalized, 0) + 1
        
        # Create or get Concept objects
        document_concepts = []
        for concept_name, count in concepts_dict.items():
            concept, created = Concept.objects.get_or_create(
                normalized_name=concept_name,
                defaults={'name': concept_name}
            )
            
            # Update concept statistics
            if not created:
                concept.total_mentions += count
                concept.document_count += 1
                concept.save()
            
            # Calculate relevance (simple frequency-based for now)
            total_words = document.word_count
            relevance = min(1.0, count / (total_words / 100.0))
            
            doc_concept = DocumentConcept(
                document=document,
                concept=concept,
                mention_count=count,
                relevance_score=relevance
            )
            document_concepts.append(doc_concept)
        
        logger.info(f"Extracted {len(document_concepts)} concepts from document {document.id}")
        return document_concepts
    
    def generate_embeddings(self, document: Document) -> List[Embedding]:
        """
        Generate embeddings for all chunks of a document.
        
        Returns list of Embedding objects (not saved).
        """
        if not self.embedding_model:
            logger.error("Embedding model not loaded")
            return []
        
        chunks = document.chunks.all()
        
        if not chunks:
            logger.warning(f"No chunks found for document {document.id}")
            return []
        
        # Get texts
        texts = [chunk.text for chunk in chunks]
        
        # Generate embeddings
        try:
            vectors = self.embedding_model.encode(texts, show_progress_bar=False)
            
            embeddings = []
            for chunk, vector in zip(chunks, vectors):
                embedding = Embedding(
                    chunk=chunk,
                    vector=vector.tolist(),
                    model_name=settings.SENTENCE_TRANSFORMER_MODEL,
                    vector_dimension=len(vector)
                )
                embeddings.append(embedding)
                
                # Mark chunk as having embedding
                chunk.embedding_generated = True
                chunk.save()
            
            logger.info(f"Generated {len(embeddings)} embeddings for document {document.id}")
            return embeddings
        
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            return []
    
    def extract_claims(self, document: Document) -> List[Claim]:
        """
        Extract factual claims from document.
        
        Strategy:
        - Identify sentences with factual statements
        - Look for statistics, dates, concrete information
        - Avoid pure opinion sentences
        
        Returns list of Claim objects (not saved).
        """
        if not self.nlp:
            logger.error("spaCy model not loaded")
            return []
        
        doc = self.nlp(document.normalized_content)
        
        claims = []
        
        for sent in doc.sents:
            # Check if sentence likely contains a claim
            if self._is_factual_sentence(sent):
                claim_type = self._classify_claim(sent)
                
                claim = Claim(
                    document=document,
                    text=sent.text,
                    normalized_text=sent.text.lower().strip(),
                    claim_type=claim_type,
                    confidence_score=0.7,  # Placeholder
                )
                claims.append(claim)
        
        logger.info(f"Extracted {len(claims)} claims from document {document.id}")
        return claims
    
    def detect_emotional_patterns(self, document: Document) -> List[EmotionalPattern]:
        """
        Detect emotional manipulation patterns.
        
        This is NOT about detecting opinions or political bias.
        This detects manipulation tactics like:
        - Excessive exclamation points
        - Fear-mongering keywords
        - Urgency manipulation
        - Clickbait language
        
        Returns list of EmotionalPattern objects (not saved).
        """
        content = document.normalized_content
        patterns = []
        
        # Pattern: Outrage bait
        outrage_keywords = [
            'outrageous', 'shocking', 'unbelievable', 'insane', 'crazy',
            'you won\'t believe', 'disgusting', 'horrifying'
        ]
        outrage_matches = self._find_keyword_matches(content, outrage_keywords)
        if outrage_matches:
            patterns.append(EmotionalPattern(
                document=document,
                pattern_type='outrage',
                matched_phrases=outrage_matches,
                context=self._get_context(content, outrage_matches[0]),
                intensity_score=min(1.0, len(outrage_matches) / 5.0),
                explanation="This content uses outrage-inducing language that may trigger emotional responses rather than thoughtful analysis."
            ))
        
        # Pattern: False urgency
        urgency_keywords = [
            'act now', 'hurry', 'limited time', 'don\'t miss',
            'urgent', 'immediately', 'breaking'
        ]
        urgency_matches = self._find_keyword_matches(content, urgency_keywords)
        if urgency_matches:
            patterns.append(EmotionalPattern(
                document=document,
                pattern_type='urgency',
                matched_phrases=urgency_matches,
                context=self._get_context(content, urgency_matches[0]),
                intensity_score=min(1.0, len(urgency_matches) / 3.0),
                explanation="Uses urgency language that may pressure quick reactions rather than careful consideration."
            ))
        
        # Pattern: Hyperbole (excessive exclamation points)
        exclamation_count = content.count('!')
        if exclamation_count > 5:
            patterns.append(EmotionalPattern(
                document=document,
                pattern_type='hyperbole',
                matched_phrases=[f"{exclamation_count} exclamation points"],
                context="",
                intensity_score=min(1.0, exclamation_count / 20.0),
                explanation="Excessive use of exclamation points may indicate emotional rather than informational content."
            ))
        
        logger.info(f"Detected {len(patterns)} emotional patterns in document {document.id}")
        return patterns
    
    def _normalize_concept(self, text: str) -> str:
        """Normalize concept name for deduplication."""
        # Convert to lowercase, strip whitespace
        normalized = text.lower().strip()
        
        # Remove common words
        stop_words = {'the', 'a', 'an', 'this', 'that', 'these', 'those'}
        words = normalized.split()
        words = [w for w in words if w not in stop_words]
        
        return ' '.join(words)
    
    def _is_factual_sentence(self, sent) -> bool:
        """Check if sentence likely contains factual information."""
        # Look for indicators of factual content
        has_numbers = any(token.like_num for token in sent)
        has_entities = len(sent.ents) > 0
        has_verbs = any(token.pos_ == 'VERB' for token in sent)
        
        # Avoid very short sentences
        if len(sent) < 5:
            return False
        
        return (has_numbers or has_entities) and has_verbs
    
    def _classify_claim(self, sent) -> str:
        """Classify type of claim."""
        text_lower = sent.text.lower()
        
        # Check for statistics
        if any(token.like_num for token in sent):
            if any(word in text_lower for word in ['percent', '%', 'million', 'billion', 'thousand']):
                return 'statistic'
        
        # Check for predictions
        if any(word in text_lower for word in ['will', 'predict', 'forecast', 'expect', 'estimate']):
            return 'prediction'
        
        # Check for opinions
        if any(word in text_lower for word in ['think', 'believe', 'feel', 'opinion', 'should']):
            return 'opinion'
        
        return 'factual'
    
    def _find_keyword_matches(self, text: str, keywords: List[str]) -> List[str]:
        """Find which keywords appear in text."""
        text_lower = text.lower()
        matches = []
        for keyword in keywords:
            if keyword in text_lower:
                matches.append(keyword)
        return matches
    
    def _get_context(self, text: str, keyword: str, context_chars: int = 100) -> str:
        """Get surrounding context for a keyword."""
        text_lower = text.lower()
        idx = text_lower.find(keyword.lower())
        
        if idx == -1:
            return ""
        
        start = max(0, idx - context_chars)
        end = min(len(text), idx + len(keyword) + context_chars)
        
        context = text[start:end]
        if start > 0:
            context = "..." + context
        if end < len(text):
            context = context + "..."
        
        return context


def process_document_analysis(document: Document):
    """
    Run full analysis pipeline on a document.
    
    Steps:
    1. Extract concepts
    2. Generate embeddings
    3. Extract claims
    4. Detect emotional patterns
    """
    processor = NLPProcessor()
    
    # Extract concepts
    concepts = processor.extract_concepts(document)
    if concepts:
        DocumentConcept.objects.bulk_create(concepts)
    
    # Generate embeddings
    embeddings = processor.generate_embeddings(document)
    if embeddings:
        Embedding.objects.bulk_create(embeddings)
    
    # Extract claims
    claims = processor.extract_claims(document)
    if claims:
        Claim.objects.bulk_create(claims)
    
    # Detect emotional patterns
    patterns = processor.detect_emotional_patterns(document)
    if patterns:
        EmotionalPattern.objects.bulk_create(patterns)
    
    logger.info(f"Completed analysis for document {document.id}")
