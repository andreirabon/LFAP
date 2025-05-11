/**
 * Format a date to a human-readable string
 * @param date Date object or date string to format
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate the number of days between two dates (inclusive)
 * @param startDate The start date
 * @param endDate The end date
 * @returns Number of days between startDate and endDate, inclusive
 */
export function calculateDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
}
