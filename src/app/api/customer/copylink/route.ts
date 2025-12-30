import { NextRequest, NextResponse } from 'next/server';
import CopyLink from '@/models/CopyLink';
import connectDB  from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId, postId } = await req.json();
  const copy = await CopyLink.create({ userId, postId });
  return NextResponse.json({ data: { status: true, copy } });
}
