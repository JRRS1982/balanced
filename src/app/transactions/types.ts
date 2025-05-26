// Transaction-related types

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
};

export type BudgetCategory = {
  category: string;
  budgeted: number;
  type: 'income' | 'expense';
};

export type ChartDataPoint = {
  date: string;
  expenses: number;
  income: number;
  balance: number;
  cumulativeBalance: number;
  budget: number;
};
