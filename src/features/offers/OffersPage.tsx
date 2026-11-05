import { zodResolver } from '@hookform/resolvers/zod'
import { BadgePercent, Gift, PoundSterling, Plus, Truck, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CheckboxField, SelectField, TextField } from '@/components/ui/fields'
import { Drawer, OverlayBody, OverlayFooter, OverlayHeader } from '@/components/ui/Overlay'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { Toggle } from '@/components/ui/Toggle'
import { formatDateTime, formatPrice, penceToPounds, poundsToPence } from '@/lib/format'
import { useDishes } from '@/services/menu/menu.queries'
import {
  useDeleteOffer,
  useOffers,
  useSaveOffer,
  useSetOfferActive,
} from '@/services/offers/offers.queries'
import type { Dish, Offer, OfferType } from '@/types'

const TEMPLATES: { type: OfferType; title: string; body: string; icon: LucideIcon }[] = [
  {
    type: 'bogo',
    title: 'Buy 1, get 1 free',
    body: 'Every second portion of the chosen dishes is free. Great for slower days.',
    icon: Gift,
  },
  {
    type: 'percent',
    title: 'Percent off',
    body: 'A percentage off chosen dishes, or off the whole order.',
    icon: BadgePercent,
  },
  {
    type: 'amount',
    title: 'Money off',
    body: 'A fixed amount off, such as £5 off orders over £30.',
    icon: PoundSterling,
  },
  {
    type: 'free-delivery',
    title: 'Free delivery',
    body: 'No delivery fee, optionally above a minimum spend.',
    icon: Truck,
  },
]

const TYPE_LABELS: Record<OfferType, string> = {
  bogo: 'Buy 1, get 1 free',
  percent: 'Percent off',
  amount: 'Money off',
  'free-delivery': 'Free delivery',
}

/** `datetime-local` works in the browser's own time, which is the shop's time in Newcastle. */
const toLocalInput = (iso?: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

const offerSchema = z
  .object({
    name: z.string().trim().min(2, 'Give the offer a name customers will see'),
    type: z.enum(['bogo', 'percent', 'amount', 'free-delivery']),
    value: z.number().or(z.nan()),
    dishIds: z.array(z.string()),
    minSubtotal: z.number().min(0).or(z.nan()),
    startsAt: z.string(),
    endsAt: z.string(),
    active: z.boolean(),
  })
  .refine(({ type, value }) => type !== 'percent' || (value >= 1 && value <= 100), {
    path: ['value'],
    message: 'Enter a percentage from 1 to 100',
  })
  .refine(({ type, value }) => type !== 'amount' || value > 0, {
    path: ['value'],
    message: 'Enter the amount off',
  })
  .refine(({ type, dishIds }) => type !== 'bogo' || dishIds.length > 0, {
    path: ['dishIds'],
    message: 'Choose at least one dish',
  })
  .refine(({ startsAt, endsAt }) => !startsAt || !endsAt || endsAt > startsAt, {
    path: ['endsAt'],
    message: 'The offer must end after it starts',
  })

type OfferValues = z.infer<typeof offerSchema>

const offerStatus = (offer: Offer, now = Date.now()): { label: string; tone: BadgeTone } => {
  if (!offer.active) return { label: 'Paused', tone: 'neutral' }
  if (offer.endsAt && new Date(offer.endsAt).getTime() <= now)
    return { label: 'Ended', tone: 'neutral' }
  if (offer.startsAt && new Date(offer.startsAt).getTime() > now) {
    return { label: 'Scheduled', tone: 'indigo' }
  }
  return { label: 'Live', tone: 'ewedu' }
}

const describeOffer = (offer: Offer, dishes: Dish[]) => {
  const names = offer.dishIds.map(
    (id) => dishes.find((dish) => dish.id === id)?.name ?? 'Removed dish',
  )
  const amount =
    offer.type === 'percent'
      ? `${offer.value}% off`
      : offer.type === 'amount'
        ? `${formatPrice(offer.value)} off`
        : TYPE_LABELS[offer.type]
  return `${amount} ${names.length ? `on ${names.join(', ')}` : 'on the whole order'}`
}

interface OfferFormProps {
  offer: Offer | null
  initialType: OfferType
  dishes: Dish[]
  onClose: () => void
}

const OfferForm = ({ offer, initialType, dishes, onClose }: OfferFormProps) => {
  const save = useSaveOffer()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OfferValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      name: offer?.name ?? TEMPLATES.find(({ type }) => type === initialType)?.title ?? '',
      type: offer?.type ?? initialType,
      value: offer
        ? offer.type === 'amount'
          ? penceToPounds(offer.value)
          : offer.value
        : initialType === 'percent'
          ? 20
          : initialType === 'amount'
            ? 5
            : 0,
      dishIds: offer?.dishIds ?? [],
      minSubtotal: offer ? penceToPounds(offer.minSubtotal) : 0,
      startsAt: toLocalInput(offer?.startsAt),
      endsAt: toLocalInput(offer?.endsAt),
      active: offer?.active ?? true,
    },
  })
  const type = useWatch({ control, name: 'type' })

  const submit = (values: OfferValues) =>
    save.mutate(
      {
        id: offer?.id,
        input: {
          name: values.name,
          type: values.type,
          value:
            values.type === 'amount'
              ? poundsToPence(values.value || 0)
              : values.type === 'percent'
                ? Math.round(values.value || 0)
                : 0,
          dishIds: values.type === 'free-delivery' ? [] : values.dishIds,
          minSubtotal: poundsToPence(values.minSubtotal || 0),
          startsAt: values.startsAt ? new Date(values.startsAt).getTime() : null,
          endsAt: values.endsAt ? new Date(values.endsAt).getTime() : null,
          active: values.active,
        },
      },
      { onSuccess: onClose },
    )

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex h-full flex-col">
      <OverlayHeader title={offer ? 'Edit offer' : 'New offer'} onClose={onClose} />
      <OverlayBody className="flex flex-col gap-4">
        <TextField
          label="Name customers see"
          placeholder="Jollof Friday"
          error={errors.name?.message}
          {...register('name')}
        />
        <SelectField label="Type" {...register('type')}>
          {TEMPLATES.map(({ type: value, title }) => (
            <option key={value} value={value}>
              {title}
            </option>
          ))}
        </SelectField>

        {(type === 'percent' || type === 'amount') && (
          <TextField
            label={type === 'percent' ? 'Percent off' : 'Amount off (£)'}
            type="number"
            step={type === 'percent' ? '1' : '0.01'}
            min="0"
            error={errors.value?.message}
            {...register('value', { valueAsNumber: true })}
          />
        )}

        <TextField
          label="Minimum spend (£, optional)"
          type="number"
          step="0.01"
          min="0"
          {...register('minSubtotal', { valueAsNumber: true })}
        />

        {type !== 'free-delivery' && (
          <fieldset>
            <legend className="text-[13px] font-semibold">Dishes</legend>
            <p className="mb-1 text-xs text-muted">
              {type === 'bogo'
                ? 'Choose the dishes. Every second portion is free.'
                : 'Leave all unticked for money off the whole order.'}
            </p>
            {errors.dishIds?.message && (
              <p role="alert" className="mb-1 text-xs font-semibold text-jollof-dark">
                {errors.dishIds.message}
              </p>
            )}
            <div className="grid gap-x-3 sm:grid-cols-2">
              {dishes.map(({ id, name }) => (
                <CheckboxField key={id} label={name} value={id} {...register('dishIds')} />
              ))}
            </div>
          </fieldset>
        )}

        <div className="grid grid-cols-2 gap-3">
          <TextField label="Starts (optional)" type="datetime-local" {...register('startsAt')} />
          <TextField
            label="Ends (optional)"
            type="datetime-local"
            error={errors.endsAt?.message}
            {...register('endsAt')}
          />
        </div>
        <p className="-mt-2 text-xs text-muted">
          Without dates, the offer runs as soon as you save it, until you pause it.
        </p>
        <CheckboxField label="Switched on" {...register('active')} />
        <p className="rounded-xl bg-shea px-3 py-2 text-xs text-muted">
          Offers do not stack. Each order automatically gets the single biggest saving, plus free
          delivery if a free delivery offer also applies.
        </p>
      </OverlayBody>
      <OverlayFooter>
        <Button type="submit" disabled={save.isPending}>
          Save offer
        </Button>
      </OverlayFooter>
    </form>
  )
}

