import { getBudget } from '../../server/actions/getBudget';
import BudgetClient from './BudgetClient';
import { sampleBudgetSections } from './mockData';

export default async function BudgetPage() {
  // For development, use a fixed user ID until authentication is implemented
  const userId = 'user-1';
  let sections = sampleBudgetSections;

  // Skip database operations during build time or when explicitly requested
  try {
    const budgetData = await getBudget(userId);
    if (budgetData.sections.length > 0) {
      sections = budgetData.sections;
    }
  } catch (error) {
    console.error('Error fetching budget data:', error);
    console.log('Using sample data as fallback');
  }

  // Pass the budget data to the client component
  return <BudgetClient initialSections={sections} />;
}
