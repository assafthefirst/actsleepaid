import type { PropsWithChildren, HTMLAttributes } from 'react'

export function Card({
  children,
  className = '',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={`rounded-[var(--radius-card)] bg-night-800/90 border border-night-600/50 p-4 shadow-xl shadow-black/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h2 className={`text-sm font-medium tracking-wide text-lavender/80 uppercase ${className}`}>
      {children}
    </h2>
  )
}
