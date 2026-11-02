import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/button.styles'
import { TextField } from '@/components/ui/fields'
import { Logo } from '@/components/ui/Logo'
import { authApi } from '@/services/auth/auth.api'

const MIN_PASSWORD = 10

/** Also where invited staff set their first password. */
export const ResetPasswordPage = ({ token }: { token: string }) => {
  const [password, setPassword] = useState('')
  const reset = useMutation({ mutationFn: authApi.resetPassword })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-5 py-8">
      <Logo className="size-24" />
      {reset.isSuccess ? (
        <>
          <h1 className="text-3xl">Password saved</h1>
          <Link to="/login" className={buttonStyles({ size: 'lg' })}>
            Go to sign in
          </Link>
        </>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            reset.mutate({ token, password })
          }}
          className="flex flex-col gap-4"
        >
          <h1 className="text-3xl">Set your password</h1>
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            hint={`At least ${MIN_PASSWORD} characters`}
            value={password}
            error={reset.error?.message}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={reset.isPending || password.length < MIN_PASSWORD}
          >
            Save password
          </Button>
        </form>
      )}
    </div>
  )
}
