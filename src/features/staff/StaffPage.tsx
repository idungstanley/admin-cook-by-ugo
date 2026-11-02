import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { SelectField, TextField } from '@/components/ui/fields'
import { IconButton } from '@/components/ui/IconButton'
import { Drawer, OverlayBody, OverlayFooter, OverlayHeader } from '@/components/ui/Overlay'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { Toggle } from '@/components/ui/Toggle'
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/constants/roles'
import { formatDateTime } from '@/lib/format'
import { useSaveStaff, useSetStaffActive, useStaff } from '@/services/staff/staff.queries'
import { useAuthStore } from '@/stores/auth.store'
import type { Role, StaffMember } from '@/types'
import { TwoFactorCard } from './TwoFactorCard'

const ROLES = Object.keys(ROLE_LABELS) as Role[]

const staffSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name'),
  email: z.email('Enter a valid email'),
  role: z.enum(['owner', 'kitchen', 'rider']),
})

type StaffValues = z.infer<typeof staffSchema>

const StaffForm = ({ member, onClose }: { member: StaffMember | null; onClose: () => void }) => {
  const save = useSaveStaff()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: member ?? { name: '', email: '', role: 'kitchen' },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((input) =>
        save.mutate({ id: member?.id, input }, { onSuccess: onClose }),
      )}
      className="flex h-full flex-col"
    >
      <OverlayHeader title={member ? 'Edit staff member' : 'Invite staff'} onClose={onClose} />
      <OverlayBody className="flex flex-col gap-4">
        <TextField label="Name" error={errors.name?.message} {...register('name')} />
        <TextField
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <SelectField label="Role" {...register('role')}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </SelectField>
      </OverlayBody>
      <OverlayFooter>
        <Button type="submit" disabled={save.isPending}>
          {member ? 'Save' : 'Send invite'}
        </Button>
      </OverlayFooter>
    </form>
  )
}

export const StaffPage = () => {
  const { data: staff, isPending, isError, refetch } = useStaff()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const setActive = useSetStaffActive()
  const [editing, setEditing] = useState<StaffMember | 'new' | null>(null)

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  const member = editing === 'new' ? null : editing
  const closeDrawer = () => setEditing(null)

  const columns: Column<StaffMember>[] = [
    {
      header: 'Name',
      cell: ({ name, email }) => (
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-xs text-muted">{email}</p>
        </div>
      ),
    },
    { header: 'Role', cell: ({ role }) => <Badge tone="indigo">{ROLE_LABELS[role]}</Badge> },
    {
      header: 'Two-step',
      cell: ({ twoFactorEnabled }) =>
        twoFactorEnabled ? <Badge tone="ewedu">On</Badge> : <Badge tone="gold">Not set up</Badge>,
    },
    { header: 'Last active', cell: ({ lastActiveAt }) => formatDateTime(lastActiveAt) },
    {
      header: 'Active',
      cell: (entry) => (
        <Toggle
          label={`${entry.name} active`}
          checked={entry.active}
          disabled={entry.id === currentUserId}
          onChange={(active) => setActive.mutate({ id: entry.id, active })}
        />
      ),
    },
    {
      header: 'Edit',
      className: 'text-right',
      hideLabelOnMobile: true,
      cell: (entry) => (
        <div className="flex justify-end">
          <IconButton label={`Edit ${entry.name}`} onClick={() => setEditing(entry)}>
            <Pencil className="size-4" />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Staff and roles"
        description="Control who can sign in and what they can do."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Invite staff
          </Button>
        }
      />

      <TwoFactorCard />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {ROLES.map((role) => (
          <Card key={role} className="p-4">
            <h2 className="text-lg">{ROLE_LABELS[role]}</h2>
            <p className="text-sm text-muted">{ROLE_DESCRIPTIONS[role]}</p>
          </Card>
        ))}
      </div>

      <DataTable caption="Staff" columns={columns} rows={staff} rowKey={({ id }) => id} />

      <Drawer open={editing !== null} onClose={closeDrawer} label="Staff member">
        <StaffForm key={member?.id ?? 'new'} member={member} onClose={closeDrawer} />
      </Drawer>
    </>
  )
}
