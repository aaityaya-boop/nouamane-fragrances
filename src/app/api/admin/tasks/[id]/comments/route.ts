import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { logAdminActivity } from '@/lib/activityLogger';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Le commentaire ne peut pas être vide.' }, { status: 400 });
    }

    const task = await prisma.adminTask.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
    }

    const newComment = await prisma.adminTaskComment.create({
      data: {
        taskId: id,
        userId: admin.id,
        userName: admin.name,
        userAvatar: admin.avatar,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    // Log activity
    await logAdminActivity({
      userId: admin.id,
      userName: admin.name,
      userEmail: admin.email,
      action: 'COMMENT_TASK',
      entityType: 'TASK',
      entityId: id,
      description: `A commenté la mission "${task.title}" : "${content.trim().slice(0, 60)}${content.trim().length > 60 ? '...' : ''}"`,
      req: request,
    });

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error('Error adding task comment:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'ajout du commentaire' }, { status: 500 });
  }
}
