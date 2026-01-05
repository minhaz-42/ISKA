# Ethics & Privacy

## Core Ethical Principles

The Personal Knowledge Firewall is built on these non-negotiable principles:

### 1. User Autonomy
**The system NEVER controls what users can see or access.**

- No content blocking
- No censorship
- No paywalls
- No forced recommendations
- Users decide what to read

**We analyze, label, and explain — never block or hide.**

### 2. Privacy by Design
**All data belongs to the user and stays local by default.**

- No data sold or shared
- No external analytics tracking
- No cloud storage requirements
- Local-first processing
- Explicit opt-in for any features

### 3. Transparency
**Every decision the system makes must be explainable.**

- Clear explanations for all scores
- Show evidence for detections
- Document algorithms publicly
- No "black box" decisions

### 4. No Opinion Policing
**The system does NOT judge political views or opinions.**

- No liberal/conservative scoring
- No fact-checking of opinions
- No ideology detection
- No "fake news" labeling

**We detect manipulation tactics, not viewpoints.**

### 5. Explicit Opt-In
**All monitoring and analysis requires explicit user consent.**

- Browser extension disabled by default
- Live monitoring opt-in only
- Clear permission requests
- Easy to disable anytime

---

## What We DO Analyze

### ✅ Pattern Detection (Acceptable)

1. **Repetition**: "You've read 5 articles about this topic with similar information"
2. **Shallow Content**: "This is very short with limited detail"
3. **Manipulation Tactics**: 
   - Excessive urgency language
   - Emotional bait keywords
   - Hyperbolic claims
4. **Cognitive Load**: "This is dense and may be tiring"
5. **Contradictions**: "This contradicts something you read earlier" (no judgment on which is correct)

### ❌ What We DON'T Analyze (Prohibited)

1. **Political Ideology**: No left/right scoring
2. **Opinion Validity**: No "this opinion is wrong" judgments
3. **Source Trustworthiness**: No "this source is unreliable" scoring
4. **Fact-Checking**: Not our job to determine objective truth
5. **Personal Messages**: No DMs, no private conversations
6. **Keystroke Logging**: Never

---

## Privacy Protections

### Data Storage
- Default: SQLite database on user's machine
- Optional: Self-hosted database
- Never: Third-party cloud services (unless user explicitly chooses)

### What We Collect
**ONLY with user action:**
- Documents user uploads
- Text user pastes
- Public posts user explicitly adds
- Browser content user opts to monitor

**NEVER:**
- Private messages
- Keystrokes
- Browsing history (unless user opts in)
- Passwords or credentials
- Location data

### Data Retention
- User controls retention
- Easy export of all data
- Complete deletion on request
- No backup to external servers

---

## Content Analysis Ethics

### Emotional Pattern Detection

**What we detect:**
- Excessive exclamation points
- Urgency/fear-mongering keywords
- Outrage-inducing language

**Why this is ethical:**
- These are TACTICS, not opinions
- We explain WHY something was flagged
- User can disagree and dismiss
- Goal: awareness, not censorship

**Example:**
```
❌ BAD: "This source is biased"
✅ GOOD: "This content uses 15 exclamation points and phrases like 'SHOCKING!' which may indicate emotional rather than informational intent"
```

### Redundancy Detection

**Ethical approach:**
- Show similarity percentage
- Explain which concepts overlap
- Suggest but don't enforce action
- Useful for info diet awareness

**Not ethical:**
- Hiding content automatically
- Saying "don't read this"
- Punishing redundant sources

### Contradiction Detection

**Ethical approach:**
- "Document A says X, Document B says Y"
- No judgment on which is correct
- Show both claims clearly
- Let user investigate

**Not ethical:**
- "Document A is wrong"
- Marking sources as "false"
- Making truth claims

---

## Manipulation vs. Opinion

This is the most critical distinction.

