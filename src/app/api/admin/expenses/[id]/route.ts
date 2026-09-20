import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/rbac/serverGuard';
import { logAdminActivity } from '@/lib/activityLogger';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/expenses/[id] - Get expense details
export async function GET(req: Request, context: RouteContext) {
  try {
    const { user: currentAdmin, errorResponse } = await requirePermission(req, 'finance.view_costs');
    if (errorResponse) return errorResponse;

    const { id } = await context.params;

    const expense = await prisma.adminExpense.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Charge introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de la charge' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/expenses/[id] - Update expense
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { user: currentAdmin, errorResponse } = await requirePermission(req, 'finance.edit_expense');
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const body = await req.json();

    const targetExpense = await prisma.adminExpense.findUnique({
      where: { id },
    });

    if (!targetExpense) {
      return NextResponse.json({ error: 'Charge introuvable' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.title !== undefined && body.title.trim()) updateData.title = body.title.trim();
    if (body.category !== undefined && body.category.trim()) updateData.category = body.category.trim().toUpperCase();
    if (body.amount !== undefined) {
      const parsed = Number(body.amount);
      if (!isNaN(parsed) && parsed >= 0) updateData.amount = parsed;
    }
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.description !== undefined) updateData.description = body.description ? body.description.trim() : null;
    if (body.receiptUrl !== undefined) updateData.receiptUrl = body.receiptUrl || null;
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.recurring !== undefined) updateData.recurring = body.recurring;

    const updated = await prisma.adminExpense.update({
      where: { id },
      data: updateData,
    });

    await logAdminActivity({
      req,
      userId: currentAdmin?.id,
      userName: currentAdmin?.name,
      userEmail: currentAdmin?.email,
      action: 'UPDATE_EXPENSE',
      entityType: 'MARKETING',
      entityId: id,
      description: `Modification de la charge "${updated.title}" (-${updated.amount} MAD)`,
      oldValue: { title: targetExpense.title, amount: targetExpense.amount, category: targetExpense.category },
      newValue: { title: updated.title, amount: updated.amount, category: updated.category },
    });

    return NextResponse.json({
      success: true,
      message: 'Charge mise à jour avec succès',
      expense: updated,
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la charge' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/expenses/[id] - Delete expense
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { user: currentAdmin, errorResponse } = await requirePermission(req, 'finance.edit_expense');
    if (errorResponse) return errorResponse;

    const { id } = await context.params;

    const targetExpense = await prisma.adminExpense.findUnique({
      where: { id },
    });

    if (!targetExpense) {
      return NextResponse.json({ error: 'Charge introuvable' }, { status: 404 });
    }

    await prisma.adminExpense.delete({
      where: { id },
    });

    await logAdminActivity({
      req,
      userId: currentAdmin?.id,
      userName: currentAdmin?.name,
      userEmail: currentAdmin?.email,
      action: 'DELETE_EXPENSE',
      entityType: 'MARKETING',
      entityId: id,
      description: `Suppression de la charge "${targetExpense.title}" (-${targetExpense.amount} MAD)`,
    });

    return NextResponse.json({
      success: true,
      message: 'Charge supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la charge' },
      { status: 500 }
    );
  }
}
