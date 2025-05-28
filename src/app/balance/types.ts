import { BalanceSectionId } from './enums';

export type BalanceItem = {
  id: string;
  description: string;
  amount: number;
};

export type BalanceCategory = {
  id: string;
  name: string;
  type: BalanceSectionId;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  items: BalanceItem[];
};

export type BalanceMainSection = {
  id: BalanceSectionId;
  name: string;
  subsections: BalanceSubsection[];
};

export type BalanceSubsection = {
  id: string;
  name: string;
  items: BalanceItem[];
};
