import { Search } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export const SearchInput = ({ value, onChange, placeholder, className }: SearchInputProps) => (
  <label
    className={cn(
      'flex h-11 items-center gap-2 rounded-full border border-line bg-paper px-4',
      className,
    )}
  >
    <Search className="size-4 shrink-0 text-muted" aria-hidden />
    <span className="sr-only">{placeholder}</span>
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted"
    />
  </label>
)
