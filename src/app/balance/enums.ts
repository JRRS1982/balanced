export const BalanceSectionId = {
  ASSETS: 'assets',
  LIABILITIES: 'liabilities',
};

export type BalanceSectionId = (typeof BalanceSectionId)[keyof typeof BalanceSectionId];
