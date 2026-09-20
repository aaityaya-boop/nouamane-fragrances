import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { logAdminActivity } from '@/lib/activityLogger';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const task = await prisma.adminTask.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Error fetching admin task by ID:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement de la tâche' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { title, description, priority, status, dueDate, assignedToId, tags } = body;

    const existingTask = await prisma.adminTask.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (priority !== undefined) updateData.priority = priority;
    if (tags !== undefined) updateData.tags = tags?.trim() || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    if (assignedToId !== undefined) {
      if (assignedToId === null || assignedToId === '') {
        updateData.assignedToId = null;
        updateData.assigneeName = null;
      } else {
        const assignedUser = await prisma.adminUser.findUnique({
          where: { id: assignedToId },
          select: { name: true },
        });
        updateData.assignedToId = assignedToId;
        updateData.assigneeName = assignedUser ? assignedUser.name : null;
      }
    }

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (status !== 'COMPLETED' && existingTask.status === 'COMPLETED') {
        updateData.completedAt = null;
      }
    }

    const updatedTask = await prisma.adminTask.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    // Determine activity action & description
    let action = 'UPDATE_TASK';
    let activityDesc = `A modifié la mission : "${updatedTask.title}"`;
    if (status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
      action = 'COMPLETE_TASK';
      activityDesc = `A marqué la mission comme terminée : "${updatedTask.title}"`;
    } else if (assignedToId !== undefined && assignedToId !== existingTask.assignedToId) {
      action = 'ASSIGN_TASK';
      activityDesc = `A réassigné la mission "${updatedTask.title}" à ${updatedTask.assigneeName || 'Non assigné'}`;
    }

    await logAdminActivity({
      userId: admin.id,
      userName: admin.name,
      userEmail: admin.email,
      action,
      entityType: 'TASK',
      entityId: updatedTask.id,
      description: activityDesc,
      oldValue: {
        status: existingTask.status,
        priority: existingTask.priority,
        assignee: existingTask.assigneeName,
      },
      newValue: {
        status: updatedTask.status,
        priority: updatedTask.priority,
        assignee: updatedTask.assigneeName,
      },
      req: request,
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error updating admin task:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la tâche' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const task = await prisma.adminTask.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 });
    }

    await prisma.adminTask.delete({
      where: { id },
    });

    await logAdminActivity({
      userId: admin.id,
      userName: admin.name,
      userEmail: admin.email,
      action: 'DELETE_TASK',
      entityType: 'TASK',
      entityId: id,
      description: `A supprimé la mission : "${task.title}"`,
      req: request,
    });

    return NextResponse.json({
      success: true,
      message: 'Mission supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting admin task:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la tâche' }, { status: 500 });
  }
}
