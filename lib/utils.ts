import { MS_PER_DAY } from './constants';
import type { Task } from './types';

/**
 * Start of today in local timezone (00:00 local).
 */
export function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/** Monday 00:00 of the week containing the given date (ISO week). */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Add days to a Date, return new Date. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Clamp a number to [min, max].
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Add deltaDays to an ISO datetime string; returns new ISO string.
 */
export function addDaysISO(iso: string, deltaDays: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString();
}

/**
 * Convert ISO string to value for <input type="datetime-local"> (YYYY-MM-DDTHH:mm).
 */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

/**
 * Convert <input type="datetime-local"> value to ISO string.
 */
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

/**
 * Duration in days (ceil of diff / MS_PER_DAY), minimum 1.
 */
export function durationDays(startAt: string, endAt: string): number {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const days = Math.ceil((end - start) / MS_PER_DAY);
  return Math.max(1, days);
}

/**
 * Duration in days for a task (convenience).
 */
export function taskDurationDays(task: Task): number {
  return durationDays(task.startAt, task.endAt);
}

/** Short date for table display (e.g. "Feb 4"). Use en-US for consistent server/client. */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
