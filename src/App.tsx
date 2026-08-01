import { useEffect, type ReactNode } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { ensureSettingsLoaded, useSettingsStore } from '@/app/settingsStore'
import { TonightPage } from '@/features/tonight/TonightPage'
import { DiaryPage } from '@/features/diary/DiaryPage'
import { ThoughtsPage } from '@/features/act/ThoughtsPage'
import { ExercisesPage } from '@/features/act/ExercisesPage'
import { InsightsPage } from '@/features/insights/InsightsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'

function RequireOnboarding({ children }: { children: ReactNode }) {
  const loaded = useSettingsStore((s) => s.loaded)
  const complete = useSettingsStore((s) => s.settings.onboardingComplete)
  const location = useLocation()

  if (!loaded) {
    return (
      <div className="min-h-full flex items-center justify-center bg-night-900 text-lavender/60 text-sm">
        Loading…
      </div>
    )
  }

  if (!complete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export default function App() {
  useEffect(() => {
    void ensureSettingsLoaded()
  }, [])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <RequireOnboarding>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppShell />}>
            <Route index element={<TonightPage />} />
            <Route path="diary" element={<DiaryPage />} />
            <Route path="thoughts" element={<ThoughtsPage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RequireOnboarding>
    </BrowserRouter>
  )
}
