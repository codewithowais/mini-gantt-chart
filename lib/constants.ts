export const STORAGE_KEY = 'gantt_poc_tasks_v1';

/** Allowed task categories; used for grouping in Gantt and overlap lanes. */
export const TASK_CATEGORIES = [
  'Frontend',
  'Backend',
  'DevOps',
  'Design',
  'Other',
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Number of days shown on the Gantt (one week). */
export const DAYS_RANGE = 7;

export const DAY_WIDTH = 24;

export const ROW_HEIGHT = 40;
