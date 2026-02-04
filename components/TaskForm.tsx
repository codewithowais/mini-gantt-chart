'use client';

import { useEffect, useState } from 'react';
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '@/lib/utils';
import type { Task } from '@/lib/types';
import { TASK_CATEGORIES } from '@/lib/constants';
import { theme } from '@/lib/theme';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type TaskFormProps = {
  task: Task | null;
  onSubmit: (task: Omit<Task, 'id' | 'row'>) => void;
  onCancelEdit: () => void;
  /** When true, hide the form heading (e.g. when used inside a modal). */
  hideTitle?: boolean;
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
  hideTitle = false,
}: TaskFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setCategory(task.category ?? TASK_CATEGORIES[0]);
      setStartAt(toDatetimeLocalValue(task.startAt));
      setEndAt(toDatetimeLocalValue(task.endAt));
      setStatus(task.status);
    } else {
      setName('');
      setCategory(TASK_CATEGORIES[0]);
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
      category: category.trim() || TASK_CATEGORIES[0],
      startAt: startIso,
      endAt: endIso,
      status,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={hideTitle ? 'p-0' : `transition-smooth p-6 ${theme.formSection}`}
      aria-labelledby={hideTitle ? undefined : 'form-heading'}
    >
      {!hideTitle && (
        <h2
          id="form-heading"
          className={`mb-4 ${theme.modalTitle}`}
        >
          {task ? 'Edit task' : 'New task'}
        </h2>
      )}
      {error && (
        <p
          id="form-error"
          className={`transition-fast mb-4 ${theme.errorAlert}`}
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="task-name" className={theme.label}>
            Name
          </label>
          <input
            id="task-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={theme.input}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="task-category" className={theme.label}>
            Category
          </label>
          <select
            id="task-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={theme.input}
          >
            {TASK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-start" className={theme.label}>
            Start
          </label>
          <input
            id="task-start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className={theme.input}
            required
          />
        </div>
        <div>
          <label htmlFor="task-end" className={theme.label}>
            End
          </label>
          <input
            id="task-end"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className={theme.input}
            required
          />
        </div>
        <div>
          <label htmlFor="task-status" className={theme.label}>
            Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as Task['status'])
            }
            className={theme.input}
            aria-describedby={error ? 'form-error' : undefined}
          >
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className={theme.btnPrimary}>
          {task ? 'Update' : 'Create'}
        </button>
        {task && (
          <button
            type="button"
            onClick={onCancelEdit}
            className={theme.btnSecondary}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
