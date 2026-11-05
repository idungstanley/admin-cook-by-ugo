import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { CardSection } from '@/components/ui/Card'
import { CheckboxField, TextField } from '@/components/ui/fields'
import { IconButton } from '@/components/ui/IconButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { WEEK_DAYS } from '@/constants/menu'
import { penceToPounds, poundsToPence } from '@/lib/format'
import { createId } from '@/lib/ids'
import { useSaveSettings, useSettings } from '@/services/settings/settings.queries'
import type { ShopSettings } from '@/types'
import { DeliveryMap } from './components/DeliveryMap'
import { PostcodeChecker } from './components/PostcodeChecker'

const money = (label: string) => z.number(`Enter ${label}`).min(0, 'Cannot be negative')

const settingsSchema = z.object({
  hours: z.array(
    z.object({ day: z.number(), open: z.boolean(), opensAt: z.string(), closesAt: z.string() }),
  ),
  closures: z.array(
    z.object({
      id: z.string(),
      date: z.string().min(1, 'Choose a date'),
      label: z.string().trim().min(2, 'Add a label'),
    }),
  ),
  kitchenPostcode: z
    .string()
    .trim()
    .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, 'Enter the kitchen postcode'),
  deliveryRadii: z
    .array(
      z.object({
        id: z.string(),
        maxMiles: z.number('Enter miles').positive('Enter miles').max(50, 'Up to 50 miles'),
        fee: money('a fee'),
        minimumOrder: money('a minimum'),
        active: z.boolean(),
      }),
    )
    .min(1, 'Add at least one delivery radius'),
  freeDeliveryThreshold: money('an amount'),
  prepMinutes: z.number('Enter minutes').int().min(5, 'At least 5 minutes'),
  deliveryMinutes: z.number('Enter minutes').int().min(5, 'At least 5 minutes'),
})

type SettingsValues = z.infer<typeof settingsSchema>

const toFormValues = (settings: ShopSettings): SettingsValues => ({
  hours: settings.hours,
  closures: settings.closures,
  kitchenPostcode: settings.kitchen.postcode,
  deliveryRadii: settings.deliveryRadii.map((ring) => ({
    ...ring,
    fee: penceToPounds(ring.fee),
    minimumOrder: penceToPounds(ring.minimumOrder),
  })),
  freeDeliveryThreshold: penceToPounds(settings.freeDeliveryThreshold),
  prepMinutes: settings.prepMinutes,
  deliveryMinutes: settings.deliveryMinutes,
})

