import React from 'react'
import { SubtleToggle, SoftButton, CalmNotice } from '../design/components'
import { Shield, Eye, Bell, Trash2, Download, Moon, Sun } from 'lucide-react'

export function Settings() {
  const [darkMode, setDarkMode] = React.useState(false)
  const [localProcessing, setLocalProcessing] = React.useState(true)
  const [storeHistory, setStoreHistory] = React.useState(true)
  const [notifications, setNotifications] = React.useState(false)
  const [autoSummarize, setAutoSummarize] = React.useState(false)
  const [showSignals, setShowSignals] = React.useState(true)

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--pkf-text-strong)]">Settings</h1>
        <p className="mt-2 text-[14px] text-[var(--pkf-text-muted)]">
          Configure PKF to work the way you prefer.
        </p>
      </div>

      {/* Appearance */}
      <SettingsSection
        icon={<Sun className="h-5 w-5" />}
        title="Appearance"
        description="Visual preferences"
      >
        <div className="flex items-center justify-between rounded-xl bg-[var(--pkf-surface)] p-4">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="h-5 w-5 text-[var(--pkf-primary)]" />
            ) : (
              <Sun className="h-5 w-5 text-[var(--pkf-secondary)]" />
            )}
            <div>
              <p className="text-[14px] font-medium text-[var(--pkf-text-strong)]">Theme</p>
              <p className="text-[13px] text-[var(--pkf-text-muted)]">
                {darkMode ? 'Dark mode' : 'Light mode'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="pkf-focus rounded-lg bg-[var(--pkf-overlay)] px-4 py-2 text-[13px] font-medium text-[var(--pkf-text)] hover:bg-[var(--pkf-overlay-hover)]"
          >
            Switch
          </button>
        </div>
      </SettingsSection>

      {/* Privacy */}
      <SettingsSection
        icon={<Shield className="h-5 w-5" />}
        title="Privacy"
        description="How your data is handled"
      >
        <div className="space-y-3">
          <SubtleToggle
            checked={localProcessing}
            onChange={setLocalProcessing}
            label="Prefer local processing"
            description="Analyze content on your device when possible. Some features may be limited."
          />
          <SubtleToggle
            checked={storeHistory}
            onChange={setStoreHistory}
            label="Store reading history"
            description="Keep a record of analyzed documents. You can export or delete anytime."
          />
        </div>

        <CalmNotice tone="tip" className="mt-4">
          All data is stored locally by default. Cloud sync is opt-in and encrypted.
        </CalmNotice>
      </SettingsSection>

      {/* Live Monitor */}
      <SettingsSection
        icon={<Eye className="h-5 w-5" />}
        title="Live monitor"
        description="Extension behavior"
      >
        <div className="space-y-3">
          <SubtleToggle
            checked={showSignals}
            onChange={setShowSignals}
            label="Show inline signals"
            description="Display subtle indicators while browsing with the extension."
          />
          <SubtleToggle
            checked={autoSummarize}
            onChange={setAutoSummarize}
            label="Auto-summarize articles"
            description="Generate summaries automatically when you open articles."
          />
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection
        icon={<Bell className="h-5 w-5" />}
        title="Notifications"
        description="How you're notified"
      >
        <SubtleToggle
          checked={notifications}
          onChange={setNotifications}
          label="Enable notifications"
          description="Receive occasional updates about new insights. We keep these minimal."
        />
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection
        icon={<Trash2 className="h-5 w-5" />}
        title="Data management"
        description="Export or delete your data"
      >
        <div className="flex flex-wrap gap-3">
          <SoftButton variant="secondary" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export data
          </SoftButton>
          <SoftButton variant="ghost" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete all data
          </SoftButton>
        </div>

        <p className="mt-4 text-[13px] text-[var(--pkf-text-muted)]">
          Deleting data is permanent and cannot be undone. We don't keep backups.
        </p>
      </SettingsSection>
    </div>
  )
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl bg-[var(--pkf-card)] p-6 ring-1 ring-[var(--pkf-border)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--pkf-surface)] text-[var(--pkf-text-muted)]">
          {icon}
        </div>
        <div>
          <h2 className="text-[15px] font-medium text-[var(--pkf-text-strong)]">{title}</h2>
          <p className="text-[13px] text-[var(--pkf-text-muted)]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
