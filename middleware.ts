import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Must match lib/auth.ts secret
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'tiddlee-secret-2026-change-in-prod'
);

async function verifyRequest(request: NextRequest): Promise<boolean> {
    // 1. Check cookie (web app)
    const cookieToken = request.cookies.get('admin_token')?.value;
    if (cookieToken) {
        try {
            await jwtVerify(cookieToken, JWT_SECRET);
            return true;
        } catch {}
    }

    // 2. Check Bearer token (mobile app)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        try {
            await jwtVerify(authHeader.slice(7), JWT_SECRET);
            return true;
        } catch {}
    }

    return false;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin pages (except login page)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const valid = await verifyRequest(request);
        if (!valid) return NextResponse.redirect(new URL('/admin/login', request.url));
        return NextResponse.next();
    }

    // Protect /api/admin routes (except login endpoint and our new auth endpoints)
    if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
        const valid = await verifyRequest(request);
        if (!valid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
