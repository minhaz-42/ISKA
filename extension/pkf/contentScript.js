// PKF content script (MV3)
// Shows calm, dismissible toasts on any webpage when Live Monitor is enabled.
// No backend calls. No blocking UI. No fear language.

const STORAGE_KEY = 'pkf_live_enabled'
const STORAGE_PERSIST_KEY = 'pkf_persist_on_page'
const STORAGE_AUTO_SUMMARY_KEY = 'pkf_auto_summary'

function prefersReducedMotion() {
  return Boolean(
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

const TOKENS = {
  toastTtlMs: 5000,
  toastSweepMs: 250,
  maxToasts: 4,
  cadenceMs: 2600,

  // Behavior
  maxToastsPerPage: 6,
  minWordsForMonitor: 140,
  minBlockChars: 90,
  maxBlockChars: 260,
  snippetTries: 4,

  // Summary
  summaryMaxChars: 24000,
  summaryTargetSentences: 5,
  summaryMinChars: 900,
  summaryDebounceMs: 1500,

  // Visuals (strict palette)
  colors: {
    bg: '#0C0F14',
    card: '#161E2E',
    cardHover: '#1B2538',
    border: '#1F2937',
    text: '#E2E8F0',
    textStrong: '#F1F5F9',
    textMuted: '#94A3B8',

    primary: '#7AA2F7',
    secondary: '#F5C97A',

    healthy: '#7BC99A',
    neutral: '#E5D27A',
    attention: '#D98C8C'
  }
}

/** @returns {Promise<boolean>} */
async function getEnabled() {
  const res = await chrome.storage.sync.get({ [STORAGE_KEY]: false })
  return Boolean(res[STORAGE_KEY])
}

async function getSettings() {
  const res = await chrome.storage.sync.get({
    [STORAGE_PERSIST_KEY]: true,
    [STORAGE_AUTO_SUMMARY_KEY]: true
  })

  return {
    persistOnPage: Boolean(res[STORAGE_PERSIST_KEY]),
    autoSummary: Boolean(res[STORAGE_AUTO_SUMMARY_KEY])
  }
}

/** @param {string} html */
function elFromHtml(html) {
  const tpl = document.createElement('template')
  tpl.innerHTML = html.trim()
  return tpl.content.firstElementChild
}

function ensureRoot() {
  const id = 'pkf-toast-root'
  let root = document.getElementById(id)
  if (root) return root

  const sweepMs = prefersReducedMotion() ? 0 : TOKENS.toastSweepMs

  root = document.createElement('div')
  root.id = id
  root.setAttribute('role', 'region')
  root.setAttribute('aria-label', 'PKF live monitor')

  const style = document.createElement('style')
  style.id = 'pkf-toast-style'
  style.textContent = `
    #${id} {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 2147483647;
      width: 360px;
      max-width: calc(100vw - 40px);
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      font-family: ui-sans-serif, system-ui, Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      line-height: 1.6;

      --pkf-bg: ${TOKENS.colors.bg};
      --pkf-card: ${TOKENS.colors.card};
      --pkf-card-hover: ${TOKENS.colors.cardHover};
      --pkf-border: ${TOKENS.colors.border};

      --pkf-primary: ${TOKENS.colors.primary};
      --pkf-secondary: ${TOKENS.colors.secondary};

      --pkf-healthy: ${TOKENS.colors.healthy};
      --pkf-neutral: ${TOKENS.colors.neutral};
      --pkf-attention: ${TOKENS.colors.attention};

      --pkf-text: ${TOKENS.colors.text};
      --pkf-text-strong: ${TOKENS.colors.textStrong};
      --pkf-text-muted: ${TOKENS.colors.textMuted};

      --pkf-overlay: rgba(255, 255, 255, 0.05);
    }

    .pkf-toast {
      pointer-events: auto;
      background: var(--pkf-card);
      border: 1px solid var(--pkf-border);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      padding: 12px;
      color: var(--pkf-text);
      transition: transform 150ms ease, background-color 150ms ease, opacity ${sweepMs}ms ease;
    }

    .pkf-toast:hover {
      background: var(--pkf-card-hover);
      transform: translateY(-2px);
    }

    @media (prefers-reduced-motion: reduce) {
      .pkf-toast {
        transition: none;
      }

      .pkf-toast:hover {
        transform: none;
      }
    }

    .pkf-toast summary {
      cursor: pointer;
      list-style: none;
      outline: none;
    }

    .pkf-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    .pkf-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--pkf-text-strong);
    }

    .pkf-sub {
      margin-top: 2px;
      font-size: 11px;
      color: var(--pkf-text-muted);
    }

    .pkf-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      margin-top: 4px;
      flex: 0 0 auto;
    }

    .pkf-dismiss {
      border: 0;
      background: transparent;
      color: var(--pkf-text-muted);
      font-size: 12px;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 10px;
    }

    .pkf-dismiss:hover {
      background: var(--pkf-overlay);
      color: var(--pkf-text);
    }

    .pkf-box {
      margin-top: 10px;
      background: var(--pkf-overlay);
      border: 1px solid var(--pkf-border);
      border-radius: 12px;
      padding: 10px;
      font-size: 12px;
      color: var(--pkf-text);
    }

    .pkf-box-title {
      color: var(--pkf-text-muted);
      font-size: 11px;
      margin-bottom: 4px;
    }

    .pkf-panel {
      pointer-events: auto;
      background: var(--pkf-card);
      border: 1px solid var(--pkf-border);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      padding: 12px;
      color: var(--pkf-text);
    }

    .pkf-panel .pkf-kicker {
      font-size: 11px;
      color: var(--pkf-text-muted);
      margin-top: 2px;
    }

    .pkf-list {
      margin: 10px 0 0 18px;
      padding: 0;
      color: var(--pkf-text);
      font-size: 12px;
    }

    .pkf-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: var(--pkf-text-muted);
    }
  `

  // Avoid double-inject
  if (!document.getElementById(style.id)) document.documentElement.appendChild(style)

  document.documentElement.appendChild(root)
  return root
}

function dotForType(type) {
  if (type === 'ai') return 'var(--pkf-secondary)'
  if (type === 'persuasion') return 'var(--pkf-neutral)'
  if (type === 'repetition') return 'var(--pkf-neutral)'
  return 'var(--pkf-healthy)'
}

function addSystemToast(title, explanation) {
  addToast({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'info',
    title,
    explanation,
    affectedText: '',
    whatCouldBeWrong: 'Some pages load content gradually. A refresh or a short scroll can help.',
    confidence01: 0.4
  })
}

function confidenceWords(c01) {
  const c = Number.isFinite(c01) ? Math.max(0, Math.min(1, c01)) : 0
  if (c >= 0.75) return 'High confidence'
  if (c >= 0.45) return 'Moderate confidence'
  return 'Low confidence'
}

function isVisibleElement(el) {
  if (!el || el.nodeType !== 1) return false
  const style = window.getComputedStyle(el)
  if (!style) return false
  if (style.display === 'none') return false
  if (style.visibility === 'hidden') return false
  if (Number(style.opacity || '1') <= 0) return false

  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return false
  return true
}

function isWithinExcludedContainer(el) {
  // Avoid nav/chrome/sidebars and PKF's own injected root.
  return Boolean(el.closest('nav, header, footer, aside, #pkf-toast-root'))
}

function normalizeSpace(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function looksLikeBoilerplate(el) {
  if (!el || el.nodeType !== 1) return false
  const s = `${el.id || ''} ${el.className || ''}`.toLowerCase()
  return Boolean(
    s.includes('cookie') ||
      s.includes('consent') ||
      s.includes('subscribe') ||
      s.includes('newsletter') ||
      s.includes('signup') ||
      s.includes('paywall') ||
      s.includes('promo') ||
      s.includes('banner') ||
      s.includes('modal')
  )
}

function estimateWordCount(text) {
  const t = normalizeSpace(text)
  if (!t) return 0
  return t.split(' ').filter(Boolean).length
}

function collectReadableBlocks(maxBlocks = 60) {
  const candidates = Array.from(
    document.querySelectorAll('main p, main li, article p, article li, blockquote, p, li')
  )

  const blocks = []
  for (const el of candidates) {
    if (blocks.length >= maxBlocks) break
    if (!isVisibleElement(el)) continue
    if (isWithinExcludedContainer(el)) continue
    if (looksLikeBoilerplate(el)) continue
    const text = normalizeSpace(el.textContent)
    if (text.length < TOKENS.minBlockChars) continue
    blocks.push(text)
  }

  return blocks
}

function pageLooksReadable() {
  const blocks = collectReadableBlocks(28)
  const joined = blocks.join(' ')
  return estimateWordCount(joined) >= TOKENS.minWordsForMonitor
}

function pickSnippet(excludeSignatures) {
  const blocks = collectReadableBlocks(80)
  if (blocks.length === 0) return null

  // Prefer longer blocks first.
  const sorted = blocks
    .slice()
    .sort((a, b) => b.length - a.length)
    .slice(0, Math.min(30, blocks.length))

  for (let i = 0; i < TOKENS.snippetTries; i++) {
    const idx = Math.floor(Math.random() * sorted.length)
    const snippet = sorted[idx].slice(0, TOKENS.maxBlockChars)
    const signature = snippet.toLowerCase().slice(0, 140)
    if (!excludeSignatures || !excludeSignatures.has(signature)) return snippet
  }

  return sorted[0].slice(0, TOKENS.maxBlockChars)
}

function splitSentences(text) {
  const t = normalizeSpace(text)
  if (!t) return []

  // A deliberately simple sentence split; good enough for UI-only summaries.
  return t
    .replace(/\s*\n+\s*/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'\(])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 30)
}

function tokenize(text) {
  return normalizeSpace(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'if',
  'then',
  'else',
  'when',
  'while',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'as',
  'at',
  'by',
  'from',
  'into',
  'about',
  'over',
  'after',
  'before',
  'between',
  'during',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'it',
  'this',
  'that',
  'these',
  'those',
  'you',
  'your',
  'we',
  'our',
  'they',
  'their',
  'i',
  'he',
  'she',
  'his',
  'her',
  'them',
  'not',
  'no',
  'yes',
  'can',
  'could',
  'may',
  'might',
  'will',
  'would',
  'should',
  'must'
])

function scoreSentences(sentences) {
  const freq = new Map()
  for (const s of sentences) {
    const toks = tokenize(s)
    for (const w of toks) {
      if (w.length < 3) continue
      if (STOPWORDS.has(w)) continue
      freq.set(w, (freq.get(w) || 0) + 1)
    }
  }

  const maxF = Math.max(1, ...Array.from(freq.values()))
  const weight = (w) => (freq.get(w) || 0) / maxF

  return sentences.map((s, idx) => {
    const toks = tokenize(s)
    let score = 0
    for (const w of toks) {
      if (w.length < 3) continue
      if (STOPWORDS.has(w)) continue
      score += weight(w)
    }

    // Prefer medium-length sentences.
    const len = s.length
    const lengthPenalty = len < 60 ? 0.85 : len > 260 ? 0.85 : 1

    return { idx, s, score: score * lengthPenalty }
  })
}

function buildSummary(text) {
  const sentences = splitSentences(text)
  if (sentences.length === 0) return null

  const scored = scoreSentences(sentences)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOKENS.summaryTargetSentences)
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.s)

  if (scored.length === 0) return null
  return scored
}

function computeLightAnalysis(text) {
  const sentences = splitSentences(text)
  const words = tokenize(text)
  const wordCount = words.length
  const sentenceCount = Math.max(1, sentences.length)
  const avgWordsPerSentence = Math.round(wordCount / sentenceCount)

  const absolutist = ['always', 'never', 'everyone', 'no one', 'obvious', 'clearly', 'undeniable']
  const urgency = ['urgent', 'now', 'immediately', 'must', 'guarantee', 'shocking', 'unbelievable']
  const hedges = ['may', 'might', 'often', 'sometimes', 'suggests', 'could', 'appears']

  const lower = text.toLowerCase()
  const countHits = (list) =>
    list.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0)

  const persuasionHits = countHits(absolutist) + countHits(urgency)
  const hedgeHits = countHits(hedges)

  let load = 'Moderate'
  if (avgWordsPerSentence >= 26) load = 'Higher'
  if (avgWordsPerSentence <= 16) load = 'Lower'

  const notes = []
  notes.push(`Reading load: ${load} (about ${avgWordsPerSentence} words per sentence).`)
  if (persuasionHits > 0) {
    notes.push('Persuasion cues: present (watch for certainty/urgency phrasing).')
  } else {
    notes.push('Persuasion cues: not prominent in the visible text.')
  }
  if (hedgeHits > 0) {
    notes.push('Uncertainty language: present (signals nuance and limits).')
  }

  return {
    wordCount,
    sentenceCount,
    notes
  }
}

function chooseBestContainer() {
  const candidates = Array.from(
    document.querySelectorAll('article, main, [role="main"], .article, .post, body')
  )
    .filter(Boolean)
    .slice(0, 12)

  let best = null
  let bestScore = -1

  for (const el of candidates) {
    if (!isVisibleElement(el)) continue
    if (looksLikeBoilerplate(el)) continue
    const blocks = Array.from(el.querySelectorAll('p, li, blockquote, h2, h3'))
      .filter((n) => isVisibleElement(n) && !isWithinExcludedContainer(n) && !looksLikeBoilerplate(n))
      .map((n) => normalizeSpace(n.textContent))
      .filter((t) => t.length >= 40)

    const joined = blocks.join(' ')
    const words = estimateWordCount(joined)
    const paragraphs = blocks.length
    const score = words + paragraphs * 10

    if (score > bestScore) {
      bestScore = score
      best = el
    }
  }

  return best || document.body
}

function extractArticleText() {
  const container = chooseBestContainer()
  const parts = []
  const nodes = Array.from(container.querySelectorAll('h1, h2, h3, p, li, blockquote'))

  for (const n of nodes) {
    if (!isVisibleElement(n)) continue
    if (isWithinExcludedContainer(n)) continue
    if (looksLikeBoilerplate(n)) continue
    const text = normalizeSpace(n.textContent)
    if (text.length < 30) continue
    parts.push(text)
    if (parts.join(' ').length >= TOKENS.summaryMaxChars) break
  }

  // De-dupe near-identical consecutive lines.
  const deduped = []
  let last = ''
  for (const p of parts) {
    const sig = p.toLowerCase().slice(0, 160)
    if (sig === last) continue
    deduped.push(p)
    last = sig
  }

  return deduped.join('\n')
}

function extractArticleTextFallback() {
  // Fallback: join readable blocks across the page.
  const blocks = collectReadableBlocks(220)
  return blocks.join('\n')
}

function clearRootContents() {
  const root = document.getElementById('pkf-toast-root')
  if (!root) return
  root.replaceChildren()
}

function ensureSummaryPanel() {
  const root = ensureRoot()
  const existing = root.querySelector('#pkf-summary-panel')
  if (existing) return existing

  const panel = elFromHtml(`
    <div class="pkf-panel" id="pkf-summary-panel" role="dialog" aria-label="Page summary">
      <div class="pkf-row">
        <div style="min-width:0;">
          <div class="pkf-title">Page summary</div>
          <div class="pkf-kicker">A short, explanation-first recap of what you’re reading.</div>
        </div>
        <button class="pkf-dismiss" type="button" aria-label="Close">Close</button>
      </div>
      <div class="pkf-box" style="margin-top:10px;">
        <div class="pkf-box-title">Key points</div>
        <ul class="pkf-list"></ul>
      </div>
      <div class="pkf-box">
        <div class="pkf-box-title">Calm notes</div>
        <ul class="pkf-list pkf-notes"></ul>
      </div>
      <div class="pkf-mono" style="margin-top:10px;">Generated from visible page text. UI-only; no data is sent anywhere.</div>
    </div>
  `)

  panel.querySelector('.pkf-dismiss').addEventListener('click', () => {
    panel.remove()
  })

  // Keep it near the top of the stack.
  root.prepend(panel)
  return panel
}

function renderSummary(panel, summarySentences, analysis) {
  const list = panel.querySelector('.pkf-list')
  const notes = panel.querySelector('.pkf-notes')
  list.replaceChildren()
  notes.replaceChildren()

  for (const s of summarySentences) {
    const li = document.createElement('li')
    li.textContent = s
    list.appendChild(li)
  }

  for (const n of analysis.notes) {
    const li = document.createElement('li')
    li.textContent = n
    notes.appendChild(li)
  }
}

function renderSummaryMessage(panel, title, message, meta) {
  const list = panel.querySelector('.pkf-list')
  const notes = panel.querySelector('.pkf-notes')
  list.replaceChildren()
  notes.replaceChildren()

  const li = document.createElement('li')
  li.textContent = message
  list.appendChild(li)

  const note = document.createElement('li')
  note.textContent = meta || 'Tip: refresh the page or scroll a bit to load more text.'
  notes.appendChild(note)

  const header = panel.querySelector('.pkf-title')
  if (header) header.textContent = title
}

function nextMockInsight(seenSnippetSignatures) {
  const options = [
    {
      type: 'persuasion',
      title: 'This content shows strong persuasion techniques',
      explanation: 'It uses emotionally loaded phrasing and urgent framing that can steer interpretation.',
      whatCouldBeWrong: 'Opinion writing and storytelling can legitimately use strong language.',
      confidence01: 0.6
    },
    {
      type: 'ai',
      title: 'This text appears statistically similar to AI-generated writing',
      explanation: 'The phrasing is unusually uniform and uses repeated structure across sentences.',
      whatCouldBeWrong: 'Short excerpts and formal writing can look templated even when human-written.',
      confidence01: 0.5
    },
    {
      type: 'cognitive_load',
      title: 'This snippet may indicate higher cognitive load',
      explanation: 'Long sentences and dense concepts can increase effort and reduce retention.',
      whatCouldBeWrong: 'Dense text can be valuable; this is only a pacing hint.',
      confidence01: 0.4
    },
    {
      type: 'repetition',
      title: 'This looks similar to content you saw recently',
      explanation: 'Several phrases match wording patterns from other pages you viewed.',
      whatCouldBeWrong: 'Repetition can be intentional (summaries, study materials, or recaps).',
      confidence01: 0.45
    }
  ]

  const base = options[Math.floor(Math.random() * options.length)]
  const snippet =
    pickSnippet(seenSnippetSignatures) || 'This is a short excerpt from the page you are viewing.'

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: base.type,
    title: base.title,
    explanation: base.explanation,
    affectedText: snippet,
    whatCouldBeWrong: base.whatCouldBeWrong,
    confidence01: base.confidence01
  }
}

