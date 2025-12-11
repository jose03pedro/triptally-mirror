import { NextRequest, NextResponse } from 'next/server';
import connectionToDB from '@/lib/mongoose';
import Flight from '@/app/models/Flight';
import Trip from '@/app/models/Trip';

// List flights attached to a trip
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectionToDB();
  const { id } = params;
  const flights = await Flight.find({ tripId: id }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json(flights);
}

// Attach a flight (number + date) to a trip
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectionToDB();
  const { id } = params;
  const body = await req.json();
  const { number, date } = body || {};
  if (!number || !date) {
    return NextResponse.json({ error: 'Missing number or date' }, { status: 400 });
  }

  const normalizedNumber = String(number).replace(/\s+/g, '').toUpperCase();

  const trip = await Trip.findById(id);
  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  const updated = await Flight.findOneAndUpdate(
    { number: normalizedNumber, date },
    { $set: { tripId: id } },
    { new: true }
  );
  if (!updated) {
    return NextResponse.json({ error: 'Flight not found in cache; search first' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// Remove flight association from a trip
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectionToDB();
  const { id } = params;
  const { number, date } = await req.json();
  if (!number || !date) {
    return NextResponse.json({ error: 'Missing number or date' }, { status: 400 });
  }
  const normalizedNumber = String(number).replace(/\s+/g, '').toUpperCase();
  const updated = await Flight.findOneAndUpdate(
    { number: normalizedNumber, date, tripId: id },
    { $unset: { tripId: '' } },
    { new: true }
  );
  return NextResponse.json(updated);
}
