import Dexie, { type EntityTable } from 'dexie'
import type {
  AppSettings,
  ExerciseSession,
  SleepLog,
  ThoughtLog,
} from './types'

export class SleepDatabase extends Dexie {
  settings!: EntityTable<AppSettings, 'id'>
  sleepLogs!: EntityTable<SleepLog, 'id'>
  thoughtLogs!: EntityTable<ThoughtLog, 'id'>
  sessions!: EntityTable<ExerciseSession, 'id'>

  constructor() {
    super('act-sleep-companion')
    this.version(1).stores({
      settings: 'id',
      sleepLogs: '++id, date, createdAt',
      thoughtLogs: '++id, createdAt, pattern',
      sessions: '++id, exerciseId, startedAt',
    })
  }
}

export const db = new SleepDatabase()
