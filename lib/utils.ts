import { MS_PER_DAY } from './constants';
import type { Task } from './types';

/**
 * Start of today in local timezone (00:00 local).
 */
export function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
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
