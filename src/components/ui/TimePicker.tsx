import { minutesToHHMM, hhmmToMinutes } from '@/lib/time'

type Props = {
  valueMinutes: number
  onChange: (minutes: number) => void
  label?: string
  className?: string
}

export function TimePicker({ valueMinutes, onChange, label, className = '' }: Props) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-sm text-lavender/80">{label}</span>}
      <input
        type="time"
        value={minutesToHHMM(valueMinutes)}
        onChange={(e) => onChange(hhmmToMinutes(e.target.value))}
        className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3 text-mist text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-glow/50"
      />
    </label>
  )
}
