import { NextRequest, NextResponse } from 'next/server';
import Report from '@/models/Report';
import connectDB  from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId, postId, reason } = await req.json();
  const report = await Report.create({ userId, postId, reason });
  return NextResponse.json({ data: { status: true, report } });
}

export async function GET(req: NextRequest) {
  await connectDB();
  const reports = await Report.find().populate('userId postId');
  return NextResponse.json({ data: { status: true, reports } });
}
