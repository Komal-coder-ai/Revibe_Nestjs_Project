import { NextResponse } from 'next/server';
import Admin from '@/models/Admin';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';
import connectDB from '@/lib/db';

export async function POST(req: Request) {
  const { email } = await req.json();

  // Validate email
  if (!email) {
    return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
  }

  // Ensure database connection
  await connectDB();

  // Check if email is registered
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Email not found' }, { status: 404 });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

  // Store token in database
  admin.resetToken = resetToken;
  admin.resetTokenExpiry = resetTokenExpiry;
  await admin.save();

  // Send reset email
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
  await sendEmail(admin.email, 'Password Reset Request', `Click here to reset your password: ${resetLink}`);

  return NextResponse.json({ success: true, message: 'Password reset link sent' });
}