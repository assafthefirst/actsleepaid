type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
  ariaLabel?: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = '',
  ariaLabel,
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex flex-wrap gap-1 rounded-2xl bg-night-700/80 p-1 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 text-sm rounded-xl transition ${
              active
                ? 'bg-indigo-glow text-white shadow'
                : 'text-lavender/80 hover:text-mist hover:bg-night-600/60'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
