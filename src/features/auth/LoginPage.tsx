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
import { sessionToken } from '@/lib/sessionToken'
import { authApi } from '@/services/auth/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import type { StaffMember } from '@/types'

const credentialsSchema = z.object({
  email: z.email('Enter your email'),
  password: z.string().min(1, 'Enter your password'),
})

type Credentials = z.infer<typeof credentialsSchema>

const useFinishSignIn = () => {
  const navigate = useNavigate()
  const signIn = useAuthStore((state) => state.signIn)

  return ({ user, token }: { user: StaffMember; token: string }) => {
    sessionToken.set(token)
    signIn(user)
    void navigate({ to: HOME_ROUTE[user.role] })
  }
}

interface CredentialsFormProps {
  onTwoFactor: (challengeToken: string) => void
  onForgot: () => void
}

const CredentialsForm = ({ onTwoFactor, onForgot }: CredentialsFormProps) => {
  const finish = useFinishSignIn()
  const signIn = useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (result) => {
      if (result.requiresTwoFactor) onTwoFactor(result.challengeToken)
      else finish(result)
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Credentials>({ resolver: zodResolver(credentialsSchema) })

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
        onClick={onForgot}
        className="self-center text-sm font-semibold text-muted underline-offset-2 hover:underline"
      >
        Forgot your password?
      </button>
    </form>
  )
}

const TwoFactorForm = ({
  challengeToken,
  onBack,
}: {
  challengeToken: string
  onBack: () => void
}) => {
  const finish = useFinishSignIn()
  const [code, setCode] = useState('')
  const verify = useMutation({
    mutationFn: authApi.verifyCode,
    onSuccess: finish,
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        verify.mutate({ challengeToken, code })
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

const ForgotForm = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('')
  const reset = useMutation({ mutationFn: authApi.requestPasswordReset })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        reset.mutate(email)
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <h1 className="text-3xl">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">
          {reset.isSuccess
            ? 'If that email has an account, a reset link is on its way.'
            : 'Enter your email and we will send you a link.'}
        </p>
      </div>
      <TextField
        label="Email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button type="submit" size="lg" fullWidth disabled={reset.isPending || !email}>
        Send reset link
      </Button>
      <Button variant="ghost" onClick={onBack}>
        Back to sign in
      </Button>
    </form>
  )
}

type LoginStep =
  { name: 'credentials' } | { name: 'forgot' } | { name: 'two-factor'; challengeToken: string }

export const LoginPage = () => {
  const [step, setStep] = useState<LoginStep>({ name: 'credentials' })
  const backToStart = () => setStep({ name: 'credentials' })

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-cocoa p-12 text-paper lg:flex">
        <Logo onDark className="size-36" />
        <p className="font-display text-6xl font-extrabold leading-[1.02] tracking-tight">
          Every order,
          <span className="block font-accent font-semibold italic tracking-normal text-gold">
            one kitchen.
          </span>
        </p>
        <p className="text-sm text-paper/60">Cooked by Ugo admin</p>
      </div>

      <div className="flex flex-col justify-center px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <Logo className="mb-6 size-24 lg:hidden" />
          {step.name === 'credentials' && (
            <CredentialsForm
              onForgot={() => setStep({ name: 'forgot' })}
              onTwoFactor={(challengeToken) => setStep({ name: 'two-factor', challengeToken })}
            />
          )}
          {step.name === 'two-factor' && (
            <TwoFactorForm challengeToken={step.challengeToken} onBack={backToStart} />
          )}
          {step.name === 'forgot' && <ForgotForm onBack={backToStart} />}
        </div>
      </div>
    </div>
  )
}
