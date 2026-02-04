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

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** Random time offset within a day in ms (e.g. 6am–4pm). */
function randomTimeOfDay(): number {
  const hours = randomInt(6, 16);
  const minutes = randomInt(0, 59);
  return hours * MS_PER_HOUR + minutes * MS_PER_MINUTE;
}

/** Max task duration in days so tasks spread across the sprint instead of clustering at the end. */
const MAX_DURATION_DAYS = 5;

/**
 * Generate ~50 tasks with varied names, dates and times within sprint window (DAYS_RANGE), random status, row 0..n-1.
 * Min duration 1 day, endAt > startAt. Tasks are spread across columns (capped duration) for a balanced look.
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
    const maxDuration = Math.min(
      MAX_DURATION_DAYS,
      DAYS_RANGE - startOffsetDays - 1
    );
    const durationDays = randomInt(1, Math.max(1, maxDuration));
    const startTimeOfDay = randomTimeOfDay();
    const endTimeOfDay = randomTimeOfDay();

    const startAt = new Date(
      anchor + startOffsetDays * dayMs + startTimeOfDay
    ).toISOString();
    const endAt = new Date(
      anchor +
        (startOffsetDays + durationDays) * dayMs +
        endTimeOfDay
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
