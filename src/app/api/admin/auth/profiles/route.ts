import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { seedDefaultOwnersIfEmpty } from '@/lib/auth/adminAuth';

// Public endpoint to list available admin profiles for login selection screen
export async function GET() {
  try {
    await seedDefaultOwnersIfEmpty();

    const owners = await prisma.adminUser.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      profiles: owners.map(o => ({
        id: o.id,
        name: o.name,
        email: o.email,
        slug: o.email.split('@')[0].toLowerCase(),
        role: o.role,
        avatar: o.avatar,
        lastLoginAt: o.lastLoginAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin profiles:', error);
    // Return hardcoded fallback if DB is momentarily unreachable
    return NextResponse.json({
      success: true,
      profiles: [
        {
          id: 'ayoub-fallback',
          name: 'AYOUB AIT YAHYA',
          email: 'ayoub@nayparfum.ma',
          slug: 'ayoub',
          role: 'OWNER',
          avatar: null,
        },
        {
          id: 'nouamane-fallback',
          name: 'NOUAMANE AIT YAHYA',
          email: 'nouamane@nayparfum.ma',
          slug: 'nouamane',
          role: 'OWNER',
          avatar: null,
        },
      ],
    });
  }
}
