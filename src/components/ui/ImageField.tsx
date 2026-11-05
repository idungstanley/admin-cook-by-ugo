import { useId, useState } from 'react'
import { uploadImage } from '@/services/uploads.api'
import { useToastStore } from '@/stores/toast.store'

interface ImageFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  /** A small square for lists, such as the photo for each option choice. */
  compact?: boolean
}

export const ImageField = ({ label, value, onChange, compact }: ImageFieldProps) => {
  const id = useId()
  const [uploading, setUploading] = useState(false)
  const toast = useToastStore((state) => state.push)

  const upload = async (file: File) => {
    setUploading(true)
    try {
      onChange(await uploadImage(file))
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <span className={compact ? 'sr-only' : 'mb-1.5 block text-[13px] font-semibold'}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt=""
            className={
              compact ? 'size-11 rounded-full object-cover' : 'size-20 rounded-xl object-cover'
            }
          />
        ) : (
          <span
            className={
              compact
                ? 'grid size-11 place-items-center rounded-full bg-shea text-[10px] text-muted'
                : 'grid size-20 place-items-center rounded-xl bg-shea text-xs text-muted'
            }
          >
            No photo
          </span>
        )}
        <label
          htmlFor={id}
          className="cursor-pointer text-sm font-semibold underline underline-offset-2"
        >
          {uploading ? 'Uploading...' : compact ? (value ? 'Change' : 'Add') : 'Choose image'}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-sm font-semibold text-muted underline-offset-2 hover:underline"
          >
            Remove
          </button>
        )}
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
          }}
        />
      </div>
    </div>
  )
}
