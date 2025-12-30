import { NextRequest, NextResponse } from 'next/server';
import Share from '@/models/Share';
import connectDB  from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId, postId, platform } = await req.json();
  const share = await Share.create({ userId, postId, platform });
  return NextResponse.json({ data: { status: true, share } });
}
