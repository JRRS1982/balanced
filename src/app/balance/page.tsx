import { getBalance } from '../../server/actions/getBalance';
import BalanceClient from './BalanceClient';
import { sampleBalanceSections } from './mockData';

export default async function BalancePage() {
  // For development, use a fixed user ID until authentication is implemented
  const userId = 'user-1';
  let sections = sampleBalanceSections;

  // Skip database operations during build time or when explicitly requested
  try {
    const balanceData = await getBalance(userId);
    if (balanceData.sections.length > 0) {
      sections = balanceData.sections;
    }
  } catch (error) {
    console.error('Error fetching balance sheet data:', error);
    console.log('Using sample data as fallback');
  }

  // Pass the balance sheet data to the client component
  return <BalanceClient initialSections={sections} />;
}
