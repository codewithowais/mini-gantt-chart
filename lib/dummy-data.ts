import { DAYS_RANGE, MS_PER_DAY } from './constants';
import type { Task } from './types';
import { startOfTodayLocal } from './utils';

const DUMMY_NAMES = [
  'Research competitors',
  'Design wireframes',
  'Setup CI/CD',
  'Implement auth',
  'Write API docs',
  'Database migration',
  'Frontend dashboard',
  'Backend services',
  'Code review',
  'Bug fixes',
  'Performance tuning',
  'User testing',
  'Deploy staging',
  'Security audit',
  'Documentation',
  'Sprint planning',
  'Retrospective',
  'Onboarding',
  'Refactor module',
  'Add logging',
  'Fix accessibility',
  'Update dependencies',
  'Integration tests',
  'E2E tests',
  'Load testing',
  'Monitoring setup',
  'Backup strategy',
  'Data export',
  'Email templates',
  'Notification system',
  'Search feature',
  'Filter and sort',
  'Pagination',
  'Caching layer',
  'API versioning',
  'Error handling',
  'Validation',
  'Localization',
  'Dark mode',
  'Mobile responsive',
  'Analytics',
  'A/B testing',
  'Feedback form',
  'Support tickets',
  'Admin panel',
  'Reports',
  'Export PDF',
  'Import CSV',
  'Sync with API',
  'Offline support',
];

const STATUSES: Task['status'][] = ['todo', 'doing', 'done'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * Generate ~50 tasks with varied names, dates within 60-day window, random status, row 0..n-1.
 * Min duration 1 day, endAt > startAt.
 */
export function generateDummyTasks(): Task[] {
  const anchor = startOfTodayLocal().getTime();
  const dayMs = MS_PER_DAY;
  const count = 50;
  const usedNames = new Set<string>();
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    let name = pick(DUMMY_NAMES);
    let suffix = 0;
    while (usedNames.has(name)) {
      name = `${pick(DUMMY_NAMES)} ${++suffix}`;
    }
    usedNames.add(name);

    const startOffsetDays = randomInt(0, DAYS_RANGE - 2);
    const durationDays = randomInt(1, Math.min(14, DAYS_RANGE - startOffsetDays - 1));
    const startAt = new Date(anchor + startOffsetDays * dayMs).toISOString();
    const endAt = new Date(
      anchor + (startOffsetDays + durationDays) * dayMs
    ).toISOString();

    tasks.push({
      id: crypto.randomUUID(),
      name,
      startAt,
      endAt,
      status: pick(STATUSES),
      row: i,
    });
  }

  return tasks;
}
