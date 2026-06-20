import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format date to Indonesian locale
 */
export const formatDate = (date: string | Date, pattern: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: id });
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd MMM yyyy HH:mm:ss');
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm:ss');
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: id });
};

/**
 * Format date relative to now (e.g., "today at 3:00 PM")
 */
export const formatRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatRelative(dateObj, new Date(), { locale: id });
};

/**
 * Get current timestamp
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Get today's date at midnight
 */
export const getTodayStart = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get today's date at end of day
 */
export const getTodayEnd = (): Date => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};
