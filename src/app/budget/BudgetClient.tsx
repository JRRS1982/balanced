'use client';

import { useState } from 'react';
import styles from './budget.module.css';
import { BudgetMainSection, BudgetSubsection } from './types';

// This is the client component that receives server data
export default function BudgetClient({
  initialSections,
}: {
  initialSections: BudgetMainSection[];
}) {
  const [mainSections, setMainSections] = useState<BudgetMainSection[]>(initialSections);

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

  const editSubsection = (mainSectionId: string, subsectionId: string, newName: string) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          return {
            ...mainSection,
            subsections: mainSection.subsections.map(subsection => {
              if (subsection.id === subsectionId) {
                return {
                  ...subsection,
                  name: newName,
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
                  rows: [
                    ...subsection.rows,
                    {
                      id: newRowId,
                      description: 'New Item',
                      amount: 0,
                    },
                  ],
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

  const editRow = (
    mainSectionId: string,
    subsectionId: string,
    rowId: string,
    field: 'description' | 'amount',
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
                      return {
                        ...row,
                        [field]: value,
                      };
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

  const calculateSubsectionTotal = (subsection: BudgetSubsection) => {
    return subsection.rows.reduce((total, row) => total + row.amount, 0);
  };

  const calculateMainSectionTotal = (mainSection: BudgetMainSection) => {
    return mainSection.subsections.reduce((total, subsection) => {
      return total + calculateSubsectionTotal(subsection);
    }, 0);
  };

  const calculateNetIncome = () => {
    const incomeSection = mainSections.find(section => section.id === 'income');
    const expenseSection = mainSections.find(section => section.id === 'expenses');

    const totalIncome = incomeSection ? calculateMainSectionTotal(incomeSection) : 0;
    const totalExpenses = expenseSection ? calculateMainSectionTotal(expenseSection) : 0;

    return totalIncome - totalExpenses;
  };

  return (
    <div className={styles.budgetContainer}>
      <h1 className={styles.title}>Budget</h1>

      {mainSections.map(mainSection => (
        <div key={mainSection.id} className={styles.mainSection}>
          <div className={styles.mainSectionHeader}>
            <h2>{mainSection.name}</h2>
            <div className={styles.mainSectionTotal}>
              ${calculateMainSectionTotal(mainSection).toFixed(2)}
            </div>
          </div>

          {mainSection.subsections.map(subsection => (
            <div key={subsection.id} className={styles.subsection}>
              <div className={styles.subsectionHeader}>
                <input
                  type="text"
                  value={subsection.name}
                  onChange={e => editSubsection(mainSection.id, subsection.id, e.target.value)}
                  className={styles.subsectionName}
                />
                <div className={styles.subsectionTotal}>
                  ${calculateSubsectionTotal(subsection).toFixed(2)}
                </div>
                <button
                  onClick={() => removeSubsection(mainSection.id, subsection.id)}
                  className={styles.removeButton}
                >
                  &times;
                </button>
              </div>

              <table className={styles.budgetTable}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th></th>
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
                            editRow(
                              mainSection.id,
                              subsection.id,
                              row.id,
                              'description',
                              e.target.value
                            )
                          }
                          className={styles.inputField}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.amount}
                          onChange={e =>
                            editRow(
                              mainSection.id,
                              subsection.id,
                              row.id,
                              'amount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={styles.inputField}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => removeRow(mainSection.id, subsection.id, row.id)}
                          className={styles.removeButton}
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3}>
                      <button
                        onClick={() => addRow(mainSection.id, subsection.id)}
                        className={styles.addButton}
                      >
                        + Add Item
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          <button onClick={() => addSubsection(mainSection.id)} className={styles.addButton}>
            + Add {mainSection.name} Category
          </button>
        </div>
      ))}

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <div className={styles.summaryLabel}>Net Income:</div>
          <div
            className={`${styles.summaryValue} ${
              calculateNetIncome() >= 0 ? styles.positive : styles.negative
            }`}
          >
            ${calculateNetIncome().toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