function addToast(insight) {
  const root = ensureRoot()

  const sweepMs = prefersReducedMotion() ? 0 : TOKENS.toastSweepMs

  // Trim stack.
  while (root.children.length >= TOKENS.maxToasts) {
    root.removeChild(root.lastElementChild)
  }

  const toast = elFromHtml(`
    <details class="pkf-toast">
      <summary>
        <div class="pkf-row">
          <div style="min-width:0;">
            <div style="display:flex; align-items:flex-start; gap:8px;">
              <span class="pkf-dot" style="background:${dotForType(insight.type)}"></span>
              <div style="min-width:0;">
                <div class="pkf-title"></div>
                <div class="pkf-sub"></div>
              </div>
            </div>
          </div>
          <button class="pkf-dismiss" type="button" aria-label="Dismiss">Dismiss</button>
        </div>
      </summary>
      <div class="pkf-box">
        <div class="pkf-box-title">Why it was flagged</div>
        <div></div>
      </div>
      <div class="pkf-box">
        <div class="pkf-box-title">Affected text</div>
        <div></div>
      </div>
      <div class="pkf-sub" style="margin-top:10px;">
        <span style="color:var(--pkf-text);">What could be wrong:</span> <span></span>
      </div>
    </details>
  `)

  toast.querySelector('.pkf-title').textContent = insight.title
  toast.querySelector('.pkf-sub').textContent = confidenceWords(insight.confidence01)
  const boxes = toast.querySelectorAll('.pkf-box')
  boxes[0].querySelector('div:nth-child(2)').textContent = insight.explanation
  boxes[1].querySelector('div:nth-child(2)').textContent = insight.affectedText
  toast.querySelector('.pkf-sub span:last-child').textContent = insight.whatCouldBeWrong

  const dismiss = toast.querySelector('.pkf-dismiss')
  dismiss.addEventListener('click', (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    toast.style.opacity = '0'
    if (sweepMs === 0) {
      toast.remove()
    } else {
      window.setTimeout(() => toast.remove(), sweepMs)
    }
  })

  root.prepend(toast)

  if (!settings.persistOnPage) {
    window.setTimeout(() => {
      if (!toast.isConnected) return
      toast.style.opacity = '0'
      if (sweepMs === 0) {
        toast.remove()
      } else {
        window.setTimeout(() => toast.remove(), sweepMs)
      }
    }, TOKENS.toastTtlMs)
  }
}

