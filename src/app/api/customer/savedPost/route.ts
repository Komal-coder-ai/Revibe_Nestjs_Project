import { NextRequest, NextResponse } from 'next/server';
import SavedPost from '@/models/SavedPost';
import connectDB  from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId, postId } = await req.json();
  const saved = await SavedPost.create({ userId, postId });
  return NextResponse.json({ data: { status: true, saved } });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { userId, postId } = await req.json();
  await SavedPost.deleteOne({ userId, postId });
  return NextResponse.json({ data: { status: true } });
}

export async function GET(req: NextRequest) {
  await connectDB();
  const userId = req.nextUrl.searchParams.get('userId');
  const savedPosts = await SavedPost.find({ userId }).populate('postId');
  return NextResponse.json({ data: { status: true, savedPosts } });
}
