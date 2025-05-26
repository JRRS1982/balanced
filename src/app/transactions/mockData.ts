import type { Transaction } from './types';

// Sample transaction data (for development purposes)
export const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-05-01',
    description: 'Monthly Salary',
    amount: 5000,
    category: 'Salary',
    type: 'income',
  },
  {
    id: '2',
    date: '2025-05-05',
    description: 'Rent',
    amount: 1500,
    category: 'Housing',
    type: 'expense',
  },
  {
    id: '3',
    date: '2025-05-08',
    description: 'Groceries',
    amount: 150,
    category: 'Food',
    type: 'expense',
  },
  {
    id: '4',
    date: '2025-05-10',
    description: 'Dining Out',
    amount: 80,
    category: 'Food',
    type: 'expense',
  },
  {
    id: '5',
    date: '2025-05-12',
    description: 'Gas',
    amount: 45,
    category: 'Transportation',
    type: 'expense',
  },
  {
    id: '6',
    date: '2025-05-15',
    description: 'Internet Bill',
    amount: 70,
    category: 'Utilities',
    type: 'expense',
  },
  {
    id: '7',
    date: '2025-05-18',
    description: 'Movie Night',
    amount: 40,
    category: 'Entertainment',
    type: 'expense',
  },
  {
    id: '8',
    date: '2025-05-20',
    description: 'Investment Return',
    amount: 200,
    category: 'Investments',
    type: 'income',
  },
  {
    id: '9',
    date: '2025-05-22',
    description: 'Phone Bill',
    amount: 60,
    category: 'Utilities',
    type: 'expense',
  },
  {
    id: '10',
    date: '2025-05-24',
    description: 'Groceries',
    amount: 120,
    category: 'Food',
    type: 'expense',
  },
];

// Category lists
export const incomeCategories = ['Salary', 'Investments', 'Bonus', 'Gifts', 'Other Income'];
export const expenseCategories = [
  'Housing',
  'Food',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Other Expenses',
];
