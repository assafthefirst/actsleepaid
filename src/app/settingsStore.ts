import { create } from 'zustand'
import type { AppSettings } from '@/data/types'
import { DEFAULT_SETTINGS } from '@/data/types'
import * as repo from '@/data/repo'

type SettingsState = {
  settings: AppSettings
  loaded: boolean
  load: () => Promise<void>
  patch: (p: Partial<Omit<AppSettings, 'id'>>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const settings = await repo.getSettings()
    set({ settings, loaded: true })
  },
  patch: async (p) => {
    const settings = await repo.updateSettings(p)
    set({ settings })
  },
}))

export function useSettings() {
  return useSettingsStore((s) => s.settings)
}

export async function ensureSettingsLoaded() {
  if (!useSettingsStore.getState().loaded) {
    await useSettingsStore.getState().load()
  }
}
