// Budget-related types

export interface BudgetRow {
  id: string;
  description: string;
  amount: number;
}

export interface BudgetSubsection {
  id: string;
  name: string;
  rows: BudgetRow[];
}

export interface BudgetMainSection {
  id: string;
  name: string; // 'Income' or 'Expenses'
  subsections: BudgetSubsection[];
}

// Budget category type shared with transactions page
export interface BudgetCategory {
  category: string;
  budgeted: number;
  type: 'income' | 'expense';
}
