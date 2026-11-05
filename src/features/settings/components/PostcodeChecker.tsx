import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/fields'
import { formatPrice } from '@/lib/format'
import { settingsApi, type PostcodeCheck } from '@/services/settings/settings.api'

/** Checks against the saved settings, so save first to test new rings. */
export const PostcodeChecker = () => {
  const [postcode, setPostcode] = useState('')
  const [result, setResult] = useState<PostcodeCheck | null>(null)
  const [error, setError] = useState<string | null>(null)

  const check = async () => {
    setError(null)
    setResult(null)
    try {
      setResult(await settingsApi.checkPostcode(postcode))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not check that postcode')
    }
  }

  return (
    <div className="rounded-2xl bg-shea p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="Check a postcode"
            placeholder="NE13 6AA"
            className="uppercase"
            value={postcode}
            onChange={(event) => setPostcode(event.target.value)}
          />
        </div>
        <Button variant="dark" disabled={!postcode.trim()} onClick={() => void check()}>
          Check
        </Button>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-jollof-dark">{error}</p>}
      {result && (
        <p className="mt-2 text-sm">
          <strong>{result.postcode}</strong> ({result.city}) is {result.distanceMiles} miles away.{' '}
          {result.covered
            ? `Covered: ${result.fee ? formatPrice(result.fee) : 'free'} delivery, ${formatPrice(result.minimumOrder)} minimum.`
            : 'Outside the delivery area.'}
        </p>
      )}
    </div>
  )
}
