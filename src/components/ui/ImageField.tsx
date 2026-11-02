import { useId, useState } from 'react'
import { uploadImage } from '@/services/uploads.api'
import { useToastStore } from '@/stores/toast.store'

interface ImageFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
}

export const ImageField = ({ label, value, onChange }: ImageFieldProps) => {
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
          {uploading ? 'Uploading...' : 'Choose image'}
        </label>
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
