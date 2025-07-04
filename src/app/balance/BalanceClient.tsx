'use client';

import { useState } from 'react';
import styles from './balance.module.css';
import {
  BalanceMainSection,
  BalanceSubsection,
  AddSubsectionParams,
  EditSubsectionParams,
  RemoveSubsectionParams,
  AddItemParams,
  EditItemParams,
  RemoveItemParams,
} from './types';
import { BalanceSectionId } from './enums';

// This is the client component that receives server data
export default function BalanceClient({
  initialSections,
}: {
  initialSections: BalanceMainSection[];
}) {
  const [mainSections, setMainSections] = useState<BalanceMainSection[]>(initialSections);

  const addSubsection = ({ mainSectionId }: AddSubsectionParams) => {
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
                items: [],
              },
            ],
          };
        }
        return mainSection;
      })
    );
  };

  const editSubsection = ({ mainSectionId, subsectionId, newName }: EditSubsectionParams) => {
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

  const removeSubsection = ({ mainSectionId, subsectionId }: RemoveSubsectionParams) => {
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

  const addItem = ({ mainSectionId, subsectionId }: AddItemParams) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          return {
            ...mainSection,
            subsections: mainSection.subsections.map(subsection => {
              if (subsection.id === subsectionId) {
                const newItemId = `${subsectionId}-${subsection.items.length + 1}`;
                return {
                  ...subsection,
                  items: [
                    ...subsection.items,
                    {
                      id: newItemId,
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

  const editItem = ({ mainSectionId, subsectionId, itemId, field, value }: EditItemParams) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          return {
            ...mainSection,
            subsections: mainSection.subsections.map(subsection => {
              if (subsection.id === subsectionId) {
                return {
                  ...subsection,
                  items: subsection.items.map(item => {
                    if (item.id === itemId) {
                      return {
                        ...item,
                        [field]: value,
                      };
                    }
                    return item;
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

  const removeItem = ({ mainSectionId, subsectionId, itemId }: RemoveItemParams) => {
    setMainSections(
      mainSections.map(mainSection => {
        if (mainSection.id === mainSectionId) {
          return {
            ...mainSection,
            subsections: mainSection.subsections.map(subsection => {
              if (subsection.id === subsectionId) {
                return {
                  ...subsection,
                  items: subsection.items.filter(item => item.id !== itemId),
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

  const calculateSubsectionTotal = (subsection: BalanceSubsection) => {
    return subsection.items.reduce((total, item) => total + item.amount, 0);
  };

  const calculateMainSectionTotal = (mainSection: BalanceMainSection) => {
    return mainSection.subsections.reduce((total, subsection) => {
      return total + calculateSubsectionTotal(subsection);
    }, 0);
  };

  const calculateNetWorth = ({ mainSections }: { mainSections: BalanceMainSection[] }) => {
    const assetsSection = mainSections.find(section => section.id === BalanceSectionId.ASSETS);
    const liabilitiesSection = mainSections.find(
      section => section.id === BalanceSectionId.LIABILITIES
    );

    const totalAssets = assetsSection ? calculateMainSectionTotal(assetsSection) : 0;
    const totalLiabilities = liabilitiesSection ? calculateMainSectionTotal(liabilitiesSection) : 0;

    return totalAssets - totalLiabilities;
  };

  return (
    <div className={styles.balanceSheet}>
      <h1 className={styles.balanceSheet__title}>Balance</h1>

      {mainSections.map(mainSection => (
        <div key={mainSection.id} className={styles.balanceSheet__mainSection}>
          <div className={styles.balanceSheet__mainSectionHeader}>
            <h2>{mainSection.name}</h2>
            <div className={styles.balanceSheet__mainSectionTotal}>
              ${calculateMainSectionTotal(mainSection).toFixed(2)}
            </div>
          </div>

          {mainSection.subsections.map(subsection => (
            <div key={subsection.id} className={styles.subsection}>
              <div className={styles.subsectionHeader}>
                <input
                  type="text"
                  value={subsection.name}
                  onChange={e =>
                    editSubsection({
                      mainSectionId: mainSection.id,
                      subsectionId: subsection.id,
                      newName: e.target.value,
                    })
                  }
                />
                <div className={styles.balanceSheet__controls}>
                  <button
                    className={`${styles.button} ${styles.dangerButton}`}
                    onClick={() =>
                      removeSubsection({
                        mainSectionId: mainSection.id,
                        subsectionId: subsection.id,
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>

              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th style={{ width: '60%' }}>Description</th>
                    <th style={{ width: '30%' }}>Amount ($)</th>
                    <th style={{ width: '10%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subsection.items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e =>
                            editItem({
                              mainSectionId: mainSection.id,
                              subsectionId: subsection.id,
                              itemId: item.id,
                              field: 'description',
                              value: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={e =>
                            editItem({
                              mainSectionId: mainSection.id,
                              subsectionId: subsection.id,
                              itemId: item.id,
                              field: 'amount',
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                      <td>
                        <button
                          className={`${styles.button} ${styles.dangerButton}`}
                          onClick={() =>
                            removeItem({
                              mainSectionId: mainSection.id,
                              subsectionId: subsection.id,
                              itemId: item.id,
                            })
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className={styles.subsectionTotal} colSpan={2}>
                      Total: ${calculateSubsectionTotal(subsection).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              <button
                className={styles.addRowButton}
                onClick={() =>
                  addItem({ mainSectionId: mainSection.id, subsectionId: subsection.id })
                }
              >
                + Add Item
              </button>
            </div>
          ))}

          <button
            className={styles.addSectionButton}
            onClick={() => addSubsection({ mainSectionId: mainSection.id })}
          >
            + Add {mainSection.name === 'Assets' ? 'Asset' : 'Liability'} Category
          </button>
        </div>
      ))}

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <div>Total Assets:</div>
          <div>
            $
            {calculateMainSectionTotal(
              mainSections.find(s => s.id === 'assets') || {
                id: 'assets',
                name: 'Assets',
                subsections: [],
              }
            ).toFixed(2)}
          </div>
        </div>
        <div className={styles.summaryRow}>
          <div>Total Liabilities:</div>
          <div>
            $
            {calculateMainSectionTotal(
              mainSections.find(s => s.id === 'liabilities') || {
                id: 'liabilities',
                name: 'Liabilities',
                subsections: [],
              }
            ).toFixed(2)}
          </div>
        </div>
        <div className={styles.summaryRow}>
          <div>Net Worth:</div>
          <div
            className={calculateNetWorth({ mainSections }) >= 0 ? styles.positive : styles.negative}
          >
            ${calculateNetWorth({ mainSections }).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
