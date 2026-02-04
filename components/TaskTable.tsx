'use client';

import { ROW_HEIGHT } from '@/lib/constants';
import type { Task } from '@/lib/types';
import { theme, getCategoryColor } from '@/lib/theme';
import { formatShortDate, taskDurationDays } from '@/lib/utils';

type TaskTableProps = {
  tasks: Task[];
  onSelectForEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (taskId: string, newIndex: number) => void;
};

export default function TaskTable({
  tasks,
  onSelectForEdit,
  onDelete,
}: TaskTableProps) {
  const sorted = [...tasks].sort((a, b) => a.row - b.row);

  function handleDeleteClick(id: string, name: string) {
    if (window.confirm(`Delete "${name}"?`)) {
      onDelete(id);
    }
  }

  return (
    <div className={`transition-smooth w-full overflow-x-auto overflow-y-hidden ${theme.cardSm}`}>
      {/* Header: Drag handle, Name, Category, Start, End, Duration, Status, Actions */}
      <div
        className={`grid grid-cols-[32px_1fr_80px_72px_72px_48px_70px_auto] items-center gap-2 px-3 ${theme.tableHeaderSm}`}
        style={{ height: ROW_HEIGHT }}
      >
        <span className="shrink-0" aria-hidden />
        <span className="min-w-0 truncate">Name</span>
        <span className="shrink-0 truncate">Category</span>
        <span className="shrink-0">Start</span>
        <span className="shrink-0">End</span>
        <span className="shrink-0 text-right">Dur</span>
        <span className="shrink-0">Status</span>
        <span className="shrink-0">Actions</span>
      </div>
      {sorted.map((task) => (
        <div
          key={task.id}
          className={`grid grid-cols-[32px_1fr_80px_72px_72px_48px_70px_auto] items-center gap-2 px-3 ${theme.tableRow}`}
          style={{ height: ROW_HEIGHT }}
        >
          <span
            className={`w-8 ${theme.dragHandle}`}
            aria-hidden
            title="Drag to reorder"
          >
            ⋮⋮
          </span>
          <div
            className={`transition-smooth my-1 min-h-[20px] min-w-0 rounded-md border px-2 py-1 ${theme.statusBadge} ${getCategoryColor(task.category)}`}
          >
            <span className={`truncate ${theme.taskName}`}>{task.name}</span>
          </div>
          <span className="truncate text-sm text-brand-ink-muted" title={task.category}>
            {task.category}
          </span>
          <span className="truncate text-xs text-brand-ink-muted" title={task.startAt}>
            {formatShortDate(task.startAt)}
          </span>
          <span className="truncate text-xs text-brand-ink-muted" title={task.endAt}>
            {formatShortDate(task.endAt)}
          </span>
          <span className="text-right text-xs text-brand-ink-muted">
            {taskDurationDays(task)}d
          </span>
          <span className="truncate capitalize text-xs text-brand-ink">{task.status}</span>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onSelectForEdit(task)}
              className={theme.btnEdit}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDeleteClick(task.id, task.name)}
              className={theme.btnDanger}
              aria-label={`Delete ${task.name}`}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
