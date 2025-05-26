import { BudgetCategory } from '../transactions/types';
import { BudgetMainSection } from './types';

// Sample budget data (for development purposes)
// TODO: Replace with actual budget data
export const sampleBudgetData: BudgetCategory[] = [
  { category: 'Salary', budgeted: 5000, type: 'income' },
  { category: 'Investments', budgeted: 500, type: 'income' },
  { category: 'Bonus', budgeted: 1000, type: 'income' },
  { category: 'Housing', budgeted: 1500, type: 'expense' },
  { category: 'Food', budgeted: 600, type: 'expense' },
  { category: 'Transportation', budgeted: 300, type: 'expense' },
  { category: 'Utilities', budgeted: 200, type: 'expense' },
  { category: 'Entertainment', budgeted: 200, type: 'expense' },
  { category: 'Healthcare', budgeted: 150, type: 'expense' },
  { category: 'Shopping', budgeted: 300, type: 'expense' },
];

// Sample budget sections (for development purposes)
// TODO: Replace with actual budget sections
export const sampleBudgetSections: BudgetMainSection[] = [
  {
    id: 'income',
    name: 'Income',
    subsections: [
      {
        id: 'income-1',
        name: 'Primary Income',
        rows: [
          { id: 'income-1-1', description: 'Salary', amount: 5000 },
          { id: 'income-1-2', description: 'Bonus', amount: 1000 },
        ],
      },
      {
        id: 'income-2',
        name: 'Secondary Income',
        rows: [
          { id: 'income-2-1', description: 'Investments', amount: 500 },
          { id: 'income-2-2', description: 'Side Projects', amount: 300 },
        ],
      },
    ],
  },
  {
    id: 'expenses',
    name: 'Expenses',
    subsections: [
      {
        id: 'expenses-1',
        name: 'Housing',
        rows: [
          { id: 'expenses-1-1', description: 'Rent', amount: 1500 },
          { id: 'expenses-1-2', description: 'Utilities', amount: 200 },
        ],
      },
      {
        id: 'expenses-2',
        name: 'Food',
        rows: [
          { id: 'expenses-2-1', description: 'Groceries', amount: 400 },
          { id: 'expenses-2-2', description: 'Dining Out', amount: 200 },
        ],
      },
      {
        id: 'expenses-3',
        name: 'Transportation',
        rows: [
          { id: 'expenses-3-1', description: 'Gas', amount: 150 },
          { id: 'expenses-3-2', description: 'Public Transit', amount: 100 },
          { id: 'expenses-3-3', description: 'Car Maintenance', amount: 50 },
        ],
      },
      {
        id: 'expenses-4',
        name: 'Entertainment',
        rows: [
          { id: 'expenses-4-1', description: 'Streaming Services', amount: 50 },
          { id: 'expenses-4-2', description: 'Movies/Events', amount: 100 },
          { id: 'expenses-4-3', description: 'Hobbies', amount: 50 },
        ],
      },
      {
        id: 'expenses-5',
        name: 'Healthcare',
        rows: [
          { id: 'expenses-5-1', description: 'Insurance', amount: 100 },
          { id: 'expenses-5-2', description: 'Medications', amount: 50 },
        ],
      },
      {
        id: 'expenses-6',
        name: 'Shopping',
        rows: [
          { id: 'expenses-6-1', description: 'Clothing', amount: 150 },
          { id: 'expenses-6-2', description: 'Electronics', amount: 100 },
          { id: 'expenses-6-3', description: 'Household Items', amount: 50 },
        ],
      },
    ],
  },
];
