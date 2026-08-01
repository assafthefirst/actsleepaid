import { NavLink, Outlet } from 'react-router-dom'
import { useSettings } from '@/app/settingsStore'

const tabs = [
  { to: '/', label: 'Tonight', icon: '☽' },
  { to: '/diary', label: 'Diary', icon: '✎' },
  { to: '/thoughts', label: 'Thoughts', icon: '◉' },
  { to: '/exercises', label: 'Exercises', icon: '✦' },
  { to: '/insights', label: 'Insights', icon: '▦' },
] as const

export function AppShell() {
  const settings = useSettings()
  const warm = settings.nightWarmOverlay

  return (
    <div
      className={`min-h-full flex bg-night-900 text-mist ${warm ? 'night-warm' : ''}`}
    >
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-night-700/80 bg-night-950/60 p-4 gap-1">
        <div className="mb-6 px-2">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-soft/70">
            ACT Sleep
          </p>
          <h1 className="text-lg font-semibold text-mist mt-1">Companion</h1>
        </div>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-indigo-glow/20 text-mist'
                  : 'text-lavender/70 hover:bg-night-800 hover:text-mist'
              }`
            }
          >
            <span className="text-base w-5 text-center opacity-80">{t.icon}</span>
            {t.label}
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `mt-auto flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
              isActive
                ? 'bg-indigo-glow/20 text-mist'
                : 'text-lavender/70 hover:bg-night-800 hover:text-mist'
            }`
          }
        >
          <span className="text-base w-5 text-center">⚙</span>
          Settings
        </NavLink>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-night-900/90 backdrop-blur border-b border-night-700/50">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-violet-soft/70">
              ACT Sleep
            </p>
            <p className="text-sm font-medium">Companion</p>
          </div>
          <NavLink
            to="/settings"
            className="text-lavender/80 text-sm px-3 py-1.5 rounded-xl hover:bg-night-700"
            aria-label="Settings"
          >
            ⚙
          </NavLink>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 md:px-8 md:py-6 max-w-3xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-night-700/80 bg-night-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <ul className="flex justify-around px-1 pt-1.5 pb-1">
          {tabs.map((t) => (
            <li key={t.to} className="flex-1">
              <NavLink
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-1.5 text-[10px] ${
                    isActive ? 'text-violet-soft' : 'text-lavender/50'
                  }`
                }
              >
                <span className="text-lg leading-none">{t.icon}</span>
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
