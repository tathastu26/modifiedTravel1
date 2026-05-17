'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type LivePos = { lat: number; lon: number; heading?: number; speed?: number; altitude?: number; callsign?: string }

export function FlightTrackerOverlay({ tripId }: { tripId: string }) {
  const [flightNumber, setFlightNumber] = useState<string | null>(null)
  const [pos, setPos] = useState<LivePos | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // This is a UI stub. The backend needs to provide live lat/lon (or we need a JS worker).
  // For now we only fetch the flightNumber and show a marker when pos exists.
  useEffect(() => {
    if (!tripId) return

    const ac = new AbortController()
    abortRef.current = ac

    ;(async () => {
      try {
        setError(null)
        setFlightNumber(null)
        setPos(null)

        const resp = await fetch(`/api/flight-tracker/${encodeURIComponent(tripId)}`, {
          method: 'POST',
          signal: ac.signal,
        } as any)

        const data = await resp.json()
        if (!resp.ok) throw new Error(data?.error || 'Failed to fetch tracker info')

        setFlightNumber(data?.flightNumber || null)

        // TODO: start polling live position once a schema/endpoint exists.
        // setPos({lat:..., lon:...})
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        setError(e?.message || String(e))
      }
    })()

    return () => {
      ac.abort()
    }
  }, [tripId])

  // Return overlay markup only. Map marker is not possible inside iframe without wiring.
  // So we show status overlay for now.
  const badgeText = useMemo(() => {
    if (error) return `Tracker error: ${error}`
    if (!flightNumber) return 'Tracker: resolving…'
    if (!pos) return `Tracking ${flightNumber} (waiting for position…)`
    return `Tracking ${flightNumber}: ${pos.lat.toFixed(4)}, ${pos.lon.toFixed(4)}`
  }, [error, flightNumber, pos])

  return (
    <div className="absolute left-4 top-4 z-[1000] pointer-events-none">
      <div className="pointer-events-none inline-flex items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-xs text-white/90 border border-white/10 shadow">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <div>{badgeText}</div>
      </div>
    </div>
  )
}

