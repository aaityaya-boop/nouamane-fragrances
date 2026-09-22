import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const groups = await prisma.adminChatGroup.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error('Error fetching chat groups:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des groupes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color = 'sky', memberIds = [] } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du groupe est requis' }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // Ensure creator is always in memberIds
    const finalMemberIds = Array.from(new Set([admin.id, ...memberIds]));

    const group = await prisma.adminChatGroup.create({
      data: {
        name: name.trim(),
        slug: slug.toUpperCase(),
        description: description?.trim() || null,
        color: color || 'sky',
        memberIds: JSON.stringify(finalMemberIds),
        createdById: admin.id,
        creatorName: admin.name,
      },
    });

    // Create system notification message in the new group
    await prisma.adminChatMessage.create({
      data: {
        senderId: admin.id,
        senderName: admin.name,
        senderAvatar: admin.avatar,
        channel: group.slug,
        content: `🎉 Groupe "${group.name}" créé par ${admin.name}. Bienvenue aux membres !`,
      },
    });

    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Error creating chat group:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du groupe' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, color, memberIds } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID du groupe requis' }, { status: 400 });
    }

    const updated = await prisma.adminChatGroup.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(color ? { color } : {}),
        ...(memberIds ? { memberIds: JSON.stringify(memberIds) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      group: updated,
    });
  } catch (error) {
    console.error('Error updating chat group:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du groupe' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID du groupe requis' }, { status: 400 });
    }

    const group = await prisma.adminChatGroup.findUnique({ where: { id } });
    if (!group) {
      return NextResponse.json({ error: 'Groupe introuvable' }, { status: 404 });
    }

    // Delete messages associated with channel
    await prisma.adminChatMessage.deleteMany({ where: { channel: group.slug } });
    await prisma.adminChatGroup.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Groupe supprimé avec succès',
    });
  } catch (error) {
    console.error('Error deleting chat group:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du groupe' }, { status: 500 });
  }
}
