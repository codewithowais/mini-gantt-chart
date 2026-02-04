'use client';

import { useEffect, useState } from 'react';
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '@/lib/utils';
import type { Task } from '@/lib/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type TaskFormProps = {
  task: Task | null;
  onSubmit: (task: Omit<Task, 'id' | 'row'>) => void;
  onCancelEdit: () => void;
};

function defaultStartAt(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function defaultEndAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function TaskForm({
  task,
  onSubmit,
  onCancelEdit,
}: TaskFormProps) {
  const [name, setName] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setStartAt(toDatetimeLocalValue(task.startAt));
      setEndAt(toDatetimeLocalValue(task.endAt));
      setStatus(task.status);
    } else {
      setName('');
      setStartAt(toDatetimeLocalValue(defaultStartAt()));
      setEndAt(toDatetimeLocalValue(defaultEndAt()));
      setStatus('todo');
    }
    setError(null);
  }, [task]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const startIso = fromDatetimeLocalValue(startAt);
    const endIso = fromDatetimeLocalValue(endAt);
    const startMs = new Date(startIso).getTime();
    const endMs = new Date(endIso).getTime();
    if (endMs <= startMs) {
      setError('End must be after start.');
      return;
    }
    const days = Math.ceil((endMs - startMs) / MS_PER_DAY);
    if (days < 1) {
      setError('Minimum duration is 1 day.');
      return;
    }
    onSubmit({
      name: name.trim(),
      startAt: startIso,
      endAt: endIso,
      status,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded border border-gray-200 bg-gray-50 p-4 shadow-sm"
    >
      <h2 className="mb-3 text-lg font-medium">
        {task ? 'Edit task' : 'New task'}
      </h2>
      {error && (
        <p className="mb-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="space-y-3">
        <div>
          <label htmlFor="task-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="task-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="task-start" className="mb-1 block text-sm font-medium">
            Start
          </label>
          <input
            id="task-start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="task-end" className="mb-1 block text-sm font-medium">
            End
          </label>
          <input
            id="task-end"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="task-status" className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as Task['status'])
            }
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {task ? 'Update' : 'Create'}
        </button>
        {task && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