let running = false
let timerId = null
let urlWatchId = null
let shownCount = 0
const seenSnippetSignatures = new Set()
let settings = { persistOnPage: true, autoSummary: true }
let summaryTimerId = null
let lastSummaryUrl = null

async function maybeAutoSummarize(reason) {
  if (!running) return
  if (!settings.autoSummary) return
  if (!pageLooksReadable()) return
  if (document.hidden) return
  if (lastSummaryUrl === location.href) return

  if (summaryTimerId) {
    window.clearTimeout(summaryTimerId)
    summaryTimerId = null
  }

  summaryTimerId = window.setTimeout(() => {
    void generateAndShowSummary({ reason, force: false })
  }, TOKENS.summaryDebounceMs)
}

async function generateAndShowSummary({ reason, force }) {
  if (!running) return
  if (!force && !settings.autoSummary) return
  if (!pageLooksReadable()) {
    if (force) {
      const panel = ensureSummaryPanel()
      renderSummaryMessage(
        panel,
        'Page summary',
        'Not enough readable article text was found on this page.',
        'Try a different article page, or scroll to load the content.'
      )
      addSystemToast('Summary not available yet', 'This page does not expose enough readable text.')
    }
    return
  }

  let text = extractArticleText()
  if (text.length < TOKENS.summaryMinChars) {
    text = extractArticleTextFallback()
  }

  if (text.length < TOKENS.summaryMinChars) {
    if (force) {
      const panel = ensureSummaryPanel()
      renderSummaryMessage(
        panel,
        'Page summary',
        'The visible text is still too short to summarize reliably.',
        `Extracted about ${text.length} characters from the page.`
      )
      addSystemToast('Waiting for more text', 'Scroll a little, then try “Summarize now” again.')
    }
    return
  }

  const summary = buildSummary(text)
  if (!summary) {
    if (force) {
      const panel = ensureSummaryPanel()
      renderSummaryMessage(panel, 'Page summary', 'Could not form a summary from this text.')
      addSystemToast('Summary not available yet', 'This text may be too fragmented to summarize.')
    }
    return
  }

  const analysis = computeLightAnalysis(text)
  const panel = ensureSummaryPanel()
  renderSummary(panel, summary, analysis)
  lastSummaryUrl = location.href
}

