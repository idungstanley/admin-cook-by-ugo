import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { createId } from '@/services/mockClient'
import { useSaveSettings, useSettings } from '@/services/settings/settings.queries'
import type { ShopSettings } from '@/types'

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
  zones: z.array(
    z.object({
      id: z.string(),
      prefix: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?$/, 'Use a postcode area, like NE1'),
      fee: money('a fee'),
      minimumOrder: money('a minimum'),
      active: z.boolean(),
    }),
  ),
  freeDeliveryThreshold: money('an amount'),
  etaMinutes: z.number('Enter minutes').int().positive('Enter minutes'),
  cardEnabled: z.boolean(),
  payOnDeliveryEnabled: z.boolean(),
  payOnDeliveryLimit: money('a limit'),
})

type SettingsValues = z.infer<typeof settingsSchema>

const toFormValues = (settings: ShopSettings): SettingsValues => ({
  ...settings,
  zones: settings.zones.map((zone) => ({
    ...zone,
    fee: penceToPounds(zone.fee),
    minimumOrder: penceToPounds(zone.minimumOrder),
  })),
  freeDeliveryThreshold: penceToPounds(settings.freeDeliveryThreshold),
  payOnDeliveryLimit: penceToPounds(settings.payOnDeliveryLimit),
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
  const zones = useFieldArray({ control, name: 'zones', keyName: 'fieldKey' })

  const submit = (values: SettingsValues) =>
    save.mutate({
      ...values,
      zones: values.zones.map((zone) => ({
        ...zone,
        fee: poundsToPence(zone.fee),
        minimumOrder: poundsToPence(zone.minimumOrder),
      })),
      freeDeliveryThreshold: poundsToPence(values.freeDeliveryThreshold),
      payOnDeliveryLimit: poundsToPence(values.payOnDeliveryLimit),
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

        <CardSection title="Delivery rules">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Free delivery over (£)"
              type="number"
              step="0.01"
              error={errors.freeDeliveryThreshold?.message}
              {...register('freeDeliveryThreshold', { valueAsNumber: true })}
            />
            <TextField
              label="Default ETA (minutes)"
              type="number"
              error={errors.etaMinutes?.message}
              {...register('etaMinutes', { valueAsNumber: true })}
            />
          </div>
        </CardSection>

        <CardSection title="Payment methods">
          <CheckboxField label="Card online" {...register('cardEnabled')} />
          <CheckboxField label="Pay on delivery" {...register('payOnDeliveryEnabled')} />
          <TextField
            label="Largest pay-on-delivery order (£)"
            type="number"
            step="0.01"
            className="mt-2"
            error={errors.payOnDeliveryLimit?.message}
            {...register('payOnDeliveryLimit', { valueAsNumber: true })}
          />
        </CardSection>
      </div>

      <CardSection
        title="Delivery zones"
        description="Only postcodes in an active zone can order."
        className="xl:col-span-2"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              zones.append({
                id: createId('zone'),
                prefix: '',
                fee: 2.99,
                minimumOrder: 12,
                active: true,
              })
            }
          >
            <Plus className="size-4" /> Add zone
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          {zones.fields.map((field, index) => (
            <div
              key={field.fieldKey}
              className="grid grid-cols-2 items-end gap-2 border-b border-line pb-3 last:border-b-0 sm:grid-cols-[1fr_1fr_1fr_auto_2.5rem]"
            >
              <TextField
                label="Postcode area"
                error={errors.zones?.[index]?.prefix?.message}
                {...register(`zones.${index}.prefix`)}
              />
              <TextField
                label="Fee (£)"
                type="number"
                step="0.01"
                error={errors.zones?.[index]?.fee?.message}
                {...register(`zones.${index}.fee`, { valueAsNumber: true })}
              />
              <TextField
                label="Minimum order (£)"
                type="number"
                step="0.01"
                error={errors.zones?.[index]?.minimumOrder?.message}
                {...register(`zones.${index}.minimumOrder`, { valueAsNumber: true })}
              />
              <CheckboxField
                label="Active"
                className="h-11"
                {...register(`zones.${index}.active`)}
              />
              <IconButton label="Remove zone" onClick={() => zones.remove(index)}>
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          ))}
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
