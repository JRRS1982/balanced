import { BalanceMainSection } from './types';

export const sampleBalanceSections: BalanceMainSection[] = [
  {
    id: 'assets',
    name: 'Assets',
    subsections: [
      {
        id: 'assets-1',
        name: 'Cash & Investments',
        items: [
          {
            id: 'assets-1-1',
            description: 'Checking Account',
            amount: 5000,
          },
          {
            id: 'assets-1-2',
            description: 'Savings Account',
            amount: 25000,
          },
          {
            id: 'assets-1-3',
            description: 'Investment Portfolio',
            amount: 75000,
          },
        ],
      },
      {
        id: 'assets-2',
        name: 'Property',
        items: [
          {
            id: 'assets-2-1',
            description: 'Home Value',
            amount: 350000,
          },
          {
            id: 'assets-2-2',
            description: 'Vehicle',
            amount: 15000,
          },
        ],
      },
      {
        id: 'assets-3',
        name: 'Other Assets',
        items: [
          {
            id: 'assets-3-1',
            description: 'Collectibles',
            amount: 5000,
          },
          {
            id: 'assets-3-2',
            description: 'Personal Property',
            amount: 10000,
          },
        ],
      },
    ],
  },
  {
    id: 'liabilities',
    name: 'Liabilities',
    subsections: [
      {
        id: 'liabilities-1',
        name: 'Mortgage & Loans',
        items: [
          {
            id: 'liabilities-1-1',
            description: 'Mortgage Balance',
            amount: 250000,
          },
          {
            id: 'liabilities-1-2',
            description: 'Car Loan',
            amount: 8000,
          },
        ],
      },
      {
        id: 'liabilities-2',
        name: 'Credit & Debt',
        items: [
          {
            id: 'liabilities-2-1',
            description: 'Credit Card Balance',
            amount: 2500,
          },
          {
            id: 'liabilities-2-2',
            description: 'Student Loans',
            amount: 15000,
          },
        ],
      },
      {
        id: 'liabilities-3',
        name: 'Other Liabilities',
        items: [
          {
            id: 'liabilities-3-1',
            description: 'Personal Loans',
            amount: 3000,
          },
        ],
      },
    ],
  },
];
