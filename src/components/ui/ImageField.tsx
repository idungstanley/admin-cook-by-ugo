import { useId } from 'react'

interface ImageFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
}

/** Mock upload using a temporary browser URL. Appwrite Storage replaces this. */
export const ImageField = ({ label, value, onChange }: ImageFieldProps) => {
  const id = useId()

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="size-20 rounded-xl object-cover" />
        ) : (
          <span className="grid size-20 place-items-center rounded-xl bg-shea text-xs text-muted">
            No image
          </span>
        )}
        <label
          htmlFor={id}
          className="cursor-pointer text-sm font-semibold underline underline-offset-2"
        >
          Choose image
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onChange(URL.createObjectURL(file))
          }}
        />
      </div>
    </div>
  )
}
