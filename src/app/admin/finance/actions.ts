'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addAdSpend(data: { platform: string; amount: number; date: string }) {
  try {
    const newAdSpend = await prisma.adSpend.create({
      data: {
        platform: data.platform,
        amount: data.amount,
        date: new Date(data.date),
      },
    });
    
    revalidatePath('/admin/finance');
    return { success: true, data: newAdSpend };
  } catch (error) {
    console.error('Error adding ad spend:', error);
    return { success: false, error: 'Failed to add ad spend' };
  }
}

export async function deleteAdSpend(id: string) {
  try {
    await prisma.adSpend.delete({
      where: { id },
    });
    
    revalidatePath('/admin/finance');
    return { success: true };
  } catch (error) {
    console.error('Error deleting ad spend:', error);
    return { success: false, error: 'Failed to delete ad spend' };
  }
}
