import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/rbac/serverGuard';
import { logAdminActivity } from '@/lib/activityLogger';

// GET /api/admin/expenses - List all charges & expenses with statistics
export async function GET(req: Request) {
  try {
    const { user: currentAdmin, errorResponse } = await requirePermission(req, 'finance.view_costs');
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const search = searchParams.get('q') || '';
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const expenses = await prisma.adminExpense.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Compute Category Breakdowns
    const categoryTotals: Record<string, number> = {
      ADS: 0,
      HOSTING: 0,
      SALARY: 0,
      PACKAGING: 0,
      LOGISTICS: 0,
      TOOLS: 0,
      OFFICE: 0,
      OTHER: 0,
    };

    let totalExpensesMAD = 0;

    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      totalExpensesMAD += amt;
      const cat = e.category.toUpperCase();
      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += amt;
      } else {
        categoryTotals.OTHER += amt;
      }
    });

    // Also fetch active employees payroll to combine if needed
    const employees = await prisma.adminUser.findMany({
      where: { status: 'ACTIVE' },
      select: { salary: true },
    });
    const monthlyPayrollMAD = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);

    return NextResponse.json({
      success: true,
      expenses,
      stats: {
        totalExpensesMAD,
        monthlyPayrollMAD,
        totalWithPayrollMAD: totalExpensesMAD + monthlyPayrollMAD,
        count: expenses.length,
        categoryTotals,
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des charges' },
      { status: 500 }
    );
  }
}

// POST /api/admin/expenses - Add a new charge/expense
export async function POST(req: Request) {
  try {
    const { user: currentAdmin, errorResponse } = await requirePermission(req, 'finance.add_expense');
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const {
      title,
      category = 'OTHER',
      amount,
      date,
      description,
      receiptUrl,
      paymentMethod = 'CREDIT_CARD',
      recurring = 'ONE_TIME',
    } = body;

    if (!title || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Titre et montant de la charge requis' },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json(
        { error: 'Le montant doit être un nombre positif' },
        { status: 400 }
      );
    }

    const newExpense = await prisma.adminExpense.create({
      data: {
        title: title.trim(),
        category: category.toUpperCase(),
        amount: parsedAmount,
        date: date ? new Date(date) : new Date(),
        description: description ? description.trim() : null,
        receiptUrl: receiptUrl || null,
        paymentMethod: paymentMethod || 'CREDIT_CARD',
        recurring: recurring || 'ONE_TIME',
        createdById: currentAdmin?.id,
        creatorName: currentAdmin?.name || 'Admin NAY',
      },
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

    // Log Activity
    await logAdminActivity({
      req,
      userId: currentAdmin?.id,
      userName: currentAdmin?.name,
      userEmail: currentAdmin?.email,
      action: 'ADD_EXPENSE',
      entityType: 'MARKETING',
      entityId: newExpense.id,
      description: `Ajout d'une nouvelle charge : "${newExpense.title}" (-${newExpense.amount} MAD, Catégorie: ${newExpense.category})`,
      newValue: {
        title: newExpense.title,
        amount: newExpense.amount,
        category: newExpense.category,
        date: newExpense.date,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Charge enregistrée avec succès',
        expense: newExpense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement de la charge' },
      { status: 500 }
    );
  }
}
