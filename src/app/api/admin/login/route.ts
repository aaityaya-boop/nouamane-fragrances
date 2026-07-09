import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nouamane_super_secret_key_2024'
);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // Default config if no DB config found
    let adminUsername = 'admin';
    let adminPassword = 'nouamane2024';
    
    const config = await prisma.siteConfig.findFirst();
    if (config) {
      adminUsername = config.adminUsername || adminUsername;
      adminPassword = config.adminPassword || adminPassword;
    }

    if (username === adminUsername && password === adminPassword) {
      // Create JWT token
      const token = await new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

      const response = NextResponse.json({ success: true });
      
      // Set HttpOnly cookie
      response.cookies.set({
        name: 'admin_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Identifiant ou mot de passe incorrect' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
