import { useMutation } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { settingsApi } from '@/services/settings/settings.api'

interface KitchenAddressFinderProps {
  /** Reads the postcode currently typed in the form. */
  getPostcode: () => string
  onPick: (address: { street: string; postcode: string }) => void
}

/** Looks up the kitchen's postcode and lets the owner pick the exact address. */
export const KitchenAddressFinder = ({ getPostcode, onPick }: KitchenAddressFinderProps) => {
  const lookup = useMutation({ mutationFn: settingsApi.findAddresses })
  const found = lookup.data

  return (
    <div className="col-span-2 flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        disabled={lookup.isPending}
        onClick={() => lookup.mutate(getPostcode())}
      >
        <Search className="size-4" /> {lookup.isPending ? 'Finding...' : 'Find kitchen address'}
      </Button>
      {lookup.error && (
        <p role="alert" className="text-xs font-semibold text-jollof-dark">
          {lookup.error.message}
        </p>
      )}
      {found &&
        (found.addresses.length > 0 ? (
          <select
            aria-label="Choose the kitchen address"
            defaultValue=""
            className="h-11 rounded-xl border border-line bg-paper px-3 text-sm"
            onChange={(event) => {
              const address = found.addresses.find(({ id }) => id === event.target.value)
              if (address)
                onPick({
                  street: [address.line1, address.line2].filter(Boolean).join(', '),
                  postcode: found.postcode,
                })
            }}
          >
            <option value="" disabled>
              Choose the address ({found.addresses.length} found)
            </option>
            {found.addresses.map(({ id, line1, line2 }) => (
              <option key={id} value={id}>
                {[line1, line2].filter(Boolean).join(', ')}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-muted">
            {found.postcode} is in {found.city}. Type the street below (the address list appears
            once Ideal Postcodes is set up).
          </p>
        ))}
    </div>
  )
}
