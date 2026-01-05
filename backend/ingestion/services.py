"""
Services for processing documents.

Orchestrates normalization, chunking, and storage.
"""

import logging
from typing import Tuple, Optional
from io import BytesIO

from django.core.files.uploadedfile import UploadedFile
from .models import Document, ContentChunk
from .normalization import TextNormalizer, TextChunker, extract_title, calculate_content_metrics

logger = logging.getLogger('pkf.ingestion')


class DocumentProcessor:
    """
    Main service for processing ingested documents.
    
    Workflow:
    1. Extract/normalize text based on content type
    2. Calculate metrics
    3. Generate title if needed
    4. Create chunks
    5. Save to database
    """
    
    def __init__(self):
        self.normalizer = TextNormalizer()
        self.chunker = TextChunker()
    
    def process_uploaded_file(
        self,
        file: UploadedFile,
        user,
        content_type: str
    ) -> Tuple[Document, bool]:
        """
        Process an uploaded file.
        
        Returns:
            (Document, success: bool)
        """
        try:
            raw_bytes = file.read()

            if content_type == 'auto':
                content_type = self._detect_upload_type(raw_bytes, filename=getattr(file, 'name', None))

            # Extract/normalize text based on file type
            if content_type == 'pdf':
                # PdfReader needs a seekable stream; file has been consumed by read().
                normalized_content = self.normalizer.normalize_pdf(BytesIO(raw_bytes))
                raw_content = ''
            elif content_type == 'docx':
                raw_content = ''
                normalized_content = self.normalizer.normalize_text(self._extract_docx_text(raw_bytes))
            elif content_type == 'html':
                raw_content = self._decode_uploaded_text(raw_bytes, filename=getattr(file, 'name', None), content_type=content_type)
                normalized_content = self.normalizer.normalize_html(raw_content)
            elif content_type in {'text', 'markdown'}:
                # Defensive decode: user may upload non-UTF8 or even a binary file.
                raw_content = self._decode_uploaded_text(raw_bytes, filename=getattr(file, 'name', None), content_type=content_type)
                if content_type == 'text':
                    normalized_content = self.normalizer.normalize_text(raw_content)
                else:
                    normalized_content = self.normalizer.normalize_markdown(raw_content)
            else:
                raise ValueError(f"Unsupported content type: {content_type}")

            # Reset file pointer so Django can save it to storage.
            try:
                file.seek(0)
            except Exception:
                pass
            
            # Extract title
            title = extract_title(normalized_content)
            
            # Calculate metrics
            metrics = calculate_content_metrics(normalized_content)
            
            # Create document
            document = Document.objects.create(
                user=user,
                title=title,
                content_type=content_type,
                source_type='upload',
                raw_content=raw_content,
                normalized_content=normalized_content,
                file=file,
                file_size=file.size,
                word_count=metrics['word_count'],
                char_count=metrics['char_count'],
                estimated_read_time=metrics['estimated_read_time'],
                is_processed=False,
            )
            
            # Create chunks
            self._create_chunks(document)
            
            document.is_processed = True
            document.save()
            
            logger.info(f"Successfully processed document: {document.id}")
            return document, True
        
        except Exception as e:
            logger.error(f"Failed to process file: {str(e)}")
            
            # Create document with error
            document = Document.objects.create(
                user=user,
                title="Processing Failed",
                content_type=content_type,
                source_type='upload',
                raw_content="",
                processing_error=str(e),
                is_processed=False,
            )
            
            return document, False

    @staticmethod
    def _detect_upload_type(raw_bytes: bytes, filename: str | None) -> str:
        name = (filename or '').lower()
        if raw_bytes.startswith(b'%PDF-') or name.endswith('.pdf'):
            return 'pdf'
        if raw_bytes.startswith(b'PK\x03\x04') and (name.endswith('.docx') or name.endswith('.pptx') or name.endswith('.xlsx')):
            # We only support docx extraction; others should error clearly later.
            return 'docx'
        if name.endswith('.md') or name.endswith('.markdown'):
            return 'markdown'
        if name.endswith('.html') or name.endswith('.htm'):
            return 'html'
        return 'text'

    @staticmethod
    def _extract_docx_text(raw_bytes: bytes) -> str:
        try:
            from docx import Document as DocxDocument
        except Exception as e:
            raise ValueError('DOCX support is not installed. Install python-docx and try again.') from e

        try:
            doc = DocxDocument(BytesIO(raw_bytes))
            parts = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
            if not parts:
                raise ValueError('No readable text found in DOCX.')
            return '\n\n'.join(parts)
        except Exception as e:
            raise ValueError(f'Failed to extract DOCX text: {str(e)}')

    @staticmethod
    def _decode_uploaded_text(raw_bytes: bytes, filename: str | None, content_type: str) -> str:
        """Best-effort decode for uploaded text/markdown files.

        If the file looks binary (PDF/ZIP/etc), raise a ValueError with a
        human-friendly message so the API returns a clear 400 error.
        """
        # Quick binary signatures
        if raw_bytes.startswith(b'%PDF-'):
            raise ValueError('This file looks like a PDF. Please choose content type "pdf".')
        if raw_bytes.startswith(b'PK\x03\x04'):
            if content_type == 'docx':
                raise ValueError('This file looks like a DOCX. Please choose content type "docx".')
            raise ValueError('This file looks like a ZIP/Word document. Please choose content type "docx" or convert it to text/markdown before uploading.')
        if b'\x00' in raw_bytes[:2048]:
            raise ValueError('This file does not look like plain text. Please upload a .txt/.md file or choose the correct content type.')

        # Heuristic: if too many non-text bytes, likely not a real text file.
        sample = raw_bytes[:4096]
        if sample:
            textish = sum((b in b'\t\n\r' or 32 <= b <= 126) for b in sample)
            ratio = textish / len(sample)
            if ratio < 0.65 and content_type != 'html':
                name_hint = f" ({filename})" if filename else ''
                raise ValueError(f"Uploaded file{name_hint} does not look like {content_type}. Please upload plain text or markdown.")

        for enc in ('utf-8', 'utf-8-sig'):
            try:
                return raw_bytes.decode(enc)
            except UnicodeDecodeError:
                continue

        # Fallback: preserve bytes without failing.
        return raw_bytes.decode('latin-1')
    
    def process_pasted_content(
        self,
        content: str,
        user,
        content_type: str,
        title: Optional[str] = None,
        source_url: Optional[str] = None,
        source_name: Optional[str] = None,
    ) -> Tuple[Document, bool]:
        """
        Process pasted text content.
        
        Returns:
            (Document, success: bool)
        """
        try:
            # Normalize based on type
            if content_type == 'web':
                # Assume HTML if from web
                normalized_content = self.normalizer.normalize_html(content)
            elif content_type == 'social':
                normalized_content = self.normalizer.normalize_text(content)
            elif content_type == 'markdown':
                normalized_content = self.normalizer.normalize_markdown(content)
            else:
                normalized_content = self.normalizer.normalize_text(content)
            
            # Extract or use provided title
            if not title:
                title = extract_title(normalized_content)
            
            # Calculate metrics
            metrics = calculate_content_metrics(normalized_content)
            
            # Create document
            document = Document.objects.create(
                user=user,
                title=title,
                content_type=content_type,
                source_type='paste',
                raw_content=content,
                normalized_content=normalized_content,
                source_url=source_url,
                source_name=source_name,
                word_count=metrics['word_count'],
                char_count=metrics['char_count'],
                estimated_read_time=metrics['estimated_read_time'],
                is_processed=False,
            )
            
            # Create chunks
            self._create_chunks(document)
            
            document.is_processed = True
            document.save()
            
            logger.info(f"Successfully processed pasted content: {document.id}")
            return document, True
        
        except Exception as e:
            logger.error(f"Failed to process pasted content: {str(e)}")
            
            document = Document.objects.create(
                user=user,
                title=title or "Processing Failed",
                content_type=content_type,
                source_type='paste',
                raw_content=content,
                processing_error=str(e),
                is_processed=False,
            )
            
            return document, False
    
    def _create_chunks(self, document: Document):
        """Create ContentChunk objects for a document."""
        chunks = self.chunker.chunk_text(document.normalized_content)
        
        chunk_objects = []
        for idx, chunk_text in enumerate(chunks):
            chunk = ContentChunk(
                document=document,
                text=chunk_text,
                chunk_index=idx,
                word_count=len(chunk_text.split()),
                char_count=len(chunk_text),
            )
            chunk_objects.append(chunk)
        
        ContentChunk.objects.bulk_create(chunk_objects)
        
        logger.debug(f"Created {len(chunk_objects)} chunks for document {document.id}")
