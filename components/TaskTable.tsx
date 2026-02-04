'use client';

import { ROW_HEIGHT } from '@/lib/constants';
import type { Task } from '@/lib/types';

type TaskTableProps = {
  tasks: Task[];
  onSelectForEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (taskId: string, newIndex: number) => void;
};

/** Same status colors as GanttGrid bars */
const STATUS_ROW_ACCENT: Record<Task['status'], string> = {
  todo: 'bg-amber-200 border-amber-400',
  doing: 'bg-blue-200 border-blue-400',
  done: 'bg-emerald-200 border-emerald-400',
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
    <div className="transition-smooth w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md">
      {/* Header row: matches Gantt header height */}
      <div
        className="flex items-center border-b border-gray-200 bg-gray-100 px-3 text-xs font-medium text-gray-600"
        style={{ height: ROW_HEIGHT }}
      >
        <span className="w-8 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">Task</span>
        <span className="shrink-0">Actions</span>
      </div>
      {/* Rows: same height and order as Gantt */}
      {sorted.map((task) => (
        <div
          key={task.id}
          className="transition-fast flex items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60"
          style={{ height: ROW_HEIGHT }}
        >
          <span
            className="w-8 shrink-0 cursor-grab text-gray-400"
            aria-hidden
            title="Drag to reorder"
          >
            ⋮⋮
          </span>
          <div
            className={`transition-smooth my-1 mr-2 min-h-[20px] min-w-0 flex-1 rounded-md border px-2 py-1 text-sm hover:shadow-sm ${STATUS_ROW_ACCENT[task.status]}`}
          >
            <span className="truncate font-medium text-gray-900">
              {task.name}
            </span>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onSelectForEdit(task)}
              className="transition-fast rounded px-2 py-1 text-xs font-medium text-blue-600 hover:scale-105 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDeleteClick(task.id, task.name)}
              className="transition-fast rounded px-2 py-1 text-xs font-medium text-red-600 hover:scale-105 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 active:scale-95"
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
