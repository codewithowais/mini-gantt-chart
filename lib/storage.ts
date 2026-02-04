import { STORAGE_KEY, TASK_CATEGORIES } from './constants';
import type { Task } from './types';

const DEFAULT_CATEGORY = TASK_CATEGORIES[0];

function ensureCategory(t: { category?: unknown }): string {
  if (typeof t.category === 'string' && t.category.trim() !== '')
    return t.category.trim();
  return DEFAULT_CATEGORY;
}

/**
 * Parse JSON from localStorage; on null or invalid data return [].
 * Legacy tasks without category get DEFAULT_CATEGORY.
 */
export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const tasks = parsed
      .filter(
        (t): t is Task & { category?: string } =>
          t &&
          typeof t === 'object' &&
          typeof t.id === 'string' &&
          typeof t.name === 'string' &&
          typeof t.startAt === 'string' &&
          typeof t.endAt === 'string' &&
          (t.status === 'todo' || t.status === 'doing' || t.status === 'done') &&
          typeof t.row === 'number'
      )
      .map((t) => ({ ...t, category: ensureCategory(t) }));
    return normalizeRows(tasks as Task[]);
  } catch {
    return [];
  }
}

/**
 * Sort by row, normalize rows, save to localStorage.
 */
export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizeRows([...tasks].sort((a, b) => a.row - b.row));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

/**
 * Return new array with row set to index 0..n-1.
 */
export function normalizeRows(tasks: Task[]): Task[] {
  return tasks.map((t, i) => ({ ...t, row: i }));
}
