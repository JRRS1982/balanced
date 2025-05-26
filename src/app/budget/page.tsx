'use client';

import { useState } from 'react';
import styles from './budget.module.css';
import { BudgetMainSection, BudgetSubsection, BudgetRow } from './types';
import { sampleBudgetSections } from './mockData';

export default function BudgetPage() {
  // State for main budget sections (Income and Expenses)
  const [mainSections, setMainSections] = useState<BudgetMainSection[]>(sampleBudgetSections);

  // Function to add a new subsection to a main section
  const addSubsection = (mainSectionId: string) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          const newSubsectionId = `${mainSectionId}-${mainSection.subsections.length + 1}`;
          return {
            ...mainSection,
            subsections: [
              ...mainSection.subsections,
              {
                id: newSubsectionId,
                name: `New ${mainSection.name} Category`,
                rows: [],
              },
            ],
          };
        }
        return mainSection;
      })
    );
  };

  // Function to remove a subsection
  const removeSubsection = (mainSectionId: string, subsectionId: string) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          return {
            ...mainSection,
            subsections: mainSection.subsections.filter(
              subsection => subsection.id !== subsectionId
            ),
          };
        }
        return mainSection;
      })
    );
  };

  // Function to update a subsection name
  const updateSubsectionName = (mainSectionId: string, subsectionId: string, newName: string) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          return {
            ...mainSection,
            subsections: mainSection.subsections.map(subsection =>
              subsection.id === subsectionId ? { ...subsection, name: newName } : subsection
            ),
          };
        }
        return mainSection;
      })
    );
  };

  // Function to add a row to a subsection
  const addRow = (mainSectionId: string, subsectionId: string) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          return {
            ...mainSection,
            subsections: mainSection.subsections.map(subsection => {
              if (subsection.id === subsectionId) {
                const newRowId = `${subsectionId}-${subsection.rows.length + 1}`;
                return {
                  ...subsection,
                  rows: [...subsection.rows, { id: newRowId, description: 'New Item', amount: 0 }],
                };
              }
              return subsection;
            }),
          };
        }
        return mainSection;
      })
    );
  };

  // Function to remove a row from a subsection
  const removeRow = (mainSectionId: string, subsectionId: string, rowId: string) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          return {
            ...mainSection,
            subsections: mainSection.subsections.map(subsection => {
              if (subsection.id === subsectionId) {
                return {
                  ...subsection,
                  rows: subsection.rows.filter(row => row.id !== rowId),
                };
              }
              return subsection;
            }),
          };
        }
        return mainSection;
      })
    );
  };

  // Function to update a row
  const updateRow = (
    mainSectionId: string,
    subsectionId: string,
    rowId: string,
    field: keyof BudgetRow,
    value: string | number
  ) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          return {
            ...mainSection,
            subsections: mainSection.subsections.map(subsection => {
              if (subsection.id === subsectionId) {
                return {
                  ...subsection,
                  rows: subsection.rows.map(row => {
                    if (row.id === rowId) {
                      return { ...row, [field]: value };
                    }
                    return row;
                  }),
                };
              }
              return subsection;
            }),
          };
        }
        return mainSection;
      })
    );
  };

  // Calculate total for a subsection
  const calculateSubsectionTotal = (subsection: BudgetSubsection) => {
    return subsection.rows.reduce((total, row) => total + row.amount, 0);
  };

  // Calculate total for a main section (sum of all subsections)
  const calculateMainSectionTotal = (mainSection: BudgetMainSection) => {
    return mainSection.subsections.reduce(
      (total, subsection) => total + calculateSubsectionTotal(subsection),
      0
    );
  };

  // Calculate income total
  const calculateIncomeTotal = () => {
    const incomeSection = mainSections.find(section => section.id === 'income');
    return incomeSection ? calculateMainSectionTotal(incomeSection) : 0;
  };

  // Calculate expenses total
  const calculateExpensesTotal = () => {
    const expensesSection = mainSections.find(section => section.id === 'expenses');
    return expensesSection ? calculateMainSectionTotal(expensesSection) : 0;
  };

  // Calculate net income (income - expenses)
  const calculateNetIncome = () => {
    return calculateIncomeTotal() - calculateExpensesTotal();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Budget Planner</h1>

      {mainSections.map(mainSection => (
        <div key={mainSection.id} className={styles.mainSection}>
          <h2 className={styles.mainSectionTitle}>{mainSection.name}</h2>

          <button className={styles.addButton} onClick={() => addSubsection(mainSection.id)}>
            Add New {mainSection.name} Category
          </button>

          {mainSection.subsections.map(subsection => (
            <div key={subsection.id} className={styles.subsection}>
              <div className={styles.subsectionHeader}>
                <input
                  type="text"
                  value={subsection.name}
                  onChange={e =>
                    updateSubsectionName(mainSection.id, subsection.id, e.target.value)
                  }
                  className={styles.subsectionName}
                />
                <button
                  className={styles.removeButton}
                  onClick={() => removeSubsection(mainSection.id, subsection.id)}
                >
                  Remove Category
                </button>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subsection.rows.map(row => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="text"
                          value={row.description}
                          onChange={e =>
                            updateRow(
                              mainSection.id,
                              subsection.id,
                              row.id,
                              'description',
                              e.target.value
                            )
                          }
                          className={styles.input}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.amount}
                          onChange={e =>
                            updateRow(
                              mainSection.id,
                              subsection.id,
                              row.id,
                              'amount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={styles.input}
                        />
                      </td>
                      <td>
                        <button
                          className={styles.removeButton}
                          onClick={() => removeRow(mainSection.id, subsection.id, row.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>
                      <button
                        className={styles.addButton}
                        onClick={() => addRow(mainSection.id, subsection.id)}
                      >
                        Add Item
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>Category Total:</td>
                    <td colSpan={2}>${calculateSubsectionTotal(subsection).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}

          <div className={styles.mainSectionTotal}>
            <h3>
              {mainSection.name} Total: ${calculateMainSectionTotal(mainSection).toFixed(2)}
            </h3>
          </div>
        </div>
      ))}

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span>Total Income:</span>
          <span>${calculateIncomeTotal().toFixed(2)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span>Total Expenses:</span>
          <span>${calculateExpensesTotal().toFixed(2)}</span>
        </div>
        <div
          className={`${styles.summaryItem} ${calculateNetIncome() >= 0 ? styles.positive : styles.negative}`}
        >
          <span>Net Income:</span>
          <span>${calculateNetIncome().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
