'use server';

import { BudgetMainSection } from '../../app/budget/types';
import prisma from '../../lib/db';

// Define proper interfaces for our models based on schema
interface BudgetCategory {
  id: string;
  name: string;
  type: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items?: BudgetItem[];
}

interface BudgetItem {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category?: BudgetCategory;
}

type BudgetData = {
  categories: BudgetCategory[];
  sections: BudgetMainSection[];
};

/**
 * items is a relationship on category so needs to be added for typescript
 */
type BudgetCategoryWithItems = BudgetCategory & { items: BudgetItem[] };

export const getBudget = async (userId: string): Promise<BudgetData> => {
  try {
    // Fetch budget categories and their items from the database
    const categories = await prisma.budgetCategory.findMany({
      where: {
        userId,
      },
      include: {
        items: true, // also fetch the items for the category
      },
    });

    // Transform the data to match our frontend types
    const budgetCategories: BudgetCategoryWithItems[] = categories.map(
      (category: BudgetCategoryWithItems) => ({
        ...category,
        budgeted:
          category.items.reduce((total: number, item: BudgetItem) => total + item.amount, 0) ?? 0,
      })
    );

    // Create the sections structure that our budget page expects
    const sections: BudgetMainSection[] = [
      {
        id: 'income',
        name: 'Income',
        subsections: categories
          .filter((cat: BudgetCategoryWithItems) => cat.type === 'income')
          .map((category: BudgetCategoryWithItems) => ({
            id: category.id,
            name: category.name,
            rows: category.items.map((item: BudgetItem) => ({
              id: item.id,
              description: item.description,
              amount: item.amount,
            })),
          })),
      },
      {
        id: 'expenses',
        name: 'Expenses',
        subsections: categories
          .filter((cat: BudgetCategoryWithItems) => cat.type === 'expense')
          .map((category: BudgetCategoryWithItems) => ({
            id: category.id,
            name: category.name,
            rows: category.items
              ? category.items.map((item: BudgetItem) => ({
                  id: item.id,
                  description: item.description,
                  amount: item.amount,
                }))
              : [],
          })),
      },
    ];

    return { categories: budgetCategories, sections };
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return { categories: [], sections: [] };
  }
};
