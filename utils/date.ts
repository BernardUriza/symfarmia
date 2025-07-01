/**
 * Date utility functions
 * Pure functions for date formatting and manipulation
 */

import { format, parseISO, isValid, addDays, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export interface DateFormatOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short';
  day?: 'numeric' | '2-digit';
  separator?: string;
  locale?: string;
}

/**
 * Format a date with custom options
 * @param date - The date to format (Date object, ISO string, or timestamp)
 * @param options - Formatting options including year, month, day format and locale
 * @returns Formatted date string
 * @throws {Error} When date is invalid
 */
export function formatDate(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  const defaultOptions: Required<DateFormatOptions> = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    separator: '/',
    locale: 'es-MX',
    ...options,
  };

  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }

  // Get formatted date
  let formattedDate = dateObj.toLocaleDateString(defaultOptions.locale, {
    year: defaultOptions.year,
    month: defaultOptions.month,
    day: defaultOptions.day,
  });

  // Clean up Spanish formatting
  if (defaultOptions.locale === 'es-MX') {
    formattedDate = formattedDate.replace(/de /g, '').replace(/ del /g, ' de ');
  }

  // Apply custom separator and capitalization
  if (defaultOptions.month === 'long') {
    const dateComponents = formattedDate.split(' ');
    const capitalizedComponents = dateComponents.map((component, index) => {
      // Capitalize month (assuming it's in the second position)
      if (index === 1) {
        return capitalizeFirstLetter(component);
      }
      return component;
    });

    return capitalizedComponents.join(defaultOptions.separator === '/' ? ' ' : defaultOptions.separator);
  }

  return formattedDate;
}

/**
 * Format date using date-fns format function
 * @param date - The date to format
 * @param pattern - Date format pattern (e.g., 'dd/MM/yyyy')
 * @param locale - Locale to use for formatting (defaults to Spanish)
 * @returns Formatted date string
 * @throws {Error} When date is invalid
 */
export function formatDateWithPattern(
  date: Date | string | number,
  pattern: string,
  locale: Locale = es
): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }

  return format(dateObj, pattern, { locale });
}

/**
 * Capitalize first letter of a string
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format date for display in tables
 */
export function formatDateForTable(date: Date | string | number): string {
  return formatDateWithPattern(date, 'dd/MM/yyyy');
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDateWithPattern(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Format date for ISO string
 */
export function formatDateISO(date: Date | string | number): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }

  return dateObj.toISOString();
}

/**
 * Format date for input fields
 */
export function formatDateForInput(date: Date | string | number): string {
  return formatDateWithPattern(date, 'yyyy-MM-dd');
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string | number): string {
  return formatDateWithPattern(date, 'HH:mm');
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | number): boolean {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    return false;
  }

  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    return false;
  }

  return dateObj < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    return false;
  }

  return dateObj > new Date();
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string | number, days: number): Date {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }

  return addDays(dateObj, days);
}

/**
 * Subtract days from a date
 */
export function subtractDaysFromDate(date: Date | string | number, days: number): Date {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }

  return subDays(dateObj, days);
}

/**
 * Get the start of day for a date
 */
export function getStartOfDay(date: Date | string | number): Date {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }

  return startOfDay(dateObj);
}

/**
 * Get the end of day for a date
 */
export function getEndOfDay(date: Date | string | number): Date {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }

  return endOfDay(dateObj);
}

/**
 * Get the difference in days between two dates
 */
export function getDaysDifference(
  startDate: Date | string | number,
  endDate: Date | string | number
): number {
  let startDateObj: Date;
  let endDateObj: Date;
  
  if (typeof startDate === 'string') {
    startDateObj = parseISO(startDate);
  } else if (typeof startDate === 'number') {
    startDateObj = new Date(startDate);
  } else {
    startDateObj = startDate;
  }

  if (typeof endDate === 'string') {
    endDateObj = parseISO(endDate);
  } else if (typeof endDate === 'number') {
    endDateObj = new Date(endDate);
  } else {
    endDateObj = endDate;
  }

  if (!isValid(startDateObj) || !isValid(endDateObj)) {
    throw new Error('Invalid date provided');
  }

  return differenceInDays(endDateObj, startDateObj);
}

/**
 * Get relative time string (e.g., "hace 2 días", "en 3 días")
 */
export function getRelativeTime(date: Date | string | number): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }

  const now = new Date();
  const diffInDays = getDaysDifference(now, dateObj);

  if (diffInDays === 0) {
    return 'Hoy';
  } else if (diffInDays === 1) {
    return 'Mañana';
  } else if (diffInDays === -1) {
    return 'Ayer';
  } else if (diffInDays > 1) {
    return `En ${diffInDays} días`;
  } else {
    return `Hace ${Math.abs(diffInDays)} días`;
  }
}

/**
 * Validate if a string is a valid date
 */
export function isValidDate(dateString: string): boolean {
  const date = parseISO(dateString);
  return isValid(date);
}

/**
 * Get age from date of birth
 */
export function getAge(dateOfBirth: Date | string | number): number {
  let birthDate: Date;
  
  if (typeof dateOfBirth === 'string') {
    birthDate = parseISO(dateOfBirth);
  } else if (typeof dateOfBirth === 'number') {
    birthDate = new Date(dateOfBirth);
  } else {
    birthDate = dateOfBirth;
  }

  if (!isValid(birthDate)) {
    throw new Error('Invalid date of birth provided');
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Check if a date is within a range
 */
export function isDateInRange(
  date: Date | string | number,
  startDate: Date | string | number,
  endDate: Date | string | number
): boolean {
  let dateObj: Date;
  let startDateObj: Date;
  let endDateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (typeof startDate === 'string') {
    startDateObj = parseISO(startDate);
  } else if (typeof startDate === 'number') {
    startDateObj = new Date(startDate);
  } else {
    startDateObj = startDate;
  }

  if (typeof endDate === 'string') {
    endDateObj = parseISO(endDate);
  } else if (typeof endDate === 'number') {
    endDateObj = new Date(endDate);
  } else {
    endDateObj = endDate;
  }

  if (!isValid(dateObj) || !isValid(startDateObj) || !isValid(endDateObj)) {
    throw new Error('Invalid date provided');
  }

  return dateObj >= startDateObj && dateObj <= endDateObj;
}