"""
Text normalization and chunking utilities.

Handles:
- HTML cleaning
- PDF text extraction
- Markdown conversion
- Text chunking for embeddings
"""

import re
from typing import List, Tuple
from bs4 import BeautifulSoup
from pypdf import PdfReader
from io import BytesIO
import html2text


class TextNormalizer:
    """
    Clean and normalize text from various sources.
    
    Principles:
    - Remove formatting but preserve structure
    - Handle various encodings gracefully
    - Preserve semantic meaning
    """
    
    def __init__(self):
        self.html_converter = html2text.HTML2Text()
        self.html_converter.ignore_links = False
        self.html_converter.ignore_images = True
        self.html_converter.body_width = 0  # Don't wrap lines
    
    def normalize_html(self, html_content: str) -> str:
        """Clean HTML and convert to plain text."""
        # Parse HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for element in soup(['script', 'style', 'nav', 'footer', 'header']):
            element.decompose()
        
        # Get text
        text = soup.get_text(separator='\n')
        
        # Clean up whitespace
        text = self._clean_whitespace(text)
        
        return text
    
    def normalize_pdf(self, pdf_file) -> str:
        """Extract text from PDF file."""
        try:
            pdf_reader = PdfReader(pdf_file)
            
            text_parts = []
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            
            full_text = '\n\n'.join(text_parts)
            return self._clean_whitespace(full_text)
        
        except Exception as e:
            raise ValueError(f"Failed to extract PDF text: {str(e)}")
    
    def normalize_markdown(self, markdown_content: str) -> str:
        """
        Convert markdown to plain text while preserving structure.
        """
        # Remove markdown formatting but keep structure
        text = markdown_content
        
        # Remove images
        text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
        
        # Convert links to just text
        text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)
        
        # Remove bold/italic markers
        text = re.sub(r'\*\*\*(.+?)\*\*\*', r'\1', text)
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'__(.+?)__', r'\1', text)
        text = re.sub(r'_(.+?)_', r'\1', text)
        
        # Remove headers markers
        text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
        
        # Clean up
        text = self._clean_whitespace(text)
        
        return text
    
    def normalize_text(self, text: str) -> str:
        """Clean and normalize plain text."""
        text = self._remove_urls(text)
        text = self._clean_whitespace(text)
        return text
    
    def _clean_whitespace(self, text: str) -> str:
        """Remove excessive whitespace while preserving paragraph breaks."""
        # Replace multiple spaces with single space
        text = re.sub(r' +', ' ', text)
        
        # Replace multiple newlines with max 2 newlines
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def _remove_urls(self, text: str) -> str:
        """Remove URLs from text (optional - can be configured)."""
        # Pattern for URLs
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        text = re.sub(url_pattern, '', text)
        return text


class TextChunker:
    """
    Split documents into semantic chunks for embedding.
    
    Strategy:
    - Prefer paragraph boundaries
    - Target chunk size for optimal embedding
    - Maintain some overlap for context
    """
    
    def __init__(
        self,
        chunk_size: int = 500,  # Target words per chunk
        overlap: int = 50,       # Overlap words between chunks
        min_chunk_size: int = 100  # Minimum words in a chunk
    ):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.min_chunk_size = min_chunk_size
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks.
        
        Returns list of text chunks.
        """
        # Split by paragraphs first
        paragraphs = self._split_paragraphs(text)
        
        chunks = []
        current_chunk = []
        current_word_count = 0
        
        for paragraph in paragraphs:
            words = paragraph.split()
            word_count = len(words)
            
            # If adding this paragraph exceeds chunk size
            if current_word_count + word_count > self.chunk_size:
                # Save current chunk if it meets minimum
                if current_word_count >= self.min_chunk_size:
                    chunks.append(' '.join(current_chunk))
                    
                    # Start new chunk with overlap from previous
                    overlap_words = current_chunk[-self.overlap:] if len(current_chunk) > self.overlap else []
                    current_chunk = overlap_words + words
                    current_word_count = len(current_chunk)
                else:
                    # Current chunk too small, just add paragraph
                    current_chunk.extend(words)
                    current_word_count += word_count
            else:
                # Add paragraph to current chunk
                current_chunk.extend(words)
                current_word_count += word_count
        
        # Add final chunk
        if current_word_count >= self.min_chunk_size:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def _split_paragraphs(self, text: str) -> List[str]:
        """Split text by paragraph breaks."""
        # Split on double newlines
        paragraphs = re.split(r'\n\s*\n', text)
        
        # Filter out empty paragraphs
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        
        return paragraphs


def extract_title(content: str, max_length: int = 100) -> str:
    """
    Extract or generate a title from content.
    
    Strategy:
    - Look for first heading
    - Fall back to first sentence
    - Truncate if too long
    """
    lines = content.split('\n')
    
    # Look for first non-empty line
    for line in lines:
        line = line.strip()
        if line:
            # Remove markdown headers
            line = re.sub(r'^#+\s+', '', line)
            
            # Truncate if needed
            if len(line) > max_length:
                line = line[:max_length-3] + '...'
            
            return line
    
    return "Untitled Document"


def calculate_content_metrics(text: str) -> dict:
    """
    Calculate basic metrics for text content.
    
    Returns:
        dict with word_count, char_count, estimated_read_time
    """
    words = text.split()
    word_count = len(words)
    char_count = len(text)
    
    # Estimate reading time (200 words per minute)
    read_time = max(1, word_count // 200)
    
    return {
        'word_count': word_count,
        'char_count': char_count,
        'estimated_read_time': read_time,
    }
