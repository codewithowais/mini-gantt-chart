import { DAYS_RANGE, MS_PER_DAY, TASK_CATEGORIES } from './constants';
import type { Task } from './types';
import { startOfTodayLocal } from './utils';

/** Realistic task names for current-week dummy data (max 10 tasks). */
const DUMMY_NAMES = [
  'Sprint planning',
  'Design API spec',
  'Implement login',
  'Code review',
  'Fix critical bug',
  'Deploy to staging',
  'Write tests',
  'Update docs',
  'Sync with design',
  'Retrospective',
];

const STATUSES: Task['status'][] = ['todo', 'doing', 'done'];

/** Current week = next 7 days from today (inclusive). */
const CURRENT_WEEK_DAYS = 7;
const MAX_DUMMY_TASKS = 10;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function pickCategory(): string {
  return TASK_CATEGORIES[Math.floor(Math.random() * TASK_CATEGORIES.length)];
}

/**
 * Generate up to 10 tasks for the current week only.
 * Real dates: start/end within [today, today + 6 days]. Realistic names and categories.
 */
export function generateDummyTasks(): Task[] {
  const anchor = startOfTodayLocal();
  const anchorMs = anchor.getTime();
  const dayMs = MS_PER_DAY;
  const tasks: Task[] = [];
  const usedNames = new Set<string>();

  const count = Math.min(MAX_DUMMY_TASKS, DUMMY_NAMES.length);

  for (let i = 0; i < count; i++) {
    let name = DUMMY_NAMES[i];
    if (usedNames.has(name)) name = `${DUMMY_NAMES[i]} (${i})`;
    usedNames.add(name);

    // Start within current week: day 0..(CURRENT_WEEK_DAYS - 2) so we have room for at least 1 day duration
    const startOffsetDays = randomInt(0, Math.max(0, CURRENT_WEEK_DAYS - 2));
    const maxDuration = Math.min(3, CURRENT_WEEK_DAYS - startOffsetDays - 1);
    const durationDays = randomInt(1, Math.max(1, maxDuration));

    const startAt = new Date(anchorMs + startOffsetDays * dayMs);
    startAt.setHours(9, 0, 0, 0);
    const endAt = new Date(anchorMs + (startOffsetDays + durationDays) * dayMs);
    endAt.setHours(17, 0, 0, 0);

    tasks.push({
      id: crypto.randomUUID(),
      name,
      category: pickCategory(),
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      status: pick(STATUSES),
      row: i,
    });
  }

  return tasks;
}
