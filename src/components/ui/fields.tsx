import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

const CONTROL_CLASS =
  'w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-cocoa placeholder:text-muted transition focus:border-cocoa disabled:bg-cocoa/5 disabled:text-muted'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  containerClassName?: string
}

const FieldShell = ({
  label,
  error,
  hint,
  containerClassName,
  id,
  children,
}: FieldProps & { id: string; children: ReactNode }) => (
  <div className={cn('min-w-0', containerClassName)}>
    <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">
      {label}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-semibold text-jollof-dark">
        {error}
      </p>
    )}
  </div>
)

const describedBy = (id: string, error?: string) =>
  error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {}

export const TextField = ({
  label,
  error,
  hint,
  containerClassName,
  className,
  ...props
}: FieldProps & ComponentProps<'input'>) => {
  const id = useId()
  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      containerClassName={containerClassName}
      id={id}
    >
      <input
        id={id}
        className={cn(CONTROL_CLASS, 'h-11', className)}
        {...describedBy(id, error)}
        {...props}
      />
    </FieldShell>
  )
}

export const TextAreaField = ({
  label,
  error,
  hint,
  containerClassName,
  className,
  ...props
}: FieldProps & ComponentProps<'textarea'>) => {
  const id = useId()
  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      containerClassName={containerClassName}
      id={id}
    >
      <textarea
        id={id}
        rows={3}
        className={cn(CONTROL_CLASS, 'resize-y py-2.5', className)}
        {...describedBy(id, error)}
        {...props}
      />
    </FieldShell>
  )
}

export const SelectField = ({
  label,
  error,
  hint,
  containerClassName,
  className,
  ...props
}: FieldProps & ComponentProps<'select'>) => {
  const id = useId()
  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      containerClassName={containerClassName}
      id={id}
    >
      <select
        id={id}
        className={cn(CONTROL_CLASS, 'h-11', className)}
        {...describedBy(id, error)}
        {...props}
      />
    </FieldShell>
  )
}

export const CheckboxField = ({
  label,
  className,
  ...props
}: { label: string } & ComponentProps<'input'>) => (
  <label className={cn('flex min-h-9 cursor-pointer items-center gap-2.5 text-sm', className)}>
    <input
      type="checkbox"
      className="size-4 shrink-0 accent-[rgb(var(--color-jollof))]"
      {...props}
    />
    {label}
  </label>
)
