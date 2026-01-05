import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle'
type ButtonSize = 'sm' | 'md' | 'lg'

interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-(--pkf-primary) text-white hover:bg-(--pkf-primary-hover)) ring-1 ring-white/10',
  secondary:
    'bg-(--pkf-surface) text-(--pkf-text-strong) ring-1 ring-(--pkf-border) hover:bg-(--pkf-surface-hover))',
  ghost:
    'bg-transparent text-(--pkf-text) hover:bg-(--pkf-overlay-hover)',
  subtle:
    'bg-(--pkf-overlay) text-(--pkf-text) ring-1 ring-(--pkf-border-subtle) hover:bg-(--pkf-overlay-hover)',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-[13px] gap-1.5 rounded-xl',
  md: 'px-4 py-2.5 text-[14px] gap-2 rounded-2xl',
  lg: 'px-5 py-3 text-[15px] gap-2.5 rounded-2xl',
}

export function SoftButton({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  ...props
}: SoftButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={[
        'pkf-focus inline-flex items-center justify-center font-medium transition-all',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading ? <span className="shrink-0">{iconRight}</span> : null}
    </button>
  )
}
