import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CheckboxField, TextField } from '@/components/ui/fields'
import { IconButton } from '@/components/ui/IconButton'
import { Drawer, OverlayBody, OverlayFooter, OverlayHeader } from '@/components/ui/Overlay'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { formatPrice, penceToPounds, pluralise, poundsToPence } from '@/lib/format'
import { createId } from '@/lib/ids'
import {
  useDeleteOptionGroup,
  useDishes,
  useOptionGroups,
  useSaveOptionGroup,
} from '@/services/menu/menu.queries'
import type { Dish, OptionGroup } from '@/types'

const groupSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title'),
  required: z.boolean(),
  maxChoices: z.number('Enter a number').int().min(1, 'At least 1'),
  choices: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().trim().min(1, 'Enter a label'),
        price: z.number('Enter a price').min(0, 'Cannot be negative'),
      }),
    )
    .min(1, 'Add at least one choice'),
  dishIds: z.array(z.string()),
})

type GroupValues = z.infer<typeof groupSchema>

interface GroupFormProps {
  group: OptionGroup | null
  dishes: Dish[]
  onClose: () => void
}

const GroupForm = ({ group, dishes, onClose }: GroupFormProps) => {
  const save = useSaveOptionGroup()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GroupValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      title: group?.title ?? '',
      required: group?.required ?? false,
      maxChoices: group?.maxChoices ?? 1,
      choices:
        group?.choices.map(({ id, label, priceDelta }) => ({
          id,
          label,
          price: penceToPounds(priceDelta),
        })) ?? [],
      dishIds: dishes
        .filter(({ optionGroupIds }) => group && optionGroupIds.includes(group.id))
        .map(({ id }) => id),
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices',
    keyName: 'fieldKey',
  })

  const submit = ({ choices, ...values }: GroupValues) =>
    save.mutate(
      {
        id: group?.id,
        input: {
          ...values,
          choices: choices.map(({ id, label, price }) => ({
            id,
            label,
            priceDelta: poundsToPence(price),
          })),
        },
      },
      { onSuccess: onClose },
    )

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex h-full flex-col">
      <OverlayHeader title={group ? 'Edit options' : 'Add option group'} onClose={onClose} />
      <OverlayBody className="flex flex-col gap-4">
        <TextField label="Title" error={errors.title?.message} {...register('title')} />
        <div className="grid grid-cols-2 items-end gap-3">
          <TextField
            label="Most a customer can pick"
            type="number"
            min="1"
            error={errors.maxChoices?.message}
            {...register('maxChoices', { valueAsNumber: true })}
          />
          <CheckboxField label="Required" className="h-11" {...register('required')} />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-[13px] font-semibold">Choices</legend>
          {fields.map((field, index) => (
            <div
              key={field.fieldKey}
              className="grid grid-cols-[1fr_6.5rem_2.5rem] items-end gap-2"
            >
              <TextField
                label="Label"
                error={errors.choices?.[index]?.label?.message}
                {...register(`choices.${index}.label`)}
              />
              <TextField
                label="Extra (£)"
                type="number"
                step="0.01"
                min="0"
                error={errors.choices?.[index]?.price?.message}
                {...register(`choices.${index}.price`, { valueAsNumber: true })}
              />
              <IconButton label="Remove choice" onClick={() => remove(index)}>
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          ))}
          {errors.choices?.root?.message && (
            <p role="alert" className="text-xs font-semibold text-jollof-dark">
              {errors.choices.root.message}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => append({ id: createId('choice'), label: '', price: 0 })}
          >
            <Plus className="size-4" /> Add choice
          </Button>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-[13px] font-semibold">Dishes using this group</legend>
          <div className="grid gap-x-3 sm:grid-cols-2">
            {dishes.map(({ id, name }) => (
              <CheckboxField key={id} label={name} value={id} {...register('dishIds')} />
            ))}
          </div>
        </fieldset>
      </OverlayBody>
      <OverlayFooter>
        <Button type="submit" disabled={save.isPending}>
          Save options
        </Button>
      </OverlayFooter>
    </form>
  )
}

export const OptionsPage = () => {
  const { data: groups, isPending, isError, refetch } = useOptionGroups()
  const { data: dishes } = useDishes()
  const deleteGroup = useDeleteOptionGroup()
  const [editing, setEditing] = useState<OptionGroup | 'new' | null>(null)
  const [deleting, setDeleting] = useState<OptionGroup | null>(null)

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  const usage = (id: string) =>
    dishes?.filter(({ optionGroupIds }) => optionGroupIds.includes(id)).length ?? 0
  const closeDrawer = () => setEditing(null)
  const isEditing = editing !== null
  const group = editing === 'new' ? null : editing

  return (
    <>
      <PageHeader
        title="Options"
        description="Proteins, sides and spice levels that customers choose on a dish."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Add group
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((entry) => (
          <Card key={entry.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg">{entry.title}</h2>
                <p className="text-xs text-muted">
                  {pluralise(usage(entry.id), 'dish', 'dishes')} · up to {entry.maxChoices}
                </p>
              </div>
              <Badge tone={entry.required ? 'jollof' : 'neutral'}>
                {entry.required ? 'Required' : 'Optional'}
              </Badge>
            </div>
            <ul className="my-3 flex flex-col gap-1 text-sm">
              {entry.choices.map(({ id, label, priceDelta }) => (
                <li key={id} className="flex justify-between">
                  <span>{label}</span>
                  <span className="text-muted">
                    {priceDelta ? `+${formatPrice(priceDelta)}` : 'Included'}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(entry)}>
                <Pencil className="size-3.5" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleting(entry)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Drawer open={isEditing} onClose={closeDrawer} label="Option group">
        <GroupForm
          key={group?.id ?? 'new'}
          group={group}
          dishes={dishes ?? []}
          onClose={closeDrawer}
        />
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.title ?? 'group'}?`}
        body={`It will be removed from ${pluralise(usage(deleting?.id ?? ''), 'dish', 'dishes')}.`}
        confirmLabel="Delete group"
        destructive
        pending={deleteGroup.isPending}
        onConfirm={() =>
          deleting && deleteGroup.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
