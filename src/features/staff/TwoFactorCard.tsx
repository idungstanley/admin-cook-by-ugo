import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/fields'
import { authApi } from '@/services/auth/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

/** Turns on authenticator codes for the signed-in person. */
export const TwoFactorCard = () => {
  const user = useAuthStore((state) => state.user)
  const signIn = useAuthStore((state) => state.signIn)
  const toast = useToastStore((state) => state.push)
  const [code, setCode] = useState('')
  const setup = useMutation({ mutationFn: authApi.startTwoFactorSetup })
  const enable = useMutation({
    mutationFn: authApi.enableTwoFactor,
    onSuccess: (result) => {
      signIn(result.user)
      toast('Two-step sign-in is on')
    },
  })

  if (user?.twoFactorEnabled) return null

  return (
    <Card className="mb-5 flex flex-col gap-3">
      <div>
        <h2 className="text-lg">Protect your account</h2>
        <p className="text-sm text-muted">
          Your account controls refunds and customer data, so turn on two-step sign-in.
        </p>
      </div>
      {setup.data ? (
        <form
          className="flex flex-col gap-3 sm:max-w-sm"
          onSubmit={(event) => {
            event.preventDefault()
            enable.mutate(code)
          }}
        >
          <p className="text-sm">
            Add this key to your authenticator app:
            <code className="mt-1 block break-all rounded-lg bg-shea px-3 py-2 font-mono text-[13px]">
              {setup.data.secret}
            </code>
          </p>
          <TextField
            label="6-digit code from the app"
            inputMode="numeric"
            maxLength={6}
            value={code}
            error={enable.error?.message}
            onChange={(event) => setCode(event.target.value)}
          />
          <Button type="submit" disabled={enable.isPending || code.length < 6}>
            Turn on
          </Button>
        </form>
      ) : (
        <Button
          variant="outline"
          className="self-start"
          disabled={setup.isPending}
          onClick={() => setup.mutate()}
        >
          Set up two-step sign-in
        </Button>
      )}
    </Card>
  )
}
