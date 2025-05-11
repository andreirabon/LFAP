/**
 * Format a date to a human-readable string using Asia/Manila timezone
 * @param date Date object or date string to format
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export function formatDate(date: Date | string): string {
  // Fix timezone issues by ensuring dates are interpreted in the Asia/Manila timezone
  const dateObj = date instanceof Date ? date : parseLocalDate(date);

  // Format the date using Philippines timezone
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(dateObj);
}

/**
 * Parse a date string into a Date object that preserves the date in Asia/Manila timezone
 * This prevents timezone shifts when converting strings like "2024-05-11" to Date objects
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();

  // If it's already a full ISO string with time, parse it with timezone consideration
  if (dateString.includes("T")) {
    // Create a date in the local timezone
    const date = new Date(dateString);

    // Convert to Manila time
    const manilaDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    return manilaDate;
  }

  // For date-only strings (YYYY-MM-DD), parse as Manila date
  const [year, month, day] = dateString.split(/\D/).map((part) => parseInt(part, 10));
  if (year && month && day) {
    // Create date with explicit timezone by using the offset for Manila (UTC+8)
    // Note: month is 0-indexed in JS Date
    const manilaDate = new Date(Date.UTC(year, month - 1, day));
    manilaDate.setUTCHours(manilaDate.getUTCHours() + 8); // Manila is UTC+8
    return manilaDate;
  }

  // Fallback to standard parsing but adjust for Manila timezone
  const date = new Date(dateString);
  const manilaDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  return manilaDate;
}

/**
 * Calculate the number of days between two dates (inclusive) in Asia/Manila timezone
 * @param startDate The start date
 * @param endDate The end date
 * @returns Number of days between startDate and endDate, inclusive
 */
export function calculateDays(startDate: Date, endDate: Date): number {
  // Ensure both dates are in Manila timezone
  const start = parseLocalDate(startDate.toString());
  const end = parseLocalDate(endDate.toString());

  // Set to midnight in Manila time to ensure accurate day calculation
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
}
