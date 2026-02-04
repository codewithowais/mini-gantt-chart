'use client';

import { taskDurationDays } from '@/lib/utils';
import type { Task } from '@/lib/types';

type TaskTableProps = {
  tasks: Task[];
  onSelectForEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (taskId: string, newIndex: number) => void;
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function TaskTable({
  tasks,
  onSelectForEdit,
  onDelete,
}: TaskTableProps) {
  const sorted = [...tasks].sort((a, b) => a.row - b.row);

  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="w-10 px-2 py-2 font-medium text-gray-700">
              <span className="sr-only">Drag handle</span>
            </th>
            <th className="px-3 py-2 font-medium text-gray-700">Name</th>
            <th className="px-3 py-2 font-medium text-gray-700">Start</th>
            <th className="px-3 py-2 font-medium text-gray-700">End</th>
            <th className="px-3 py-2 font-medium text-gray-700">Duration</th>
            <th className="px-3 py-2 font-medium text-gray-700">Status</th>
            <th className="px-3 py-2 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sorted.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="w-10 px-2 py-2 text-gray-400">
                <span aria-hidden>⋮⋮</span>
              </td>
              <td className="px-3 py-2">{task.name}</td>
              <td className="px-3 py-2">{formatDateTime(task.startAt)}</td>
              <td className="px-3 py-2">{formatDateTime(task.endAt)}</td>
              <td className="px-3 py-2">{taskDurationDays(task)}d</td>
              <td className="px-3 py-2 capitalize">{task.status}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onSelectForEdit(task)}
                  className="mr-2 text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