function computeNextDelayMs() {
  const blocks = collectReadableBlocks(40)
  const words = estimateWordCount(blocks.join(' '))

  // Larger pages can show a bit sooner, but keep everything calm.
  // Clamp into an intentionally slow band.
  const base = words >= 900 ? 9000 : words >= 400 ? 12000 : 16000
  const jitter = Math.floor(base * (0.2 + Math.random() * 0.25))
  return base + (Math.random() < 0.5 ? -jitter : jitter)
}

function scheduleNextToast() {
  if (!running) return

  if (shownCount >= TOKENS.maxToastsPerPage) return

  const delay = computeNextDelayMs()
  timerId = window.setTimeout(() => {
    if (!running) return

    // If tab is hidden, wait.
    if (document.hidden) {
      scheduleNextToast()
      return
    }

    if (!pageLooksReadable()) {
      // On sparse/utility pages, stay quiet.
      timerId = window.setTimeout(() => scheduleNextToast(), 20000)
      return
    }

    const insight = nextMockInsight(seenSnippetSignatures)
    const sig = insight.affectedText.toLowerCase().slice(0, 140)
    seenSnippetSignatures.add(sig)
    addToast(insight)
    shownCount += 1

    scheduleNextToast()
  }, Math.max(2500, delay))
}

function startUrlWatch() {
  let last = location.href
  urlWatchId = window.setInterval(() => {
    if (!running) return
    if (location.href === last) return
    last = location.href
    shownCount = 0
    seenSnippetSignatures.clear()

    // “Until I leave the article”: clear on navigation.
    clearRootContents()
    lastSummaryUrl = null
    void maybeAutoSummarize('navigation')
  }, 1500)
}