const SettingsForm = ({ settings }: { settings: ShopSettings }) => {
  const save = useSaveSettings()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: toFormValues(settings),
  })
  const closures = useFieldArray({ control, name: 'closures', keyName: 'fieldKey' })
  const rings = useFieldArray({ control, name: 'deliveryRadii', keyName: 'fieldKey' })
  const liveRings = useWatch({ control, name: 'deliveryRadii' })

  const submit = (values: SettingsValues) =>
    save.mutate({
      ...values,
      deliveryRadii: values.deliveryRadii.map((ring) => ({
        ...ring,
        fee: poundsToPence(ring.fee),
        minimumOrder: poundsToPence(ring.minimumOrder),
      })),
      freeDeliveryThreshold: poundsToPence(values.freeDeliveryThreshold),
    })

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      className="grid items-start gap-4 xl:grid-cols-2"
    >
      <CardSection title="Opening hours" description="Customers cannot order outside these times.">
        <div className="flex flex-col gap-2">
          {settings.hours.map(({ day }, index) => (
            <div key={day} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <CheckboxField
                label={WEEK_DAYS.find((entry) => entry.day === day)?.label ?? ''}
                {...register(`hours.${index}.open`)}
              />
              <input
                type="time"
                aria-label="Opens at"
                className="h-10 rounded-xl border border-line bg-paper px-2 text-sm"
                {...register(`hours.${index}.opensAt`)}
              />
              <input
                type="time"
                aria-label="Closes at"
                className="h-10 rounded-xl border border-line bg-paper px-2 text-sm"
                {...register(`hours.${index}.closesAt`)}
              />
            </div>
          ))}
        </div>
      </CardSection>

      <div className="flex flex-col gap-4">
        <CardSection
          title="Holidays and closures"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => closures.append({ id: createId('closure'), date: '', label: '' })}
            >
              <Plus className="size-4" /> Add
            </Button>
          }
        >
          {closures.fields.length === 0 && (
            <p className="text-sm text-muted">No closures planned.</p>
          )}
          <div className="flex flex-col gap-2">
            {closures.fields.map((field, index) => (
              <div key={field.fieldKey} className="grid grid-cols-[1fr_1fr_2.5rem] items-end gap-2">
                <TextField
                  label="Date"
                  type="date"
                  error={errors.closures?.[index]?.date?.message}
                  {...register(`closures.${index}.date`)}
                />
                <TextField
                  label="Reason"
                  error={errors.closures?.[index]?.label?.message}
                  {...register(`closures.${index}.label`)}
                />
                <IconButton label="Remove closure" onClick={() => closures.remove(index)}>
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            ))}
          </div>
        </CardSection>

        <CardSection
          title="Kitchen and timing"
          description="Customers see the arrival time as preparation plus delivery."
        >
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Kitchen postcode"
              className="uppercase"
              error={errors.kitchenPostcode?.message}
              {...register('kitchenPostcode')}
            />
            <TextField
              label="Free delivery over (£)"
              type="number"
              step="0.01"
              error={errors.freeDeliveryThreshold?.message}
              {...register('freeDeliveryThreshold', { valueAsNumber: true })}
            />
            <TextField
              label="Average preparation (minutes)"
              type="number"
              min="5"
              error={errors.prepMinutes?.message}
              {...register('prepMinutes', { valueAsNumber: true })}
            />
            <TextField
              label="Average delivery (minutes)"
              type="number"
              min="5"
              error={errors.deliveryMinutes?.message}
              {...register('deliveryMinutes', { valueAsNumber: true })}
            />
          </div>
        </CardSection>
      </div>

      <CardSection
        title="Delivery area"
        description="Every postcode inside a ring can order, and pays that ring's fee. Distance is measured in a straight line from the kitchen."
        className="xl:col-span-2"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              rings.append({
                id: createId('radius'),
                maxMiles: Math.max(0, ...liveRings.map(({ maxMiles }) => maxMiles || 0)) + 2,
                fee: 5.99,
                minimumOrder: 15,
                active: true,
              })
            }
          >
            <Plus className="size-4" /> Add ring
          </Button>
        }
      >
        <div className="grid items-start gap-4 lg:grid-cols-[1.3fr_1fr]">
          <DeliveryMap centre={settings.kitchen} radii={liveRings} />
          <div className="flex flex-col gap-3">
            {errors.deliveryRadii?.root?.message && (
              <p role="alert" className="text-xs font-semibold text-jollof-dark">
                {errors.deliveryRadii.root.message}
              </p>
            )}
            {rings.fields.map((field, index) => (
              <div
                key={field.fieldKey}
                className="grid grid-cols-3 items-end gap-2 border-b border-line pb-3 last:border-b-0"
              >
                <TextField
                  label="Up to (miles)"
                  type="number"
                  step="0.5"
                  error={errors.deliveryRadii?.[index]?.maxMiles?.message}
                  {...register(`deliveryRadii.${index}.maxMiles`, { valueAsNumber: true })}
                />
                <TextField
                  label="Fee (£)"
                  type="number"
                  step="0.01"
                  error={errors.deliveryRadii?.[index]?.fee?.message}
                  {...register(`deliveryRadii.${index}.fee`, { valueAsNumber: true })}
                />
                <TextField
                  label="Minimum (£)"
                  type="number"
                  step="0.01"
                  error={errors.deliveryRadii?.[index]?.minimumOrder?.message}
                  {...register(`deliveryRadii.${index}.minimumOrder`, { valueAsNumber: true })}
                />
                <CheckboxField
                  label="Active"
                  className="col-span-2 h-9"
                  {...register(`deliveryRadii.${index}.active`)}
                />
                <IconButton
                  label="Remove ring"
                  className="justify-self-end"
                  onClick={() => rings.remove(index)}
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            ))}
            <PostcodeChecker />
          </div>
        </div>
      </CardSection>

      <div className="sticky bottom-3 flex justify-end xl:col-span-2">
        <Button type="submit" size="lg" className="shadow-float" disabled={save.isPending}>
          Save settings
        </Button>
      </div>
    </form>
  )
}

export const SettingsPage = () => {
  const { data: settings, isPending, isError, refetch } = useSettings()

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  return (
    <>
      <PageHeader
        title="Shop settings"
        description="Use Pause orders at the top of the page to stop orders right away."
      />
      <SettingsForm settings={settings} />
    </>
  )
}
