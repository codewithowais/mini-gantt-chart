export type Task = {
  id: string;
  name: string;
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
  status: 'todo' | 'doing' | 'done';
  row: number; // row ordering (0..n-1)
};
