type Bar = { label: string; value: number; max?: number }

type BarProps = {
  data: Bar[]
  height?: number
  formatValue?: (v: number) => string
  className?: string
}

export function BarChart({ data, height = 120, formatValue, className = '' }: BarProps) {
  const max = Math.max(...data.map((d) => d.max ?? d.value), 1)
  const topPad = 18 // space for value labels above bars
  const totalH = height + topPad
  const width = Math.max(data.length * 28, 100)

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${totalH}`}
        className="w-full h-auto"
        role="img"
        aria-label="Bar chart"
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        {data.map((d, i) => {
          const h = Math.max((d.value / max) * height, 1)
          const x = i * 28 + 4
          const barTop = topPad + height - h
          const labelY = Math.max(topPad - 4, barTop - 4)

          return (
            <g key={`${d.label}-${i}`}>
              <rect
                x={x}
                y={barTop}
                width={20}
                height={h}
                rx={5}
                fill="url(#barGrad)"
                opacity={0.9}
              />
              {formatValue && (
                <text
                  x={x + 10}
                  y={labelY}
                  textAnchor="middle"
                  fill="#c4b5fd"
                  fontSize="8"
                >
                  {formatValue(d.value)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

type LinePoint = { label: string; value: number }

export function LineChart({
  data,
  average,
  avgLabel,
  height = 100,
  className = '',
}: {
  data: LinePoint[]
  average?: number
  avgLabel?: string
  height?: number
  className?: string
}) {
  if (data.length === 0) return null

  const width = Math.max(data.length * 40, 120)
  const max = Math.max(...data.map((d) => d.value), average ?? 0, 1)
  const min = Math.min(...data.map((d) => d.value), average ?? Infinity, 0)
  const range = Math.max(max - min, 1)

  const py = (v: number) => height - ((v - min) / range) * (height - 16) - 8

  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (width - 16) + 8
    return `${x},${py(d.value)}`
  })

  const avgY = average != null ? py(average) : null

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label="Line chart"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>

      {/* Average reference line */}
      {avgY != null && (
        <>
          <line
            x1={8}
            y1={avgY}
            x2={width - 8}
            y2={avgY}
            stroke="#6366f1"
            strokeWidth="1.2"
            strokeDasharray="5 3"
            opacity="0.55"
          />
          <text
            x={width - 10}
            y={avgY - 4}
            textAnchor="end"
            fill="#a78bfa"
            fontSize="8.5"
            fontWeight="500"
          >
            {avgLabel ?? (average != null ? `avg ${average.toFixed(0)}` : '')}
          </text>
        </>
      )}

      {/* Data line */}
      <polyline
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points.join(' ')}
      />

      {/* Dots */}
      {data.map((d, i) => {
        const [x, y] = points[i].split(',').map(Number)
        return <circle key={`${d.label}-${i}`} cx={x} cy={y} r={3.5} fill="#6366f1" />
      })}
    </svg>
  )
}
