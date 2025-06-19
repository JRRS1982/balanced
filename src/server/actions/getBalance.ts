'use server';

import {
  BalanceCategory,
  BalanceItem,
  BalanceMainSection,
  BalanceSubsection,
} from '../../app/balance/types';
import prisma from '../../lib/db';
import { BalanceSectionId } from '../../app/balance/enums';

type BalanceData = { sections: BalanceMainSection[] };

export async function getBalance(userId: string): Promise<BalanceData> {
  try {
    // Fetch balance categories with their items from the database
    const categories =
      (await prisma.balanceCategory.findMany({
        where: {
          userId,
        },
        include: {
          items: true,
        },
      })) || [];

    // Create the sections structure that our balance page expects
    const sections: BalanceMainSection[] = [
      {
        id: BalanceSectionId.ASSETS,
        name: 'Assets',
        subsections: categories
          .filter((cat: BalanceCategory) => cat.type === BalanceSectionId.ASSETS)
          .map((category: BalanceCategory) => {
            const subsection: BalanceSubsection = {
              id: category.id,
              name: category.name,
              items: category.items.map((item: BalanceItem) => ({
                id: item.id,
                description: item.description,
                amount: item.amount,
              })),
            };
            return subsection;
          }),
      },
      {
        id: BalanceSectionId.LIABILITIES,
        name: 'Liabilities',
        subsections: categories
          .filter((cat: BalanceCategory) => {
            if (cat.type === BalanceSectionId.LIABILITIES) return true;
            return false;
          })
          .map((category: BalanceCategory) => {
            const subsection: BalanceSubsection = {
              id: category.id,
              name: category.name,
              items: category.items.map((item: BalanceItem) => ({
                id: item.id,
                description: item.description,
                amount: item.amount,
              })),
            };
            return subsection;
          }),
      },
    ];

    return { sections };
  } catch (error) {
    console.error('Error fetching balance data:', error);
    return { sections: [] };
  }
}
