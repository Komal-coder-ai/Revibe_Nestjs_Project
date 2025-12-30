import { NextRequest, NextResponse } from 'next/server';
import BlockedUser from '@/models/BlockedUser';
import connectDB  from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectDB();
  const { blockerId, blockedId } = await req.json();
  const block = await BlockedUser.create({ blockerId, blockedId });
  return NextResponse.json({ data: { status: true, block } });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { blockerId, blockedId } = await req.json();
  await BlockedUser.deleteOne({ blockerId, blockedId });
  return NextResponse.json({ data: { status: true } });
}