export const OffersPage = () => {
  const { data: offers, isPending, isError, refetch } = useOffers()
  const { data: dishes = [] } = useDishes()
  const setActive = useSetOfferActive()
  const deleteOffer = useDeleteOffer()
  const [editing, setEditing] = useState<{ offer: Offer | null; type: OfferType } | null>(null)
  const [deleting, setDeleting] = useState<Offer | null>(null)

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  const closeDrawer = () => setEditing(null)

  return (
    <>
      <PageHeader
        title="Offers"
        description="Campaigns you can switch on for a day, a weekend or until you pause them."
        actions={
          <Button onClick={() => setEditing({ offer: null, type: 'percent' })}>
            <Plus className="size-4" /> New offer
          </Button>
        }
      />

      <h2 className="mb-3 text-lg">Start from a template</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TEMPLATES.map(({ type, title, body, icon: Icon }) => (
          <Card key={type} className="flex flex-col gap-2">
            <span className="grid size-10 place-items-center rounded-full bg-gold-soft">
              <Icon className="size-5" />
            </span>
            <h3 className="text-base">{title}</h3>
            <p className="flex-1 text-sm text-muted">{body}</p>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setEditing({ offer: null, type })}
            >
              Create
            </Button>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-lg">Your offers</h2>
      {offers.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No offers yet. Pick a template above to start one.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => {
            const status = offerStatus(offer)
            return (
              <Card key={offer.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg">{offer.name}</h3>
                    <p className="text-xs text-muted">{TYPE_LABELS[offer.type]}</p>
                  </div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <p className="text-sm">{describeOffer(offer, dishes)}</p>
                <dl className="text-xs text-muted">
                  {offer.minSubtotal > 0 && <dd>Minimum spend {formatPrice(offer.minSubtotal)}</dd>}
                  <dd>
                    {offer.startsAt
                      ? `From ${formatDateTime(new Date(offer.startsAt).getTime())}`
                      : 'Starts straight away'}
                    {offer.endsAt
                      ? ` · until ${formatDateTime(new Date(offer.endsAt).getTime())}`
                      : ' · no end date'}
                  </dd>
                </dl>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing({ offer, type: offer.type })}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleting(offer)}>
                      Delete
                    </Button>
                  </div>
                  <Toggle
                    label={`${offer.name} switched on`}
                    checked={offer.active}
                    onChange={(active) => setActive.mutate({ id: offer.id, active })}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Drawer open={editing !== null} onClose={closeDrawer} label="Offer">
        {editing && (
          <OfferForm
            key={editing.offer?.id ?? `new-${editing.type}`}
            offer={editing.offer}
            initialType={editing.type}
            dishes={dishes}
            onClose={closeDrawer}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? 'offer'}?`}
        body="It stops straight away. Past orders keep their savings."
        confirmLabel="Delete offer"
        destructive
        pending={deleteOffer.isPending}
        onConfirm={() =>
          deleting && deleteOffer.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
