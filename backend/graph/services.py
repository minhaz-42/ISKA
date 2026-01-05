"""
Knowledge graph construction and analysis services.

Uses NetworkX for graph operations:
- Building concept networks
- Finding relationships
- Calculating centrality
- Detecting communities
"""

import logging
import networkx as nx
from typing import List, Dict, Tuple
from collections import Counter
from django.db.models import Count, Q
from .models import ConceptRelationship, UserKnowledgeGraph, ConceptEvolution
from analysis.models import Concept, DocumentConcept
from ingestion.models import Document
from django.contrib.auth.models import User

logger = logging.getLogger('pkf.graph')


class GraphBuilder:
    """
    Build and maintain a user's personal knowledge graph.
    
    Strategy:
    - Create nodes for concepts
    - Create edges for co-occurrence
    - Weight edges by source quality
    - Update graph incrementally as new content is added
    """
    
    def __init__(self, user: User):
        self.user = user
        self.graph = nx.Graph()
    
    def build_graph(self) -> nx.Graph:
        """
        Build complete knowledge graph for user.
        
        Returns NetworkX graph object.
        """
        # Get all concepts for this user
        user_concepts = Concept.objects.filter(
            documents__document__user=self.user
        ).distinct()
        
        # Add nodes
        for concept in user_concepts:
            self.graph.add_node(
                concept.id,
                name=concept.name,
                document_count=concept.document_count,
                total_mentions=concept.total_mentions
            )
        
        # Find relationships (co-occurrence in documents)
        relationships = self._find_concept_relationships()
        
        # Add edges
        for rel in relationships:
            self.graph.add_edge(
                rel['concept_a_id'],
                rel['concept_b_id'],
                weight=rel['strength'],
                co_occurrence=rel['co_occurrence'],
                weighted_strength=rel['weighted_strength']
            )
        
        logger.info(f"Built graph for {self.user.username}: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges")
        return self.graph
    
    def _find_concept_relationships(self) -> List[Dict]:
        """
        Find relationships between concepts based on co-occurrence.
        
        Returns list of relationship dictionaries.
        """
        # Get all documents for this user
        documents = Document.objects.filter(user=self.user, is_processed=True)
        
        relationships_dict = {}
        
        for doc in documents:
            # Get concepts in this document
            doc_concepts = list(DocumentConcept.objects.filter(
                document=doc
            ).select_related('concept'))
            
            # Source quality weight (long-form > social media)
            source_weight = self._get_source_weight(doc)
            
            # Create relationships for all pairs
            for i, dc1 in enumerate(doc_concepts):
                for dc2 in doc_concepts[i+1:]:
                    # Sort IDs to avoid duplicates
                    id_pair = tuple(sorted([dc1.concept.id, dc2.concept.id]))
                    
                    if id_pair not in relationships_dict:
                        relationships_dict[id_pair] = {
                            'concept_a_id': id_pair[0],
                            'concept_b_id': id_pair[1],
                            'co_occurrence': 0,
                            'strength': 0.0,
                            'weighted_strength': 0.0,
                        }
                    
                    relationships_dict[id_pair]['co_occurrence'] += 1
                    relationships_dict[id_pair]['weighted_strength'] += source_weight
        
        # Calculate final strengths
        for rel in relationships_dict.values():
            # Strength based on co-occurrence (normalized)
            rel['strength'] = min(1.0, rel['co_occurrence'] / 5.0)
            # Weighted strength already accumulated
            rel['weighted_strength'] = min(1.0, rel['weighted_strength'] / 10.0)
        
        return list(relationships_dict.values())
    
    def _get_source_weight(self, document: Document) -> float:
        """
        Calculate quality weight for a source.
        
        Strategy:
        - Long-form sources (>1000 words): 1.0
        - Medium sources (500-1000 words): 0.7
        - Short sources (200-500 words): 0.4
        - Very short/social (<200 words): 0.2
        """
        word_count = document.word_count
        
        if word_count > 1000:
            return 1.0
        elif word_count > 500:
            return 0.7
        elif word_count > 200:
            return 0.4
        else:
            return 0.2
    
    def save_relationships(self):
        """
        Save relationships to database.
        """
        # Get or create relationships
        for edge in self.graph.edges(data=True):
            concept_a_id, concept_b_id, data = edge
            
            concept_a = Concept.objects.get(id=concept_a_id)
            concept_b = Concept.objects.get(id=concept_b_id)
            
            ConceptRelationship.objects.update_or_create(
                concept_a=concept_a,
                concept_b=concept_b,
                relationship_type='related',
                defaults={
                    'strength': data['weight'],
                    'co_occurrence_count': data['co_occurrence'],
                    'weighted_strength': data['weighted_strength'],
                }
            )
        
        logger.info(f"Saved {self.graph.number_of_edges()} relationships for {self.user.username}")
    
    def get_central_concepts(self, top_n: int = 10) -> List[Tuple[str, float]]:
        """
        Find most central concepts in the graph.
        
        Uses degree centrality (most connected concepts).
        
        Returns list of (concept_name, centrality_score) tuples.
        """
        if self.graph.number_of_nodes() == 0:
            return []
        
        centrality = nx.degree_centrality(self.graph)
        
        # Sort by centrality
        sorted_concepts = sorted(
            centrality.items(),
            key=lambda x: x[1],
            reverse=True
        )[:top_n]
        
        # Get concept names
        result = []
        for concept_id, score in sorted_concepts:
            node_data = self.graph.nodes[concept_id]
            result.append((node_data['name'], score))
        
        return result
    
    def find_related_concepts(self, concept: Concept, max_results: int = 10) -> List[Tuple[Concept, float]]:
        """
        Find concepts related to a given concept.
        
        Returns list of (Concept, strength) tuples.
        """
        if concept.id not in self.graph:
            return []
        
        # Get neighbors
        neighbors = self.graph[concept.id]
        
        # Sort by edge weight
        related = []
        for neighbor_id, edge_data in neighbors.items():
            neighbor_concept = Concept.objects.get(id=neighbor_id)
            strength = edge_data.get('weighted_strength', edge_data.get('weight', 0))
            related.append((neighbor_concept, strength))
        
        related.sort(key=lambda x: x[1], reverse=True)
        
        return related[:max_results]
    
    def update_graph_metadata(self):
        """
        Update UserKnowledgeGraph metadata.
        """
        top_concepts = self.get_central_concepts(10)
        
        graph_meta, created = UserKnowledgeGraph.objects.update_or_create(
            user=self.user,
            defaults={
                'total_concepts': self.graph.number_of_nodes(),
                'total_relationships': self.graph.number_of_edges(),
                'total_documents': Document.objects.filter(user=self.user).count(),
                'top_concepts': [
                    {'name': name, 'centrality': score}
                    for name, score in top_concepts
                ],
            }
        )
        
        logger.info(f"Updated graph metadata for {self.user.username}")
        return graph_meta


