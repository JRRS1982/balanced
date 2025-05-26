'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  isCurrentMonth,
  formatCurrency,
  formatDateToISOString,
  calculateBudgetTotal,
  standardizeDateFormat,
} from './helpers';
import type { Transaction, BudgetCategory, ChartDataPoint } from './types';
import { sampleTransactions, incomeCategories, expenseCategories } from './mockData';
import { sampleBudgetData } from '../budget/mockData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import styles from './transactions.module.css';

export default function TransactionsPage() {
  const [budgetData] = useState<BudgetCategory[]>(sampleBudgetData);
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);

  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: '',
    type: 'expense',
  });

  const [filter, setFilter] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
    searchTerm: '',
  });

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTransaction.description || !newTransaction.category || newTransaction.amount <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }
    // Ensure the date is in the ISO format YYYY-MM-DD
    const formattedDate = formatDateToISOString(newTransaction.date);

    const transaction: Transaction = {
      id: Date.now().toString(),
      ...newTransaction,
      date: formattedDate, // Use the standardized date format
    };

    setTransactions(transactions => [transaction, ...transactions]);

    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      category: '',
      type: 'expense',
    });
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
  };

  const getUniqueCategories = () => {
    const categories = transactions.map(transaction => transaction.category);
    return ['all', ...new Set(categories)];
  };

  // Function to filter transactions
  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      // Filter by type
      if (filter.type !== 'all' && transaction.type !== filter.type) {
        return false;
      }

      // Filter by category
      if (filter.category !== 'all' && transaction.category !== filter.category) {
        return false;
      }

      // Standardize date format for comparison
      const transactionDate = standardizeDateFormat(transaction.date);

      // Filter by date range
      if (filter.startDate && transactionDate < filter.startDate) {
        return false;
      }

      if (filter.endDate && transactionDate > filter.endDate) {
        return false;
      }

      // Filter by search term
      if (
        filter.searchTerm &&
        !transaction.description.toLowerCase().includes(filter.searchTerm.toLowerCase())
      ) {
        return false;
      }

      // For debugging
      if (isCurrentMonth(transaction.date)) {
        console.log('Including transaction in filtered results:', transaction);
      }

      return true;
    });
  };

  // Get filtered transactions
  const filteredTransactions = getFilteredTransactions();

  // Calculate totals
  const calculateTotal = (type: 'income' | 'expense' | 'all') => {
    return filteredTransactions
      .filter(transaction => type === 'all' || transaction.type === type)
      .reduce((total, transaction) => {
        return total + transaction.amount;
      }, 0);
  };

  // Wrapper for the calculateBudgetTotal helper
  const calculateBudgetTotalMemo = useCallback(
    (type: 'income' | 'expense') => {
      return calculateBudgetTotal(budgetData, type);
    },
    [budgetData]
  );

  // Get current month transactions
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(transaction => isCurrentMonth(transaction.date));
  }, [transactions]);

  // Generate chart data
  const chartData = useMemo(() => {
    const totalMonthlyBudget = calculateBudgetTotalMemo('expense');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyBudget = totalMonthlyBudget / daysInMonth;
    const transactionsByDate: Record<string, { income: number; expenses: number }> = {};
    const allDates: string[] = [];
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Generate dates for exactly this month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      // Create a string in YYYY-MM-DD format for this day
      // Ensure month is zero-padded (May = 05)
      const monthStr = String(month + 1).padStart(2, '0');
      // Ensure day is zero-padded
      const dayStr = String(day).padStart(2, '0');
      // Create date in YYYY-MM-DD format
      const dateString = `${year}-${monthStr}-${dayStr}`;

      // Add to our dates array
      allDates.push(dateString);

      // Initialize transaction data for this date
      transactionsByDate[dateString] = { income: 0, expenses: 0 };
    }

    // Fill in actual transaction values
    currentMonthTransactions.forEach(transaction => {
      const dateString = transaction.date;

      if (transactionsByDate[dateString]) {
        if (transaction.type === 'income') {
          transactionsByDate[dateString].income += transaction.amount;
        } else {
          transactionsByDate[dateString].expenses += transaction.amount;
        }
      } else {
        // Try to parse and format the date to match
        try {
          const transactionDate = new Date(dateString);
          const formattedDate = transactionDate.toISOString().split('T')[0];

          // If we have this reformatted date in our map, use it
          if (transactionsByDate[formattedDate]) {
            if (transaction.type === 'income') {
              transactionsByDate[formattedDate].income += transaction.amount;
            } else {
              transactionsByDate[formattedDate].expenses += transaction.amount;
            }
          }
        } catch (e) {
          console.error('Error parsing date:', dateString, e);
        }
      }
    });

    // Generate the chart data points with running totals
    const result: ChartDataPoint[] = [];
    let runningIncome = 0;
    let runningExpenses = 0;
    let cumulativeBudget = 0;

    // Sort dates to ensure chronological order
    allDates.sort();

    for (const dateString of allDates) {
      // Get transaction data for this date if it exists, otherwise use zeros
      const transactionData = transactionsByDate[dateString] || { income: 0, expenses: 0 };
      const { income, expenses } = transactionData;

      // Update running totals
      runningIncome += income;
      runningExpenses += expenses;
      const netPosition = runningIncome - runningExpenses;
      cumulativeBudget += dailyBudget;

      result.push({
        date: dateString,
        expenses: expenses,
        income: income,
        balance: income - expenses, // Daily balance
        cumulativeBalance: netPosition, // Running net position (income - expenses)
        budget: cumulativeBudget,
      });
    }

    return result;
  }, [currentMonthTransactions, calculateBudgetTotalMemo]);

  // Calculate budget progress
  const budgetProgress = useMemo(() => {
    const totalBudget = calculateBudgetTotalMemo('expense');
    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const percentUsed = (totalExpenses / totalBudget) * 100;
    const isOverBudget = totalExpenses > totalBudget;

    const result = {
      totalBudget,
      totalExpenses,
      percentUsed,
      isOverBudget,
      remaining: totalBudget - totalExpenses,
    };
    return result;
  }, [currentMonthTransactions, calculateBudgetTotalMemo]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Transactions</h1>

      <div className={styles.budgetChart}>
        <h2>
          Budget Tracking:{' '}
          {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString(
            'en-US',
            { month: 'short', day: 'numeric' }
          )}
          {' - '}
          {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString(
            'en-US',
            { month: 'short', day: 'numeric' }
          )}
        </h2>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={date => new Date(date).getDate().toString()} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
                labelFormatter={date => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" strokeWidth={1} strokeOpacity={0.5} />
              <Area
                type="monotone"
                dataKey="cumulativeBalance"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.2}
                name="Monthly Net Position (Income - Expenses)"
                isAnimationActive={true}
              />
              <Area
                type="monotone"
                dataKey="budget"
                stroke="#ff0000"
                strokeDasharray="3 3"
                fill="#ff0000"
                fillOpacity={0.1}
                name="Budget Position"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.budgetSummary}>
          <div
            className={`${styles.budgetStatus} ${budgetProgress.isOverBudget ? styles.overBudget : styles.underBudget}`}
          >
            <h3>{budgetProgress.isOverBudget ? 'Over Budget!' : 'Under Budget'}</h3>
            <p>You&apos;ve spent {budgetProgress.percentUsed.toFixed(1)}% of your monthly budget</p>
          </div>

          <div className={styles.budgetDetails}>
            <div className={styles.budgetDetail}>
              <span>Monthly Budget:</span>
              <span>{formatCurrency(budgetProgress.totalBudget)}</span>
            </div>
            <div className={styles.budgetDetail}>
              <span>Spent So Far:</span>
              <span>{formatCurrency(budgetProgress.totalExpenses)}</span>
            </div>
            <div className={styles.budgetDetail}>
              <span>{budgetProgress.isOverBudget ? 'Amount Over:' : 'Remaining:'}</span>
              <span>{formatCurrency(Math.abs(budgetProgress.remaining))}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Form section */}
        <div className={styles.formSection}>
          <h2>Add New Transaction</h2>
          <form onSubmit={addTransaction} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={newTransaction.type}
                onChange={e =>
                  setNewTransaction({
                    ...newTransaction,
                    type: e.target.value as 'income' | 'expense',
                    // Reset category when type changes
                    category: '',
                  })
                }
                className={styles.select}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={newTransaction.category}
                onChange={e =>
                  setNewTransaction({
                    ...newTransaction,
                    category: e.target.value,
                  })
                }
                className={styles.select}
                required
              >
                <option value="">Select a category</option>
                {newTransaction.type === 'income'
                  ? incomeCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  : expenseCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={newTransaction.date}
                onChange={e =>
                  setNewTransaction({
                    ...newTransaction,
                    date: e.target.value,
                  })
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                value={newTransaction.description}
                onChange={e =>
                  setNewTransaction({
                    ...newTransaction,
                    description: e.target.value,
                  })
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                min="0.01"
                step="0.01"
                value={newTransaction.amount || ''}
                onChange={e =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className={styles.input}
                required
              />
            </div>

            <button type="submit" className={styles.button}>
              Add Transaction
            </button>
          </form>
        </div>

        {/* List section */}
        <div className={styles.listSection}>
          <div className={styles.filters}>
            <h2>Transactions</h2>
            <div className={styles.filterControls}>
              <div className={styles.filterGroup}>
                <label htmlFor="filterType">Type</label>
                <select
                  id="filterType"
                  value={filter.type}
                  onChange={e =>
                    setFilter({
                      ...filter,
                      type: e.target.value as 'all' | 'income' | 'expense',
                    })
                  }
                  className={styles.filterSelect}
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="filterCategory">Category</label>
                <select
                  id="filterCategory"
                  value={filter.category}
                  onChange={e =>
                    setFilter({
                      ...filter,
                      category: e.target.value,
                    })
                  }
                  className={styles.filterSelect}
                >
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label htmlFor="searchTerm">Search</label>
                <input
                  type="text"
                  id="searchTerm"
                  value={filter.searchTerm}
                  onChange={e =>
                    setFilter({
                      ...filter,
                      searchTerm: e.target.value,
                    })
                  }
                  placeholder="Search descriptions..."
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.dateFilters}>
                <div className={styles.filterGroup}>
                  <label htmlFor="startDate">From</label>
                  <input
                    type="date"
                    id="startDate"
                    value={filter.startDate}
                    onChange={e =>
                      setFilter({
                        ...filter,
                        startDate: e.target.value,
                      })
                    }
                    className={styles.filterInput}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label htmlFor="endDate">To</label>
                  <input
                    type="date"
                    id="endDate"
                    value={filter.endDate}
                    onChange={e =>
                      setFilter({
                        ...filter,
                        endDate: e.target.value,
                      })
                    }
                    className={styles.filterInput}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span>Income:</span>
              <span className={styles.income}>{formatCurrency(calculateTotal('income'))}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Expenses:</span>
              <span className={styles.expense}>{formatCurrency(calculateTotal('expense'))}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Balance:</span>
              <span
                className={
                  calculateTotal('income') - calculateTotal('expense') >= 0
                    ? styles.income
                    : styles.expense
                }
              >
                {formatCurrency(calculateTotal('income') - calculateTotal('expense'))}
              </span>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className={styles.noTransactions}>
              <p>No transactions found matching your filters.</p>
            </div>
          ) : (
            <div className={styles.transactionList}>
              {filteredTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className={`${styles.transactionItem} ${
                    transaction.type === 'income' ? styles.incomeItem : styles.expenseItem
                  }`}
                >
                  <div className={styles.transactionHeader}>
                    <span className={styles.transactionDate}>{transaction.date}</span>
                    <span
                      className={`${styles.transactionCategory} ${
                        transaction.type === 'income'
                          ? styles.incomeCategory
                          : styles.expenseCategory
                      }`}
                    >
                      {transaction.category}
                    </span>
                  </div>

                  <div className={styles.transactionDetails}>
                    <span className={styles.transactionDescription}>{transaction.description}</span>
                    <span className={styles.transactionAmount}>
                      {transaction.type === 'income' ? '+' : '-'}{' '}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>

                  <button
                    className={styles.deleteButton}
                    onClick={() => removeTransaction(transaction.id)}
                    aria-label="Delete transaction"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
