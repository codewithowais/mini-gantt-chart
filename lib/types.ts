export type Task = {
  id: string;
  name: string;
  category: string; // e.g. Frontend, Backend; used for grouping and overlap lanes
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
  status: 'todo' | 'doing' | 'done';
  row: number; // row ordering (0..n-1)
};
