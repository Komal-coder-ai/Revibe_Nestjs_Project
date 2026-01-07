import { NextResponse } from 'next/server';
import { Admin } from '@/models/Admin';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  // Validate input
  if (!token || !newPassword) {
    return NextResponse.json({ success: false, message: 'Token and new password are required' }, { status: 400 });
  }

  // Find admin by token
  const admin = await Admin.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 400 });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and invalidate token
  admin.password = hashedPassword;
  admin.resetToken = undefined;
  admin.resetTokenExpiry = undefined;
  await admin.save();

  return NextResponse.json({ success: true, message: 'Password reset successful' });
}