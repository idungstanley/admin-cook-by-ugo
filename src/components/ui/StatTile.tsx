import { Card } from './Card'

interface StatTileProps {
  label: string
  value: string
  detail?: string
}

export const StatTile = ({ label, value, detail }: StatTileProps) => (
  <Card className="p-4">
    <p className="text-xs font-semibold text-muted">{label}</p>
    <p className="mt-1 font-display text-3xl font-extrabold tracking-tight">{value}</p>
    {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
  </Card>
)
