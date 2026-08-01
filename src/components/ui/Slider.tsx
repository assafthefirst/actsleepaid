type Props = {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  label?: string
  display?: string
  className?: string
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  display,
  className = '',
}: Props) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      {(label || display) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-lavender/80">{label}</span>}
          {display && <span className="text-mist tabular-nums">{display}</span>}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-glow h-2 rounded-full appearance-none bg-night-600"
      />
    </label>
  )
}
