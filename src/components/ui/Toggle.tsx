import { cn } from '@/lib/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}

export const Toggle = ({ checked, onChange, label, disabled }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-40',
      checked ? 'bg-ewedu' : 'bg-cocoa/25',
    )}
  >
    <span
      className={cn(
        'absolute left-1 top-1 size-5 rounded-full bg-paper transition-transform',
        checked && 'translate-x-5',
      )}
    />
  </button>
)
