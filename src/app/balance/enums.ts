export const BalanceSectionId = {
  ASSETS: 'assets' as const,
  LIABILITIES: 'liabilities' as const,
} as const;

export type BalanceSectionId = (typeof BalanceSectionId)[keyof typeof BalanceSectionId];
