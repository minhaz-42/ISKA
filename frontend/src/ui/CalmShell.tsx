import React from 'react'
import {
  LayoutDashboard,
  Eye,
  FileText,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react'
import type { RouteKey } from '../hooks/useHashRoute'
import type { AuthUser } from '../services/auth'

const navItems: { id: RouteKey; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'monitor', label: 'Live monitor', icon: Eye },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function CalmShell(props: {
  route: RouteKey
  onNavigate: (route: RouteKey) => void
  children: React.ReactNode
  user?: AuthUser | null
  onLogout?: () => void | Promise<void>
}) {
  const { route, onNavigate, children, user, onLogout } = props
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(false)

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <div className="flex h-screen bg-(--pkf-bg)">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-(--pkf-backdrop) lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-(--pkf-surface) ring-1 ring-(--pkf-border) transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5">
          <span className="text-[16px] font-semibold text-(--pkf-text-strong)">PKF</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="pkf-focus rounded-lg p-2 text-(--pkf-text-muted) hover:bg-(--pkf-overlay) lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = route === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setSidebarOpen(false)
                }}
                className={`pkf-focus flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] transition-colors ${
                  isActive
                    ? 'bg-(--pkf-primary-subtle) font-medium text-(--pkf-primary)'
                    : 'text-(--pkf-text-muted) hover:bg-(--pkf-overlay) hover:text-(--pkf-text)'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-(--pkf-border) p-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="pkf-focus mb-3 flex w-full items-center gap-3 rounded-xl px-4 py-2 text-[13px] text-(--pkf-text-muted) hover:bg-(--pkf-overlay)"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>

          {/* User Info */}
          {user && (
            <div className="mb-3 truncate px-4 text-[12px] text-(--pkf-text-subtle)">
              {user.email || user.username}
            </div>
          )}

          {/* Sign Out */}
          {onLogout && (
            <button
              onClick={() => void onLogout()}
              className="pkf-focus flex w-full items-center gap-3 rounded-xl px-4 py-2 text-[13px] text-(--pkf-text-muted) hover:bg-(--pkf-overlay) hover:text-(--pkf-text)"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-(--pkf-border) bg-(--pkf-surface) px-6 lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="pkf-focus rounded-lg p-2 text-(--pkf-text-muted) hover:bg-(--pkf-overlay) lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb or Page Title */}
          <div className="flex items-center gap-2 text-[14px] text-(--pkf-text-muted)">
            <span className="capitalize">{route.replace('-', ' ')}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
