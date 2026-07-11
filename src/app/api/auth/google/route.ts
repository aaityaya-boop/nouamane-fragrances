import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminAuth } from '@/lib/firebase-admin';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nouamane_super_secret_key_2024'
);

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    // 1. Verify the Firebase ID token using the Firebase Admin SDK
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (!decodedToken.email) {
      return NextResponse.json({ error: 'Email non fourni par Google' }, { status: 400 });
    }

    const { email, name, uid } = decodedToken;

    // 2. Find or Create the user in our Prisma database
    let customer = await prisma.customer.findUnique({
      where: { email }
    });

    if (!customer) {
      // Create user if they don't exist
      // Generate a random secure password since they use Google
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      customer = await prisma.customer.create({
        data: {
          email,
          password: hashedPassword,
          name: name || 'Utilisateur Google',
        }
      });
    }

    // 3. Issue our standard internal JWT so the rest of the app works flawlessly
    const token = await new SignJWT({ 
      id: customer.id, 
      email: customer.email, 
      name: customer.name,
      role: 'customer' 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ 
      success: true, 
      customer: { id: customer.id, name: customer.name, email: customer.email }
    });
    
    // Set cookie
    response.cookies.set({
      name: 'customer_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ error: `Erreur interne: ${error.message}` }, { status: 500 });
  }
}
