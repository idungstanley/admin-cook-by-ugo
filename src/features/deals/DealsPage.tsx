import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/ui/fields'
import { ImageField } from '@/components/ui/ImageField'
import { Drawer, OverlayBody, OverlayFooter, OverlayHeader } from '@/components/ui/Overlay'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { Toggle } from '@/components/ui/Toggle'
import { DEAL_THEMES, WEEK_DAYS } from '@/constants/menu'
import { cn } from '@/lib/cn'
import { formatPrice, penceToPounds, poundsToPence } from '@/lib/format'
import {
  useDeals,
  useDeleteDeal,
  useSaveDeal,
  useSetDealActive,
} from '@/services/deals/deals.queries'
import type { Deal, DealTheme } from '@/types'

const dealSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter a name'),
    tag: z.string().trim().min(2, 'Enter a short tag'),
    description: z.string().trim().min(5, 'List what is included'),
    price: z.number('Enter a price').positive('Enter a price'),
    wasPrice: z.number('Enter the full price').positive('Enter the full price'),
    image: z.string().min(1, 'Choose an image'),
    theme: z.enum(['jollof', 'ewedu', 'indigo']),
    active: z.boolean(),
    activeDays: z.array(z.number()).min(1, 'Choose at least one day'),
    startsOn: z.string().optional(),
    endsOn: z.string().optional(),
  })
  .refine(({ price, wasPrice }) => price < wasPrice, {
    path: ['price'],
    message: 'The deal price must be below the full price',
  })
  .refine(({ startsOn, endsOn }) => !startsOn || !endsOn || startsOn <= endsOn, {
    path: ['endsOn'],
    message: 'The end date must be after the start date',
  })

type DealValues = z.infer<typeof dealSchema>

const THEME_CLASSES: Record<DealTheme, string> = {
  jollof: 'bg-jollof',
  ewedu: 'bg-ewedu',
  indigo: 'bg-indigo',
}

const describeDays = (days: number[]) =>
  days.length === 7
    ? 'Every day'
    : WEEK_DAYS.filter(({ day }) => days.includes(day))
        .map(({ short }) => short)
        .join(', ')

const DealForm = ({ deal, onClose }: { deal: Deal | null; onClose: () => void }) => {
  const save = useSaveDeal()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<DealValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: deal
      ? { ...deal, price: penceToPounds(deal.price), wasPrice: penceToPounds(deal.wasPrice) }
      : {
          name: '',
          tag: '',
          description: '',
          image: '',
          theme: 'jollof',
          active: true,
          activeDays: WEEK_DAYS.map(({ day }) => day),
        },
  })
  const image = useWatch({ control, name: 'image' })
  const activeDays = useWatch({ control, name: 'activeDays' })

  const toggleDay = (day: number) =>
    setValue(
      'activeDays',
      activeDays.includes(day) ? activeDays.filter((entry) => entry !== day) : [...activeDays, day],
      { shouldValidate: true },
    )

  const submit = ({ price, wasPrice, ...values }: DealValues) =>
    save.mutate(
      {
        id: deal?.id,
        input: { ...values, price: poundsToPence(price), wasPrice: poundsToPence(wasPrice) },
      },
      { onSuccess: onClose },
    )

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex h-full flex-col">
      <OverlayHeader title={deal ? 'Edit deal' : 'Add deal'} onClose={onClose} />
      <OverlayBody className="flex flex-col gap-4">
        <ImageField
          label="Photo"
          value={image}
          onChange={(url) => setValue('image', url, { shouldValidate: true })}
        />
        {errors.image && (
          <p role="alert" className="text-xs font-semibold text-jollof-dark">
            {errors.image.message}
          </p>
        )}
        <TextField label="Name" error={errors.name?.message} {...register('name')} />
        <TextField
          label="Tag"
          hint="For example, Feeds 4"
          error={errors.tag?.message}
          {...register('tag')}
        />
        <TextAreaField
          label="What is included"
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Deal price (£)"
            type="number"
            step="0.01"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <TextField
            label="Was price (£)"
            type="number"
            step="0.01"
            error={errors.wasPrice?.message}
            {...register('wasPrice', { valueAsNumber: true })}
          />
        </div>
        <SelectField label="Card colour" {...register('theme')}>
          {DEAL_THEMES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-semibold">Active days</legend>
          <div className="flex flex-wrap gap-1.5">
            {WEEK_DAYS.map(({ day, short }) => (
              <Chip key={day} active={activeDays.includes(day)} onClick={() => toggleDay(day)}>
                {short}
              </Chip>
            ))}
          </div>
          {errors.activeDays && (
            <p role="alert" className="mt-1 text-xs font-semibold text-jollof-dark">
              {errors.activeDays.message}
            </p>
          )}
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Starts (optional)" type="date" {...register('startsOn')} />
          <TextField
            label="Ends (optional)"
            type="date"
            error={errors.endsOn?.message}
            {...register('endsOn')}
          />
        </div>
        <CheckboxField label="Show this deal on the website" {...register('active')} />
      </OverlayBody>
      <OverlayFooter>
        <Button type="submit" disabled={save.isPending}>
          Save deal
        </Button>
      </OverlayFooter>
    </form>
  )
}

export const DealsPage = () => {
  const { data: deals, isPending, isError, refetch } = useDeals()
  const setActive = useSetDealActive()
  const deleteDeal = useDeleteDeal()
  const [editing, setEditing] = useState<Deal | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Deal | null>(null)

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  const deal = editing === 'new' ? null : editing
  const closeDrawer = () => setEditing(null)

  return (
    <>
      <PageHeader
        title="Deals"
        description="Offers on the website, with the days they run."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Add deal
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deals.map((entry) => (
          <Card key={entry.id} className="flex flex-col overflow-hidden p-0">
            <div
              className={cn('flex items-center gap-3 p-4 text-white', THEME_CLASSES[entry.theme])}
            >
              <img src={entry.image} alt="" className="size-16 rounded-full object-cover" />
              <div className="min-w-0">
                <h2 className="truncate text-xl">{entry.name}</h2>
                <p className="text-xs text-white/85">{entry.tag}</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <p className="text-sm text-muted">{entry.description}</p>
              <p className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold">
                  {formatPrice(entry.price)}
                </span>
                <span className="text-sm text-muted line-through">
                  {formatPrice(entry.wasPrice)}
                </span>
              </p>
              <p className="text-sm">
                <strong>Runs:</strong> {describeDays(entry.activeDays)}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(entry)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleting(entry)}>
                    Delete
                  </Button>
                </div>
                <Toggle
                  label={`${entry.name} active`}
                  checked={entry.active}
                  onChange={(active) => setActive.mutate({ id: entry.id, active })}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Drawer open={editing !== null} onClose={closeDrawer} label="Deal">
        <DealForm key={deal?.id ?? 'new'} deal={deal} onClose={closeDrawer} />
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? 'deal'}?`}
        body="It will be removed from the website."
        confirmLabel="Delete deal"
        destructive
        pending={deleteDeal.isPending}
        onConfirm={() =>
          deleting && deleteDeal.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