### Manipulation Tactics (We Detect)
- False urgency: "ACT NOW OR ELSE"
- Emotional exploitation: Excessive fear/outrage
- Hyperbole: Extreme claims without evidence
- Clickbait patterns

**These are METHODS of communication, not viewpoints.**

### Opinions (We Don't Judge)
- Political views (any direction)
- Policy preferences
- Moral stances
- Value judgments
- Predictions

**These are CONTENT, which we respect.**

### Example Scenarios

**Scenario 1: Political Opinion**
- Content: "I believe policy X is bad for the economy"
- Our analysis: ❌ NO SCORE (this is an opinion)

**Scenario 2: Emotional Manipulation**
- Content: "SHOCKING!!! Policy X will DESTROY everything!!! Act NOW!!!"
- Our analysis: ✅ Flag emotional tactics, explain urgency language

**Scenario 3: Substantive Critique**
- Content: "Policy X may have these three economic effects based on historical data..."
- Our analysis: ✅ High depth score (substantive, detailed)

---

## Browser Extension Ethics

### What It CAN Do
- Read visible text on screen (opt-in only)
- Analyze content user is currently viewing
- Show subtle, non-intrusive indicators

### What It CANNOT Do
- Track browsing history
- Read private messages
- Capture passwords
- Monitor keyboard input
- Access other tabs without permission
- Send data to external servers

### User Control
- Big on/off switch
- Per-site permissions
- Pause at any time
- Clear data anytime

---

## Anti-Patterns We Avoid

### 1. Addiction Mechanics
❌ No infinite scroll
❌ No gamification
❌ No streaks or rewards
❌ No notifications designed to maximize engagement

✅ Minimal, informative UI
✅ Weekly summaries, not real-time alerts
✅ Easy to close and ignore

### 2. Algorithmic Curation
❌ No "recommended for you"
❌ No personalized feeds
❌ No A/B testing engagement

✅ User chooses what to read
✅ Analysis on demand
✅ Transparent results

### 3. Vendor Lock-In
❌ No proprietary formats
❌ No cloud-only features
❌ No subscription requirements for core features

✅ Open data formats
✅ Easy export
✅ Self-hostable

---

## Research Use

If this system is used for research:

### Required Protections
1. IRB approval for any user data studies
2. Informed consent with clear language
3. Anonymization of any shared data
4. Opt-in only (never default)
5. Right to withdraw at any time

### Prohibited Uses
- Manipulation experiments
- Political profiling
- Selling data to third parties
- Training models on private content

---

## Governance

### Open Development
- Code is open source
- Algorithm documentation is public
- Changes are tracked and explained
- Community input welcomed

### Accountability
- Clear contact for concerns
- Transparent issue tracking
- Regular ethics reviews
- User feedback integration

---

## Edge Cases

### Harmful Content
**Question**: What if content is genuinely harmful (violence, illegal, etc.)?

**Answer**: 
- We still don't block it
- We analyze patterns (e.g., "high emotional intensity")
- User retains full control
- If user wants content filtering, they can use other tools

### Misinformation
**Question**: What about provably false information?

**Answer**:
- We detect contradictions between sources
- We note when claims lack supporting evidence
- We don't determine truth ourselves
- User investigates and decides

### Manipulation at Scale
**Question**: What if someone uses this to spread propaganda?

**Answer**:
- System only works on content user consumes
- Can't be used to filter others' content
- Designed for individual use, not platform moderation

---

## Commitments

We commit to:

1. **Never selling user data**
2. **Never blocking content**
3. **Always explaining decisions**
4. **Respecting user autonomy**
5. **Keeping code open source**
6. **Regular ethics reviews**
7. **User privacy as default**

If we ever violate these principles, we've failed.

---

## Questions & Concerns

If you have ethical concerns about this system:

1. Open a GitHub issue
2. Contact: [ethics@example.com]
3. Review our public audit log
4. Suggest improvements

**Ethics is not a checkbox — it's an ongoing commitment.**
