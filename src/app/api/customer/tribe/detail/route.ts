import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';

// Get tribe details
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ data: { status: false, message: 'Tribe id required' } }, { status: 400 });
  const tribe = await Tribe.findById(id).lean();
  if (!tribe) return NextResponse.json({ data: { status: false, message: 'Tribe not found' } }, { status: 404 });
  return NextResponse.json({ data: { status: true, tribe } });
}