def build_user_graph(user: User) -> nx.Graph:
    """
    Main entry point: Build and save a user's knowledge graph.
    
    Returns the NetworkX graph object.
    """
    builder = GraphBuilder(user)
    graph = builder.build_graph()
    builder.save_relationships()
    builder.update_graph_metadata()
    
    return graph


def update_concept_evolution(document: Document):
    """
    Track how a concept's understanding evolves with a new document.
    """
    user = document.user
    
    # Get concepts in this document
    doc_concepts = DocumentConcept.objects.filter(
        document=document
    ).select_related('concept')
    
    for doc_concept in doc_concepts:
        concept = doc_concept.concept
        
        # Get related concepts
        builder = GraphBuilder(user)
        builder.build_graph()
        related = builder.find_related_concepts(concept, max_results=5)
        
        related_data = [
            {'name': c.name, 'strength': strength}
            for c, strength in related
        ]
        
        # Get understanding depth (how many times seen)
        depth = DocumentConcept.objects.filter(
            document__user=user,
            concept=concept,
            document__created_at__lte=document.created_at
        ).count()
        
        # Create evolution record
        ConceptEvolution.objects.create(
            user=user,
            concept=concept,
            document=document,
            related_concepts=related_data,
            understanding_depth=depth
        )
    
    logger.info(f"Updated concept evolution for document {document.id}")
