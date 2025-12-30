import { z } from 'zod';

export const startOtpSchema = z.object({
  countryCode: z.string().min(1),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be a 10-digit number'),
});

export const verifyOtpSchema = z.object({
  countryCode: z.string().min(1),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be a 10-digit number'),
  otp: z.string().length(4, 'OTP must be 4 characters long'),
});

export const aadharSchema = z.object({
  userId: z.string().min(1),
  aadhar: z.string().min(12, 'Aadhar must be at least 12 characters long'),
});

export const demoLoginSchema = z.object({
  deviceId: z.string().min(4, 'deviceId is required'),
});


// Reusable schema for a profile image object
export const profileImageObjectSchema = z.object({
  imageUrl: z.string(),
  thumbUrl: z.string().optional(),
  type: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  orientation: z.string().optional(),
  format: z.string().optional(),
});

export const completeProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().optional(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  countryCode: z.string().optional(),
  mobile: z.string().optional(),
  profileImage: z.array(profileImageObjectSchema).optional(),
  coverImage: z.array(profileImageObjectSchema).optional(),
  referralCode: z.string().optional(),
});
