/**
 * Utility functions for handling date format conversions
 * between the database format (DD/MM/YY) and standard date operations.
 */

/**
 * Converts a date string from DD/MM/YY format to a Date object.
 * Assumes YY years 00-30 are 2000-2030, and 31-99 are 1931-1999.
 * @param dateString - Date in DD/MM/YY format (e.g., "27/02/26")
 * @returns Date object or null if invalid
 */
export function parseDDMMYY(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
        return null;
    }

    const parts = dateString.trim().split('/');
    if (parts.length !== 3) {
        return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Validate basic ranges
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return null;
    }

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 0 || year > 99) {
        return null;
    }

    // Convert 2-digit year to 4-digit year
    // Assume 00-30 = 2000-2030, 31-99 = 1931-1999
    const fullYear = year <= 30 ? 2000 + year : 1900 + year;

    // Create date object (month is 0-indexed in JavaScript)
    const date = new Date(fullYear, month - 1, day);

    // Validate that the date is actually valid (handles things like Feb 30)
    if (date.getFullYear() !== fullYear || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
        return null;
    }

    return date;
}

/**
 * Converts a Date object to DD/MM/YY format string.
 * @param date - Date object to convert
 * @returns Date string in DD/MM/YY format
 */
export function formatToDDMMYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = (date.getFullYear() % 100).toString().padStart(2, '0');
    
    return `${day}/${month}/${year}`;
}

/**
 * Gets today's date in DD/MM/YY format for database comparison.
 * @returns Today's date in DD/MM/YY format
 */
export function getTodayInDDMMYY(): string {
    return formatToDDMMYY(new Date());
}

/**
 * Checks if a date string in DD/MM/YY format represents today's date.
 * @param dateString - Date in DD/MM/YY format
 * @returns True if the date is today
 */
export function isToday(dateString: string): boolean {
    const inputDate = parseDDMMYY(dateString);
    if (!inputDate) {
        return false;
    }
    
    const today = new Date();
    return inputDate.getFullYear() === today.getFullYear() &&
           inputDate.getMonth() === today.getMonth() &&
           inputDate.getDate() === today.getDate();
}

/**
 * Converts a DD/MM/YY date string to YYYY-MM-DD format for consistency.
 * @param dateString - Date in DD/MM/YY format
 * @returns Date in YYYY-MM-DD format or null if invalid
 */
export function convertToISO(dateString: string): string | null {
    const date = parseDDMMYY(dateString);
    if (!date) {
        return null;
    }
    
    return date.toISOString().split('T')[0];
} 