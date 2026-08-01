type Bar = { label: string; value: number; max?: number }

type Props = {
  data: Bar[]
  height?: number
  unit?: string
  className?: string
}

export function BarChart({ data, height = 120, unit = '', className = '' }: Props) {
  const max = Math.max(...data.map((d) => d.max ?? d.value), 1)
  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${Math.max(data.length * 28, 100)} ${height + 24}`}
        className="w-full h-auto"
        role="img"
        aria-label="Bar chart"
      >
        {data.map((d, i) => {
          const h = (d.value / max) * height
          const x = i * 28 + 4
          const y = height - h
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={20}
                height={Math.max(h, 1)}
                rx={6}
                fill="url(#barGrad)"
                opacity={0.9}
              />
              <text
                x={x + 10}
                y={height + 16}
                textAnchor="middle"
                fill="#a78bfa"
                fontSize="9"
              >
                {d.label}
              </text>
            </g>
          )
        })}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      {unit && (
        <p className="text-xs text-lavender/50 mt-1 text-right">{unit}</p>
      )}
    </div>
  )
}

type LinePoint = { label: string; value: number }

export function LineChart({
  data,
  height = 100,
  className = '',
}: {
  data: LinePoint[]
  height?: number
  className?: string
}) {
  if (data.length === 0) return null
  const width = Math.max(data.length * 40, 120)
  const max = Math.max(...data.map((d) => d.value), 1)
  const min = Math.min(...data.map((d) => d.value), 0)
  const range = Math.max(max - min, 1)
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (width - 16) + 8
    const y = height - ((d.value - min) / range) * (height - 16) - 8
    return `${x},${y}`
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label="Line chart"
    >
      <polyline
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points.join(' ')}
      />
      {data.map((d, i) => {
        const [x, y] = points[i].split(',').map(Number)
        return <circle key={d.label} cx={x} cy={y} r={3.5} fill="#6366f1" />
      })}
    </svg>
  )
}
