import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'tiddlee-super-secret-key-change-me'
);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes (except /admin/login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            console.error('JWT verification failed:', error);
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Also protect API routes starting with /api/admin (except /api/admin/login)
    if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
