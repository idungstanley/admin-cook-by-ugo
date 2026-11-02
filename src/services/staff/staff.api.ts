import { http } from '@/lib/http'
import type { Role, StaffMember } from '@/types'

export interface StaffInput {
  name: string
  email: string
  role: Role
}

export const staffApi = {
  listStaff: () => http.get<StaffMember[]>('/staff'),
  listRiders: () => http.get<Pick<StaffMember, 'id' | 'name'>[]>('/staff/riders'),
  saveStaff: ({ id, input }: { id?: string; input: StaffInput }) =>
    id ? http.put<StaffMember>(`/staff/${id}`, input) : http.post<StaffMember>('/staff', input),
  setActive: ({ id, active }: { id: string; active: boolean }) =>
    http.patch<StaffMember>(`/staff/${id}/active`, { active }),
}
