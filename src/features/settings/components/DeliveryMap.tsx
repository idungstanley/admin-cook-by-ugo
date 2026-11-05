import 'leaflet/dist/leaflet.css'
import { latLng } from 'leaflet'
import { useEffect } from 'react'
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { DeliveryRadius } from '@/types'

const METRES_PER_MILE = 1609.34
/** Inner rings are darker, so the cheaper areas stand out. */
const RING_COLOURS = ['#1E5B3A', '#C8401C', '#233A73', '#F2B23E', '#6B5D52']

interface DeliveryMapProps {
  centre: { lat: number; lng: number }
  radii: Pick<DeliveryRadius, 'id' | 'maxMiles' | 'active'>[]
}

/** Keeps the whole outer ring in view as rings change. */
const FitToRings = ({ centre, miles }: { centre: DeliveryMapProps['centre']; miles: number }) => {
  const map = useMap()
  useEffect(() => {
    const diameter = Math.max(miles, 1) * 2 * METRES_PER_MILE
    map.fitBounds(latLng(centre.lat, centre.lng).toBounds(diameter), { padding: [16, 16] })
  }, [map, centre.lat, centre.lng, miles])
  return null
}

export const DeliveryMap = ({ centre, radii }: DeliveryMapProps) => {
  const rings = radii
    .filter(({ active, maxMiles }) => active && maxMiles > 0)
    .sort((a, b) => b.maxMiles - a.maxMiles)
  const outer = rings[0]?.maxMiles ?? 3

  return (
    <MapContainer
      center={[centre.lat, centre.lng]}
      zoom={11}
      scrollWheelZoom={false}
      // `isolate` keeps Leaflet's own layers under the sticky top bar.
      className="isolate z-0 h-80 w-full rounded-2xl md:h-[26rem]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {rings.map((ring, index) => {
        const colour = RING_COLOURS[(rings.length - 1 - index) % RING_COLOURS.length]
        return (
          <Circle
            key={ring.id}
            center={[centre.lat, centre.lng]}
            radius={ring.maxMiles * METRES_PER_MILE}
            pathOptions={{ color: colour, fillColor: colour, fillOpacity: 0.12, weight: 2 }}
          >
            <Tooltip sticky>Up to {ring.maxMiles} miles</Tooltip>
          </Circle>
        )
      })}
      <CircleMarker
        center={[centre.lat, centre.lng]}
        radius={7}
        pathOptions={{ color: '#1C0F0A', fillColor: '#1C0F0A', fillOpacity: 1 }}
      >
        <Tooltip permanent direction="top">
          Kitchen
        </Tooltip>
      </CircleMarker>
      <FitToRings centre={centre} miles={outer} />
    </MapContainer>
  )
}
