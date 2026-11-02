import { http } from '@/lib/http'
import type { StaffMember } from '@/types'

interface SignedIn {
  user: StaffMember
  requiresTwoFactor?: false
}

interface TwoFactorRequired {
  requiresTwoFactor: true
  challengeToken: string
}

const authOnly = { skipSessionCheck: true }

export const authApi = {
  signIn: (credentials: { email: string; password: string }) =>
    http.post<SignedIn | TwoFactorRequired>('/auth/login', credentials, authOnly),
  verifyCode: (input: { challengeToken: string; code: string }) =>
    http.post<SignedIn>('/auth/verify-code', input, authOnly),
  signOut: () => http.post<void>('/auth/logout', undefined, authOnly),
  me: () => http.get<{ user: StaffMember }>('/auth/me', authOnly),
  requestPasswordReset: (email: string) =>
    http.post<void>('/auth/forgot-password', { email }, authOnly),
  resetPassword: (input: { token: string; password: string }) =>
    http.post<void>('/auth/reset-password', input, authOnly),
  startTwoFactorSetup: () =>
    http.post<{ secret: string; otpauthUrl: string }>('/auth/two-factor/setup'),
  enableTwoFactor: (code: string) =>
    http.post<{ user: StaffMember }>('/auth/two-factor/enable', { code }),
}
