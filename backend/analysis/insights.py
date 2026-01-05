"""Insight generation (explanation-first).

This module intentionally avoids making truth claims.
It only flags *signals* and always returns:
- why (explanation)
- how confident (0..1)
- what text it applies to (affected_text)

Used by:
- Live Monitor snippet analysis (no DB writes by default)
- Document insight cards (derived from existing scores)
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from enum import Enum
import hashlib
import re
import uuid
from typing import Iterable, List, Optional, Sequence, Set, Dict, Any


class InsightType(str, Enum):
    MISINFORMATION = "misinformation"
    AI = "ai"
    REPETITION = "repetition"
    COGNITIVE_LOAD = "cognitive_load"


@dataclass(frozen=True)
class Insight:
    id: str
    type: InsightType
    confidence: float
    explanation: str
    affected_text: str
    created_at: str

    def to_dict(self) -> Dict[str, Any]:
        payload = asdict(self)
        payload["type"] = self.type.value
        return payload


URGENCY_WORDS = {
    "act now",
    "urgent",
    "immediately",
    "must",
    "right now",
    "before it's too late",
    "shocking",
    "you won't believe",
    "wake up",
    "they don't want you to know",
}

AI_PHRASES = {
    "in conclusion",
    "as an ai",
    "it is important to note",
    "overall",
    "to summarize",
    "in summary",
    "additionally",
    "moreover",
    "furthermore",
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _truncate(text: str, max_len: int = 320) -> str:
    t = " ".join(text.split())
    if len(t) <= max_len:
        return t
    return t[: max_len - 1].rstrip() + "…"


def hash_text(text: str) -> str:
    # stable hash for dedupe
    normalized = " ".join(text.split()).strip().lower()
    return hashlib.sha256(normalized.encode("utf-8", errors="ignore")).hexdigest()


def analyze_snippet(
    text: str,
    *,
    seen_hashes: Optional[Set[str]] = None,
    enable_ai: bool = True,
    enable_misinfo: bool = True,
    enable_emotion: bool = True,
) -> List[Insight]:
    """Analyze a short visible snippet and return insight objects.

    This is designed to be fast and safe:
    - No database writes
    - Pure heuristic signals (for now)
    """

    cleaned = " ".join((text or "").split()).strip()
    if not cleaned:
        return []

    snippet_hash = hash_text(cleaned)
    insights: List[Insight] = []
    created_at = _now_iso()

    # Repetition signal (very cheap)
    if seen_hashes is not None:
        if snippet_hash in seen_hashes:
            insights.append(
                Insight(
                    id=str(uuid.uuid4()),
                    type=InsightType.REPETITION,
                    confidence=0.75,
                    explanation="This looks very similar to something you just saw. Repetition can reduce signal and increase mental fatigue.",
                    affected_text=_truncate(cleaned),
                    created_at=created_at,
                )
            )
        else:
            seen_hashes.add(snippet_hash)

    # Cognitive load: long sentences, dense punctuation
    words = cleaned.split()
    word_count = len(words)
    avg_word_len = sum(len(w) for w in words) / word_count if word_count else 0
    sentences = [s for s in re.split(r"[.!?]+", cleaned) if s.strip()]
    avg_sentence_words = (sum(len(s.split()) for s in sentences) / len(sentences)) if sentences else word_count

    load_score = 0.0
    if word_count >= 90:
        load_score += 0.35
    if avg_sentence_words >= 22:
        load_score += 0.35
    if avg_word_len >= 5.3:
        load_score += 0.15
    if cleaned.count(",") >= 6:
        load_score += 0.15

    if load_score >= 0.55:
        insights.append(
            Insight(
                id=str(uuid.uuid4()),
                type=InsightType.COGNITIVE_LOAD,
                confidence=min(0.9, max(0.55, load_score)),
                explanation="This snippet looks mentally dense (long sentences / lots of clauses). Consider slowing down or taking breaks.",
                affected_text=_truncate(cleaned),
                created_at=created_at,
            )
        )

    # Persuasion / misinformation-adjacent signals
    if enable_misinfo or enable_emotion:
        lower = cleaned.lower()
        exclam = cleaned.count("!")
        caps_words = [w for w in re.findall(r"\b[A-Z]{4,}\b", cleaned) if w.isalpha()]
        urgency_hits = [p for p in URGENCY_WORDS if p in lower]

        score = 0.0
        if exclam >= 3:
            score += 0.25
        if len(caps_words) >= 2:
            score += 0.25
        if urgency_hits:
            score += 0.35
        if "?" in cleaned and exclam:
            score += 0.10

        if score >= 0.45:
            why_bits: List[str] = []
            if urgency_hits:
                why_bits.append("urgency phrasing")
            if exclam >= 3:
                why_bits.append("heavy exclamation")
            if len(caps_words) >= 2:
                why_bits.append("all-caps emphasis")
            why = ", ".join(why_bits) if why_bits else "persuasion-style formatting"

            insights.append(
                Insight(
                    id=str(uuid.uuid4()),
                    type=InsightType.MISINFORMATION,
                    confidence=min(0.85, max(0.45, score)),
                    explanation=(
                        "This resembles persuasion/emotional framing signals (" + why + "). "
                        "This is not a truth judgment—just a pattern warning with reasons."
                    ),
                    affected_text=_truncate(cleaned),
                    created_at=created_at,
                )
            )

    # AI-generated signals (heuristics only)
    if enable_ai:
        lower = cleaned.lower()
        phrase_hits = [p for p in AI_PHRASES if p in lower]
        bulletish = len(re.findall(r"(^|\n)\s*[-*]\s+", text))
        repeated_transitions = sum(lower.count(p) for p in ("additionally", "moreover", "furthermore"))

        ai_score = 0.0
        if phrase_hits:
            ai_score += 0.35
        if repeated_transitions >= 2:
            ai_score += 0.25
        if bulletish >= 3:
            ai_score += 0.10
        if avg_sentence_words >= 24:
            ai_score += 0.10

        if ai_score >= 0.50:
            bits: List[str] = []
            if phrase_hits:
                bits.append("templated phrasing")
            if repeated_transitions >= 2:
                bits.append("repeated transitions")
            if avg_sentence_words >= 24:
                bits.append("very uniform long sentences")
            why = ", ".join(bits) if bits else "stylistic signals"

            insights.append(
                Insight(
                    id=str(uuid.uuid4()),
                    type=InsightType.AI,
                    confidence=min(0.85, max(0.50, ai_score)),
                    explanation=(
                        "This text shows signals that can resemble AI-generated writing (" + why + "). "
                        "This can be wrong—treat it as a gentle prompt to verify." 
                    ),
                    affected_text=_truncate(cleaned),
                    created_at=created_at,
                )
            )

    return insights


def insights_from_document_explanations(
    *,
    title: str,
    novelty_explanation: str = "",
    depth_explanation: str = "",
    redundancy_explanation: str = "",
    cognitive_load_explanation: str = "",
) -> List[Dict[str, Any]]:
    """Create insight-style objects from existing score explanation strings.

    This is used to present document insights without a new DB model.
    """

    created_at = _now_iso()
    items: List[Insight] = []

    def add(insight_type: InsightType, explanation: str, confidence: float) -> None:
        if not explanation:
            return
        items.append(
            Insight(
                id=str(uuid.uuid4()),
                type=insight_type,
                confidence=confidence,
                explanation=explanation,
                affected_text=_truncate(title or "(untitled)"),
                created_at=created_at,
            )
        )

    add(InsightType.REPETITION, redundancy_explanation, 0.55)
    add(InsightType.COGNITIVE_LOAD, cognitive_load_explanation, 0.55)
    # Novelty/depth are not “alerts”, but still helpful insights.
    add(InsightType.MISINFORMATION, novelty_explanation, 0.35)
    add(InsightType.MISINFORMATION, depth_explanation, 0.35)

    return [i.to_dict() for i in items]
