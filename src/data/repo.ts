import { db } from './db'
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type ExerciseSession,
  type ExportPayload,
  type SleepLog,
  type ThoughtLog,
} from './types'

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('settings')
  if (existing) return { ...DEFAULT_SETTINGS, ...existing, alarm: { ...DEFAULT_SETTINGS.alarm, ...existing.alarm } }
  await db.settings.put(DEFAULT_SETTINGS)
  return { ...DEFAULT_SETTINGS }
}

export async function updateSettings(
  patch: Partial<Omit<AppSettings, 'id'>>,
): Promise<AppSettings> {
  const current = await getSettings()
  const next: AppSettings = {
    ...current,
    ...patch,
    id: 'settings',
    alarm: patch.alarm ? { ...current.alarm, ...patch.alarm } : current.alarm,
  }
  await db.settings.put(next)
  return next
}

export async function listSleepLogs(limit = 60): Promise<SleepLog[]> {
  return db.sleepLogs.orderBy('date').reverse().limit(limit).toArray()
}

export async function getSleepLogByDate(date: string): Promise<SleepLog | undefined> {
  return db.sleepLogs.where('date').equals(date).first()
}

export async function upsertSleepLog(
  log: Omit<SleepLog, 'id' | 'createdAt'> & { id?: number; createdAt?: string },
): Promise<number> {
  const existing = log.date ? await getSleepLogByDate(log.date) : undefined
  if (existing?.id != null) {
    const merged: SleepLog = {
      ...existing,
      ...log,
      id: existing.id,
      createdAt: existing.createdAt,
    }
    await db.sleepLogs.put(merged)
    return existing.id
  }
  return db.sleepLogs.add({
    ...log,
    createdAt: log.createdAt ?? new Date().toISOString(),
  }) as Promise<number>
}

export async function deleteSleepLog(id: number): Promise<void> {
  await db.sleepLogs.delete(id)
}

export async function listThoughtLogs(limit = 100): Promise<ThoughtLog[]> {
  return db.thoughtLogs.orderBy('createdAt').reverse().limit(limit).toArray()
}

export async function addThoughtLog(
  log: Omit<ThoughtLog, 'id' | 'createdAt'> & { createdAt?: string },
): Promise<number> {
  return db.thoughtLogs.add({
    ...log,
    createdAt: log.createdAt ?? new Date().toISOString(),
  }) as Promise<number>
}

export async function deleteThoughtLog(id: number): Promise<void> {
  await db.thoughtLogs.delete(id)
}

export async function addSession(
  session: Omit<ExerciseSession, 'id'>,
): Promise<number> {
  return db.sessions.add(session) as Promise<number>
}

export async function listSessions(limit = 50): Promise<ExerciseSession[]> {
  return db.sessions.orderBy('startedAt').reverse().limit(limit).toArray()
}

export async function exportAll(): Promise<ExportPayload> {
  const [settings, sleepLogs, thoughtLogs, sessions] = await Promise.all([
    getSettings(),
    db.sleepLogs.toArray(),
    db.thoughtLogs.toArray(),
    db.sessions.toArray(),
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    sleepLogs,
    thoughtLogs,
    sessions,
  }
}

export async function importAll(payload: ExportPayload): Promise<void> {
  if (payload.version !== 1) throw new Error('Unsupported export version')
  await db.transaction(
    'rw',
    db.settings,
    db.sleepLogs,
    db.thoughtLogs,
    db.sessions,
    async () => {
      await Promise.all([
        db.sleepLogs.clear(),
        db.thoughtLogs.clear(),
        db.sessions.clear(),
      ])
      await db.settings.put({
        ...DEFAULT_SETTINGS,
        ...payload.settings,
        id: 'settings',
        alarm: {
          ...DEFAULT_SETTINGS.alarm,
          ...payload.settings.alarm,
        },
      })
      if (payload.sleepLogs.length) await db.sleepLogs.bulkAdd(payload.sleepLogs)
      if (payload.thoughtLogs.length)
        await db.thoughtLogs.bulkAdd(payload.thoughtLogs)
      if (payload.sessions.length) await db.sessions.bulkAdd(payload.sessions)
    },
  )
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    db.settings,
    db.sleepLogs,
    db.thoughtLogs,
    db.sessions,
    async () => {
      await Promise.all([
        db.sleepLogs.clear(),
        db.thoughtLogs.clear(),
        db.sessions.clear(),
        db.settings.clear(),
      ])
      await db.settings.put(DEFAULT_SETTINGS)
    },
  )
}
