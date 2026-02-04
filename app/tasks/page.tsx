'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import TaskForm from '@/components/TaskForm';
import TaskTable from '@/components/TaskTable';
import { generateDummyTasks } from '@/lib/dummy-data';
import { loadTasks, normalizeRows, saveTasks } from '@/lib/storage';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const loaded = loadTasks();
    if (loaded.length === 0) {
      const seeded = generateDummyTasks();
      saveTasks(seeded);
      setTasks(seeded);
    } else {
      setTasks(loaded);
    }
    initialLoadDone.current = true;
  }, []);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    saveTasks(tasks);
  }, [tasks]);

  const editingTask = editingId
    ? tasks.find((t) => t.id === editingId) ?? null
    : null;

  function handleCreate(payload: Omit<Task, 'id' | 'row'>) {
    const next: Task = {
      ...payload,
      id: crypto.randomUUID(),
      row: tasks.length,
    };
    setTasks((prev) => [...prev, next]);
  }

  function handleUpdate(payload: Omit<Task, 'id' | 'row'>) {
    if (!editingId) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t))
    );
    setEditingId(null);
  }

  function handleSubmit(payload: Omit<Task, 'id' | 'row'>) {
    if (editingId) handleUpdate(payload);
    else handleCreate(payload);
  }

  function handleDelete(id: string) {
    setTasks((prev) => normalizeRows(prev.filter((t) => t.id !== id)));
    if (editingId === id) setEditingId(null);
  }

  function handleSelectForEdit(task: Task) {
    setEditingId(task.id);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  function handleReorder(taskId: string, newIndex: number) {
    setTasks((prev) => {
      const sorted = [...prev].sort((a, b) => a.row - b.row);
      const fromIndex = sorted.findIndex((t) => t.id === taskId);
      if (fromIndex === -1 || fromIndex === newIndex) return prev;
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(newIndex, 0, moved);
      return normalizeRows(sorted);
    });
  }

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit, and reorder tasks. Changes sync to the Gantt chart.
          </p>
        </div>
        <Link
          href="/"
          className="transition-smooth rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:scale-[1.02] hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-[0.98]"
        >
          View Gantt chart
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onCancelEdit={handleCancelEdit}
        />
        <TaskTable
          tasks={tasks}
          onSelectForEdit={handleSelectForEdit}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
      </div>
    </main>
  );
}
