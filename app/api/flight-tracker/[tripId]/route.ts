import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'


// NOTE: This endpoint is a lightweight bridge for real-time updates.
// It does NOT run the Python tracker; instead, it expects the tracker
// to be posting updates into the DB (or another service) and returns
// the latest known position.
//
// For now, we return the latest itinerary-derived position fields if present.
// You can extend this once there is a concrete storage schema for live aircraft positions.

export async function POST(
  req: Request,
  { params }: { params: { tripId: string } }
) {
  const supabase = createClient()
  const { tripId } = params

  // Determine first flight by ordering rule:
  // - Build ordered timeline by event_start
  // - Pick first event among flights/hotels, then apply serial rule:
  //   serial number 1 is hotel and 2 is flight OR vice-versa.
  // The SQL diagnostic shows serial_number exists on both trip_flights and trip_hotels.

  const { data: flights, error: flightsErr } = await supabase
    .from('trip_flights')
    .select('id, flight_number, serial_number, departure_date, departure_time')
    .eq('trip_id', tripId)

  if (flightsErr) {
    return NextResponse.json({ error: flightsErr.message }, { status: 400 })
  }

  const { data: hotels, error: hotelsErr } = await supabase
    .from('trip_hotels')
    .select('id, hotel_name, serial_number, check_in_date, check_in_time')
    .eq('trip_id', tripId)

  if (hotelsErr) {
    return NextResponse.json({ error: hotelsErr.message }, { status: 400 })
  }

  const all = [
    ...(flights || []).map((f: any) => ({ type: 'flight', ...f })),
    ...(hotels || []).map((h: any) => ({ type: 'hotel', ...h })),
  ].filter((x: any) => x.serial_number !== null && x.serial_number !== undefined)

  // Sort by serial_number ascending.
  all.sort((a: any, b: any) => Number(a.serial_number) - Number(b.serial_number))

  // serial_number 1 and 2 define which is first/second type.
  // Then "first flight" means flight element that is whichever of serial 1 or 2 is the flight.
  const firstTwo = all.slice(0, 2)
  const firstFlight = firstTwo.find((x: any) => x.type === 'flight') || null

  if (!firstFlight) {
    return NextResponse.json({ error: 'No flight found for serial rule' }, { status: 404 })
  }

  // TODO: Replace this with live aircraft position storage.
  // For now, we just return the flight_number so the frontend can start the tracker.
  return NextResponse.json({
    tripId,
    flightId: firstFlight.id,
    flightNumber: firstFlight.flight_number,
    // placeholder until a live position feed exists
    position: null,
  })
}

