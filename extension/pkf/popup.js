const STORAGE_KEY = 'pkf_live_enabled'
const STORAGE_PERSIST_KEY = 'pkf_persist_on_page'
const STORAGE_AUTO_SUMMARY_KEY = 'pkf_auto_summary'

function setUi(enabled) {
  const btn = document.getElementById('toggle')
  const pill = document.getElementById('pill')

  btn.classList.toggle('on', enabled)
  btn.setAttribute('aria-pressed', String(enabled))

  btn.querySelector('.row > div').textContent = `Live monitor is ${enabled ? 'on' : 'off'}`
  pill.textContent = enabled ? 'On' : 'Off'
  pill.classList.toggle('on', enabled)
}

async function getEnabled() {
  const res = await chrome.storage.sync.get({ [STORAGE_KEY]: false })
  return Boolean(res[STORAGE_KEY])
}

async function setEnabled(next) {
  await chrome.storage.sync.set({ [STORAGE_KEY]: Boolean(next) })
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

async function setSetting(key, value) {
  await chrome.storage.sync.set({ [key]: Boolean(value) })
}

function setSwitchUi(id, on) {
  const el = document.getElementById(id)
  if (!el) return
  el.dataset.on = String(Boolean(on))
}

async function sendToActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab || !tab.id) throw new Error('No active tab found.')

  try {
    await chrome.tabs.sendMessage(tab.id, message)
    return
  } catch (err) {
    const raw = String(err && err.message ? err.message : err)

    // If the content script hasn't injected into this tab yet, inject and retry once.
    if (raw.includes('Receiving end does not exist') || raw.includes('Could not establish connection')) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScript.js']
      })

      await chrome.tabs.sendMessage(tab.id, message)
      return
    }

    throw err
  }
}

function setStatus(text) {
  const el = document.getElementById('status')
  if (!el) return
  if (!text) {
    el.style.display = 'none'
    el.textContent = ''
    return
  }

  el.style.display = 'block'
  el.textContent = text
}

document.addEventListener('DOMContentLoaded', async () => {
  const enabled = await getEnabled()
  setUi(enabled)

  setStatus('')

  const settings = await getSettings()
  setSwitchUi('persist', settings.persistOnPage)
  setSwitchUi('autosummary', settings.autoSummary)

  document.getElementById('toggle').addEventListener('click', async () => {
    const current = await getEnabled()
    const next = !current
    await setEnabled(next)
    setUi(next)
  })

  document.getElementById('persist').addEventListener('click', async () => {
    const current = (await getSettings()).persistOnPage
    const next = !current
    await setSetting(STORAGE_PERSIST_KEY, next)
    setSwitchUi('persist', next)
  })

  document.getElementById('autosummary').addEventListener('click', async () => {
    const current = (await getSettings()).autoSummary
    const next = !current
    await setSetting(STORAGE_AUTO_SUMMARY_KEY, next)
    setSwitchUi('autosummary', next)
  })

  document.getElementById('summarize').addEventListener('click', async () => {
    setStatus('')

    try {
      // Also enable monitor to ensure the content script is active.
      await setEnabled(true)
      setUi(true)
      await sendToActiveTab({ type: 'pkf_generate_summary' })
      window.close()
    } catch (err) {
      const msg = String(err && err.message ? err.message : err)
      setStatus(
        `Could not summarize this tab yet. Try refreshing the page, then click “Summarize now” again. (${msg})`
      )
    }
  })
})
