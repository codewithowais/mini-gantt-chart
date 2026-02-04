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

  const inputClass =
    'transition-fast w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

  return (
    <form
      onSubmit={handleSubmit}
      className="transition-smooth rounded-lg border border-gray-200 bg-gray-50/80 p-5 shadow-sm hover:shadow-md"
      aria-labelledby="form-heading"
    >
      <h2
        id="form-heading"
        className="mb-4 text-lg font-semibold text-gray-900"
      >
        {task ? 'Edit task' : 'New task'}
      </h2>
      {error && (
        <p
          id="form-error"
          className="transition-fast mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="task-name" className={labelClass}>
            Name
          </label>
          <input
            id="task-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="task-start" className={labelClass}>
            Start
          </label>
          <input
            id="task-start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="task-end" className={labelClass}>
            End
          </label>
          <input
            id="task-end"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="task-status" className={labelClass}>
            Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as Task['status'])
            }
            className={inputClass}
            aria-describedby={error ? 'form-error' : undefined}
          >
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          className="transition-smooth rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:scale-[1.02] hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus-visible:ring-2 active:scale-[0.98]"
        >
          {task ? 'Update' : 'Create'}
        </button>
        {task && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="transition-smooth rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:scale-[1.02] hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus-visible:ring-2 active:scale-[0.98]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
