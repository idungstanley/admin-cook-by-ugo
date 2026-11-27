import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { settingsApi } from '@/services/settings/settings.api'

const newSession = () => crypto.randomUUID()

/** Type-ahead search for the kitchen's address, with Google Places. */
export const KitchenAddressSearch = ({
  onPick,
}: {
  onPick: (address: { street: string; postcode: string }) => void
}) => {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [session, setSession] = useState(newSession)

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 300)
    return () => clearTimeout(timer)
  }, [text])

  const suggestions = useQuery({
    queryKey: ['kitchen-address-search', query, session],
    queryFn: () => settingsApi.searchAddresses(query, session),
    enabled: query.length >= 3,
    retry: false,
  })
  const choose = useMutation({
    mutationFn: (placeId: string) => settingsApi.getPlaceAddress(placeId, session),
    onSuccess: (address) => {
      onPick({ street: address.line1, postcode: address.postcode })
      setText(`${address.line1}, ${address.postcode}`)
      setQuery('')
      setSession(newSession())
    },
  })
  const list = query.length >= 3 ? (suggestions.data ?? []) : []

  return (
    <div className="col-span-2">
      <label htmlFor="kitchen-address-search" className="mb-1.5 block text-[13px] font-semibold">
        Search for the kitchen address
      </label>
      <input
        id="kitchen-address-search"
        value={text}
        autoComplete="off"
        placeholder="Start typing the address"
        onChange={(event) => setText(event.target.value)}
        className="h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-sm"
      />
      {list.length > 0 && (
        <ul className="mt-1 max-h-60 overflow-y-auto rounded-xl border border-line bg-paper py-1">
          {list.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                onClick={() => choose.mutate(suggestion.id)}
                className="w-full px-3.5 py-2 text-left text-sm hover:bg-shea"
              >
                <span className="font-semibold">{suggestion.text}</span>{' '}
                <span className="text-xs text-muted">{suggestion.secondary}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {(choose.error ?? suggestions.error) && (
        <p role="alert" className="mt-1 text-xs font-semibold text-jollof-dark">
          {(choose.error ?? suggestions.error)?.message}
        </p>
      )}
    </div>
  )
}
