// Date-related helper functions

/**
 * Checks if a date string represents a date in the current month and year
 */
export const isCurrentMonth = (dateString: string): boolean => {
  // First ensure the date is valid
  if (!dateString) return false;

  try {
    const date = new Date(dateString);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(date.getTime())) return false;

    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  } catch (e) {
    console.error(`Invalid date: ${dateString}, error: ${e.message}`);
    return false;
  }
};

/**
 * Formats a date string or Date object to ISO format YYYY-MM-DD
 */
export const formatDateToISOString = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
    return dateObj.toISOString().split('T')[0];
  } catch (e) {
    console.error(`Error formatting date: ${date}, error: ${e.message}`);
    return '';
  }
};

// Currency-related helper functions

/**
 * Formats a number as a currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Calculation helper functions

/**
 * Calculate budget total by type
 */
export const calculateBudgetTotal = (
  budgetData: Array<{ budgeted: number; type: string }>,
  type: string
): number => {
  return budgetData
    .filter(item => item.type === type)
    .reduce((total, item) => total + item.budgeted, 0);
};

/**
 * Standardizes a date for comparison
 */
export const standardizeDateFormat = (dateString: string): string => {
  try {
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
    return dateString; // Return original if parsing fails
  } catch (e) {
    console.error(`Error parsing transaction date: ${dateString}, error: ${e.message}`);
    return dateString; // Return original if error occurs
  }
};
