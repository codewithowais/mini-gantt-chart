'use client';

import { useEffect, useRef, useState } from 'react';
import GanttGrid from '@/components/GanttGrid';
import TaskForm from '@/components/TaskForm';
import TaskTable from '@/components/TaskTable';
import { generateDummyTasks } from '@/lib/dummy-data';
import { startOfTodayLocal } from '@/lib/utils';
import { loadTasks, normalizeRows, saveTasks } from '@/lib/storage';
import type { Task } from '@/lib/types';

export default function Home() {
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
      prev.map((t) =>
        t.id === editingId
          ? { ...t, ...payload }
          : t
      )
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
    <main className="min-h-screen p-8">
      <h1 className="mb-6 text-2xl font-semibold">Mini Gantt</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
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
        <div>
          <GanttGrid tasks={tasks} anchor={startOfTodayLocal()} />
        </div>
      </div>
    </main>
  );
}
