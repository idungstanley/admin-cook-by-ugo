import { db } from '@/mocks/db'
import { mockRequest } from '@/services/mockClient'

/**
 * Demo-only sign in, with no real security. Replace with Appwrite Auth and MFA before any real
 * data is added. These values exist so the screens can be tried.
 */
export const DEMO_PASSWORD = 'ugo-demo'
export const DEMO_TWO_FACTOR_CODE = '123456'

const findStaff = (email: string) => {
  const member = db.staff.find((staff) => staff.email === email.trim().toLowerCase())
  if (!member) throw new Error('Email or password is incorrect')
  if (!member.active) throw new Error('This account has been deactivated')
  return member
}

export const authApi = {
  signIn: ({ email, password }: { email: string; password: string }) =>
    mockRequest(() => {
      const member = findStaff(email)
      if (password !== DEMO_PASSWORD) throw new Error('Email or password is incorrect')
      return member
    }),

  verifyCode: ({ email, code }: { email: string; code: string }) =>
    mockRequest(() => {
      if (code !== DEMO_TWO_FACTOR_CODE) throw new Error('That code is not right')
      return findStaff(email)
    }),

  requestPasswordReset: () => mockRequest(() => true),
}
