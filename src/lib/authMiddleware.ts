import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './jwt';

/**
 * Middleware to verify JWT access token from Authorization header.
 * Returns 401 if token is missing or invalid, otherwise attaches user payload to request.
 */
export async function requireAuth(request: NextRequest) {
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
    } else {
        // Try to get token from cookies
        const cookieToken = request.cookies.get('token');
        if (cookieToken) {
            token = cookieToken.value;
        }
    }
    if (!token) {
        return NextResponse.json({ success: false, message: 'Missing token in header or cookies' },
            { status: 401 });
    }
    try {
        const user = verifyAccessToken(token);
        // Optionally attach user info to request (if using custom request object)
        // request.user = user;
        return null; // null means continue
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }
}

/**
 * Usage in API route:
 * const authError = await requireAuth(request);
 * if (authError) return authError;
 * // ...protected logic...
 */
