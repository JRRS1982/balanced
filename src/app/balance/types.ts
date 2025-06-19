import { BalanceSectionId } from './enums';

export type AddSubsectionParams = {
  mainSectionId: BalanceSectionId;
};

export type EditSubsectionParams = {
  mainSectionId: BalanceSectionId;
  subsectionId: string;
  newName: string;
};

export type RemoveSubsectionParams = {
  mainSectionId: BalanceSectionId;
  subsectionId: string;
};

export type AddItemParams = {
  mainSectionId: BalanceSectionId;
  subsectionId: string;
};

export type EditItemField = 'description' | 'amount';

export type EditItemParams = {
  mainSectionId: BalanceSectionId;
  subsectionId: string;
  itemId: string;
  field: EditItemField;
  value: string | number;
};

export type RemoveItemParams = {
  mainSectionId: BalanceSectionId;
  subsectionId: string;
  itemId: string;
};

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
