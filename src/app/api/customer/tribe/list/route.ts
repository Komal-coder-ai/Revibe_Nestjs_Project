import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';

// List/search tribes
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const filter: any = q ? { name: { $regex: q, $options: 'i' } } : {};
  const tribes = await Tribe.find(filter).limit(20).lean();
  return NextResponse.json({ data: { status: true, tribes } });
}
