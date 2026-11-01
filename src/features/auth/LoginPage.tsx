import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/fields'
import { Logo } from '@/components/ui/Logo'
import { HOME_ROUTE } from '@/constants/roles'
import { authApi, DEMO_PASSWORD, DEMO_TWO_FACTOR_CODE } from '@/services/auth/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import type { StaffMember } from '@/types'

const DEMO_ACCOUNTS = [
  { label: 'Owner', email: 'owner@example.com' },
  { label: 'Kitchen', email: 'kitchen@example.com' },
  { label: 'Rider', email: 'rider@example.com' },
]

const credentialsSchema = z.object({
  email: z.email('Enter your email'),
  password: z.string().min(1, 'Enter your password'),
})

type Credentials = z.infer<typeof credentialsSchema>

const CredentialsForm = ({ onVerified }: { onVerified: (member: StaffMember) => void }) => {
  const [resetSent, setResetSent] = useState(false)
  const signIn = useMutation({ mutationFn: authApi.signIn, onSuccess: onVerified })
  const reset = useMutation({
    mutationFn: authApi.requestPasswordReset,
    onSuccess: () => setResetSent(true),
  })
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Credentials>({ resolver: zodResolver(credentialsSchema) })

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', DEMO_PASSWORD, { shouldValidate: true })
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => signIn.mutate(values))}
      className="flex flex-col gap-4"
    >
      <div>
        <h1 className="text-3xl">Staff sign in</h1>
        <p className="mt-1 text-sm text-muted">Sign in to run tonight&apos;s service.</p>
      </div>
      <TextField
        label="Email"
        type="email"
        autoComplete="username"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {signIn.isError && (
        <p role="alert" className="text-sm font-semibold text-jollof-dark">
          {signIn.error.message}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth disabled={signIn.isPending}>
        {signIn.isPending ? 'Signing in...' : 'Sign in'}
      </Button>
      <button
        type="button"
        onClick={() => reset.mutate()}
        className="self-center text-sm font-semibold text-muted underline-offset-2 hover:underline"
      >
        {resetSent ? 'Check your email for a reset link' : 'Forgot your password?'}
      </button>

      <div className="rounded-2xl bg-gold-soft p-4">
        <p className="text-sm font-bold">Demo accounts</p>
        <p className="mb-2 text-xs text-muted">
          Sample data only. Pick a role, then use code {DEMO_TWO_FACTOR_CODE}.
        </p>
        <div className="flex gap-2">
          {DEMO_ACCOUNTS.map(({ label, email }) => (
            <Button key={label} variant="outline" size="sm" onClick={() => fillDemo(email)}>
              {label}
            </Button>
          ))}
        </div>
      </div>
    </form>
  )
}

const TwoFactorForm = ({ member, onBack }: { member: StaffMember; onBack: () => void }) => {
  const navigate = useNavigate()
  const signInUser = useAuthStore((state) => state.signIn)
  const [code, setCode] = useState('')
  const verify = useMutation({
    mutationFn: authApi.verifyCode,
    onSuccess: (user) => {
      signInUser(user)
      void navigate({ to: HOME_ROUTE[user.role] })
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        verify.mutate({ email: member.email, code })
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <h1 className="text-3xl">Two-step check</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>
      <TextField
        label="Verification code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        autoFocus
        value={code}
        error={verify.error?.message}
        onChange={(event) => setCode(event.target.value)}
      />
      <Button type="submit" size="lg" fullWidth disabled={verify.isPending}>
        {verify.isPending ? 'Checking...' : 'Verify'}
      </Button>
      <Button variant="ghost" onClick={onBack}>
        Back
      </Button>
    </form>
  )
}

export const LoginPage = () => {
  const [member, setMember] = useState<StaffMember | null>(null)

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-cocoa p-12 text-paper lg:flex">
        <Logo className="text-paper" />
        <p className="font-display text-6xl font-extrabold leading-[1.02] tracking-tight">
          Every order,
          <span className="block font-accent font-semibold italic tracking-normal text-gold">
            one kitchen.
          </span>
        </p>
        <p className="text-sm text-paper/60">Cook by Ugo admin</p>
      </div>

      <div className="flex flex-col justify-center px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          {member ? (
            <TwoFactorForm member={member} onBack={() => setMember(null)} />
          ) : (
            <CredentialsForm onVerified={setMember} />
          )}
        </div>
      </div>
    </div>
  )
}
