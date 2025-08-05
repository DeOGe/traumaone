import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from 'moment';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string to a human-readable format.
 * @param dateString - The date string to format.
 * @returns Formatted date string (e.g., "MM/DD/YYYY").
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  return moment(dateString).format('MM/DD/YYYY');
}

/**
 * Formats a time string to a human-readable format.
 * @param timeString - The time string to format.
 * @returns Formatted time string (e.g., "hh:mm A").
 */
export function formatTime(timeString: string): string {
  if (!timeString) return '-';
  return moment(timeString, 'HH:mm:ss').format('hh:mm A');
}

/**
 * Calculates the age in years from a birthdate string.
 * @param birthdateString - The birthdate string.
 * @returns The age in years.
 */
export function getAge(birthdateString: string): number {
  if (!birthdateString) return 0;
  return moment().diff(moment(birthdateString), 'years');
}