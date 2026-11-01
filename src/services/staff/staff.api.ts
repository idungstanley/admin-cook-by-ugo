import { db } from '@/mocks/db'
import { createId, findOrThrow, mockRequest } from '@/services/mockClient'
import type { Role, StaffMember } from '@/types'

export interface StaffInput {
  name: string
  email: string
  role: Role
}

const activeOwners = () => db.staff.filter(({ role, active }) => role === 'owner' && active)

const assertNotLastOwner = (member: StaffMember) => {
  if (member.role === 'owner' && activeOwners().length === 1) {
    throw new Error('There must always be one active owner')
  }
}

export const staffApi = {
  listStaff: () => mockRequest(() => db.staff),

  saveStaff: ({ id, input }: { id?: string; input: StaffInput }) =>
    mockRequest(() => {
      if (!id) {
        if (db.staff.some(({ email }) => email === input.email.toLowerCase())) {
          throw new Error('Someone already uses that email')
        }
        db.staff.push({
          ...input,
          email: input.email.toLowerCase(),
          id: createId('staff'),
          active: true,
          twoFactorEnabled: false,
          lastActiveAt: Date.now(),
        })
        return
      }
      const member = findOrThrow(db.staff, id, 'Staff member')
      if (input.role !== 'owner') assertNotLastOwner(member)
      Object.assign(member, input)
    }),

  setActive: ({ id, active }: { id: string; active: boolean }) =>
    mockRequest(() => {
      const member = findOrThrow(db.staff, id, 'Staff member')
      if (!active) assertNotLastOwner(member)
      member.active = active
    }),
}
