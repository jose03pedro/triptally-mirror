// app/api/flight/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectionToDB from '@/lib/mongoose';
import Flight from '@/app/models/Flight';
import { transformFlightData } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const flightNumber = searchParams.get('num');
  const date = searchParams.get('date');

  if (!flightNumber ||!date) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  await connectionToDB();

  //@ Try cache first by normalized key
  const normalizedNumber = flightNumber.replace(/\s+/g, '').toUpperCase();
  try {
    const cached = await Flight.findOne({ flightNumber: normalizedNumber, date }).lean();
    if (cached) {
      return NextResponse.json({ source: 'cache', data: cached });
    }
  } catch (err) {
    // fall through to fetch
  }

  // AeroDataBox Endpoint: GET /flights/number/{flightNumber}/{date}
  const url = `https://aerodatabox.p.rapidapi.com/flights/number/${flightNumber}/${date}?withAircraftImage=false&withLocation=false`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
      },
      cache: 'no-store', // Ensure we always get the latest status for changes
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: res.status });
    }

    const data = await res.json();
    //@ The API returns an array of flights (operator + codeshares). Persist operator if available; else first item.
    const primary = Array.isArray(data) ? data[0] : data;
    console.log('Fetched live flight data: \n', primary);
    if (primary) {
      try {
        const doc = transformFlightData(primary);
        console.log('Caching flight data for', doc.flightNumber, doc.date);
        await Flight.findOneAndUpdate(
          { flightNumber: doc.flightNumber, date: doc.date },
          doc,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (e) {
        // ignore write errors, still return the API data
      }
    }
    return NextResponse.json({ source: 'live', data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}