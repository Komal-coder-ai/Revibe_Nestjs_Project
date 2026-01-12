// src/lib/authUtils.ts
import { Document } from 'mongoose';

export async function checkAndHandleLockout(user: Document & { failedLoginAttempts: number; lockoutUntil: Date | null }) {
    const now = Date.now();
    if (user.lockoutUntil && now < new Date(user.lockoutUntil).getTime()) {
        return {
            locked: true,
            message: `Too many failed attempts. Please wait ${Math.ceil((user.lockoutUntil.getTime() - now) / 60000)} minutes before trying again.`
        };
    }
    return { locked: false };
}

export async function handleFailedLogin(user: Document & { failedLoginAttempts: number; lockoutUntil: Date | null }) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    }
    await user.save();
}

export async function resetLoginAttempts(user: Document & { failedLoginAttempts: number; lockoutUntil: Date | null }) {
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();
}
