import type { ExportPayload } from './types'
import { exportAll, importAll } from './repo'

export async function downloadExport(): Promise<void> {
  const payload = await exportAll()
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sleep-companion-export-${payload.exportedAt.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importFromFile(file: File): Promise<void> {
  const text = await file.text()
  const parsed = JSON.parse(text) as ExportPayload
  await importAll(parsed)
}
