import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth/adminAuth';
import { logAdminActivity } from '@/lib/activityLogger';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const priority = searchParams.get('priority') || 'ALL';
    const assignedToId = searchParams.get('assignedToId') || 'ALL';
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    }

    if (priority !== 'ALL') {
      where.priority = priority;
    }

    if (assignedToId === 'ME') {
      where.assignedToId = admin.id;
    } else if (assignedToId === 'UNASSIGNED') {
      where.assignedToId = null;
    } else if (assignedToId !== 'ALL') {
      where.assignedToId = assignedToId;
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { tags: { contains: search.trim(), mode: 'insensitive' } },
        { assigneeName: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Fetch tasks & compute overview stats
    const [tasks, allTasks] = await Promise.all([
      prisma.adminTask.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
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
      }),
      prisma.adminTask.findMany({
        select: {
          id: true,
          status: true,
          priority: true,
          assignedToId: true,
        },
      }),
    ]);

    const stats = {
      total: allTasks.length,
      todo: allTasks.filter((t) => t.status === 'TODO').length,
      inProgress: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      inReview: allTasks.filter((t) => t.status === 'IN_REVIEW').length,
      completed: allTasks.filter((t) => t.status === 'COMPLETED').length,
      urgent: allTasks.filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED').length,
      myTasks: allTasks.filter((t) => t.assignedToId === admin.id && t.status !== 'COMPLETED').length,
    };

    return NextResponse.json({
      success: true,
      tasks,
      stats,
    });
  } catch (error) {
    console.error('Error fetching admin tasks:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des tâches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, status, dueDate, assignedToId, tags } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Le titre de la mission est obligatoire.' }, { status: 400 });
    }

    let assigneeName: string | null = null;
    if (assignedToId) {
      const assignedUser = await prisma.adminUser.findUnique({
        where: { id: assignedToId },
        select: { name: true },
      });
      if (assignedUser) {
        assigneeName = assignedUser.name;
      }
    }

    const newTask = await prisma.adminTask.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: admin.id,
        creatorName: admin.name,
        assignedToId: assignedToId || null,
        assigneeName: assigneeName,
        tags: tags?.trim() || null,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
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

    // Log Activity
    await logAdminActivity({
      userId: admin.id,
      userName: admin.name,
      userEmail: admin.email,
      action: 'CREATE_TASK',
      entityType: 'TASK',
      entityId: newTask.id,
      description: `A créé la mission : "${newTask.title}"${assigneeName ? ` (Assignée à ${assigneeName})` : ''}`,
      newValue: {
        title: newTask.title,
        priority: newTask.priority,
        status: newTask.status,
        assignee: assigneeName,
      },
      req: request,
    });

    return NextResponse.json({
      success: true,
      task: newTask,
    });
  } catch (error) {
    console.error('Error creating admin task:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la tâche' }, { status: 500 });
  }
}
