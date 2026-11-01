import { Menu, Volume2, VolumeX } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Logo } from '@/components/ui/Logo'
import { usePermission } from '@/hooks/usePermission'
import { useSettings, useSetOrdersPaused } from '@/services/settings/settings.queries'
import { useUiStore } from '@/stores/ui.store'

export const Topbar = () => {
  const { data: settings } = useSettings()
  const setPaused = useSetOrdersPaused()
  const canManageShop = usePermission('settings')
  const canSeeOrders = usePermission('orders')
  const soundEnabled = useUiStore((state) => state.soundEnabled)
  const toggleSound = useUiStore((state) => state.toggleSound)
  const setNavOpen = useUiStore((state) => state.setNavOpen)
  const paused = settings?.ordersPaused ?? false

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-shea/95 px-4 backdrop-blur md:px-6 print:hidden">
      <IconButton label="Open menu" className="lg:hidden" onClick={() => setNavOpen(true)}>
        <Menu className="size-5" />
      </IconButton>
      <Logo className="lg:hidden" />

      <div className="ml-auto flex items-center gap-2">
        <Badge tone={paused ? 'jollof' : 'ewedu'} className="max-sm:hidden">
          {paused ? 'Orders paused' : 'Taking orders'}
        </Badge>
        {canSeeOrders && (
          <IconButton
            label={soundEnabled ? 'Turn order sound off' : 'Turn order sound on'}
            aria-pressed={soundEnabled}
            onClick={toggleSound}
          >
            {soundEnabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </IconButton>
        )}
        {canManageShop && (
          <Button
            size="sm"
            variant={paused ? 'dark' : 'outline'}
            disabled={setPaused.isPending}
            onClick={() => setPaused.mutate(!paused)}
          >
            {paused ? 'Resume orders' : 'Pause orders'}
          </Button>
        )}
      </div>
    </header>
  )
}