async function syncRunningState() {
  const enabled = await getEnabled()
  settings = await getSettings()

  if (enabled && !running) {
    if (!pageLooksReadable()) {
      // Don’t start on sparse/utility pages.
      // (If the user navigates to a readable page, URL watch will allow new toasts.)
    }

    running = true
    ensureRoot()

    shownCount = 0
    seenSnippetSignatures.clear()
    scheduleNextToast()
    startUrlWatch()
    void maybeAutoSummarize('startup')
  }

  if (!enabled && running) {
    running = false

    if (timerId) {
      window.clearTimeout(timerId)
      timerId = null
    }

    if (urlWatchId) {
      window.clearInterval(urlWatchId)
      urlWatchId = null
    }

    if (summaryTimerId) {
      window.clearTimeout(summaryTimerId)
      summaryTimerId = null
    }

    const root = document.getElementById('pkf-toast-root')
    if (root) root.remove()

    const style = document.getElementById('pkf-toast-style')
    if (style) style.remove()
  }
}

// React to toggle changes.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return
  const hasEnabled = Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)
  const hasPersist = Object.prototype.hasOwnProperty.call(changes, STORAGE_PERSIST_KEY)
  const hasAutoSummary = Object.prototype.hasOwnProperty.call(changes, STORAGE_AUTO_SUMMARY_KEY)

  if (hasEnabled) {
    void syncRunningState()
    return
  }

  if (hasPersist || hasAutoSummary) {
    void (async () => {
      settings = await getSettings()
      // If auto-summary was enabled, attempt one on this page.
      void maybeAutoSummarize('settings')
    })()
  }
})

chrome.runtime.onMessage.addListener((message) => {
  if (!message || typeof message !== 'object') return
  if (message.type === 'pkf_generate_summary') {
    void generateAndShowSummary({ reason: 'manual', force: true })
  }
})

// Initial state.
void syncRunningState()
