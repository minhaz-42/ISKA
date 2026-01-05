# PKF UI lint rules (calm design enforcement)

These are human-readable “eslint-style” rules to keep the PKF UI aligned with the calm-design system.

## Core philosophy

- The UI should feel like a mindful assistant for your attention.
- No fear-based language.
- No alarm colors.
- Explanations before metrics.
- Progressive disclosure by default.

---

## Rule 1 — No bright red usage

**Intent:** Prevent panic visuals.

❌ Disallowed
- `text-red-500`, `bg-red-600`, `border-red-500`
- Neon-like “error” palettes

✅ Approved alternatives
- Use muted tokens only: `text-(--pkf-attention)` for attention
- Keep surfaces calm: `bg-(--pkf-overlay)`, `ring-(--pkf-border)`
- Use sentence-based copy instead of color emphasis

---

## Rule 2 — No ALL CAPS text

**Intent:** Avoid alarm tone.

❌ Disallowed
- “WARNING”, “CRITICAL”, “DANGER”
- `uppercase` utility on headings/buttons

✅ Approved alternatives
- Sentence case: “Live monitor is on”
- Calm phrasing: “This content shows strong persuasion techniques”

---

## Rule 3 — No numeric-only indicators

**Intent:** Numbers alone feel judgmental and “scoreboard-like.”

❌ Disallowed
- Showing `92%` without explanation
- A metric card that only shows a number

✅ Approved alternatives
- Label-first: “Higher / Moderate / Lower confidence”
- Hide numbers behind tooltip or expanded details

---

## Rule 4 — No table-first layouts

**Intent:** Tables read as dashboards and can feel clinical or policing.

❌ Disallowed
- Pages dominated by tables
- “Security console” dashboards

✅ Approved alternatives
- Cards with one-sentence explanations
- Expandable details (`<details>` / disclosure patterns)

---

## Rule 5 — No fear-based language

**Intent:** Avoid policing and anxiety triggers.

❌ Disallowed words
- fake
- false
- danger
- critical

✅ Approved alternatives
- “Shows signals of…”
- “May indicate…”
- “What could be wrong: …”

---

## Rule 6 — No hardcoded colors in components

**Intent:** All UI colors must be tokenized.

❌ Disallowed
- `text-slate-100`, `bg-white/5`, `text-white`
- Inline hex values in JSX styles

✅ Approved alternatives
- CSS variables: `bg-(--pkf-card)`, `text-(--pkf-text)`
- Token overlays: `bg-(--pkf-overlay)`

---

## Rule 7 — Progressive disclosure everywhere

**Intent:** Keep first view calm and minimal.

❌ Disallowed
- Showing full explanation blocks everywhere by default

✅ Approved alternatives
- Collapsible details
- Tooltips for “why”
- Secondary actions only on expanded view
