'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GanttGrid from '@/components/GanttGrid';
import Modal from '@/components/Modal';
import TaskForm from '@/components/TaskForm';
import { generateDummyTasks } from '@/lib/dummy-data';
import { startOfTodayLocal, startOfWeek, addDays } from '@/lib/utils';
import { loadTasks, saveTasks } from '@/lib/storage';
import type { Task } from '@/lib/types';
import { theme } from '@/lib/theme';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewWeekStart, setViewWeekStart] = useState<Date>(() =>
    startOfWeek(startOfTodayLocal())
  );
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

  const handleTaskChange = useCallback(
    (taskId: string, updates: { startAt?: string; endAt?: string }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
    },
    []
  );

  function handleCreate(payload: Omit<Task, 'id' | 'row'>) {
    const next: Task = {
      ...payload,
      id: crypto.randomUUID(),
      row: tasks.length,
    };
    setTasks((prev) => [...prev, next]);
    setIsAddModalOpen(false);
  }

  const weekEnd = addDays(viewWeekStart, 6);
  const isCurrentWeek =
    viewWeekStart.getTime() === startOfWeek(startOfTodayLocal()).getTime();

  return (
    <main className="min-h-screen w-full max-w-[100vw] overflow-x-hidden p-4 sm:p-5 md:p-6 lg:p-8 box-border">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className={theme.pageTitle}>
            Mini Gantt
          </h1>
          <p className={`mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium text-brand-ink-muted ${theme.pageSubtitle}`}>
            Week view. Drag bars to move, resize from the right edge.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-xl border border-brand-border bg-brand-white px-1.5 sm:px-2 py-1 shadow-card">
            <button
              type="button"
              onClick={() => setViewWeekStart((d) => addDays(d, -7))}
              className="rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-brand-ink-muted hover:bg-brand-background-hover focus:outline-none focus:ring-2 focus:ring-brand-accent/30 touch-manipulation"
              aria-label="Previous week"
            >
              ← Prev
            </button>
            <span className="min-w-[100px] sm:min-w-[140px] px-1.5 sm:px-2 text-center text-xs sm:text-sm font-medium text-brand-ink truncate">
              {viewWeekStart.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              {' – '}
              {weekEnd.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <button
              type="button"
              onClick={() => setViewWeekStart((d) => addDays(d, 7))}
              className="rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-brand-ink-muted hover:bg-brand-background-hover focus:outline-none focus:ring-2 focus:ring-brand-accent/30 touch-manipulation"
              aria-label="Next week"
            >
              Next →
            </button>
          </div>
          {!isCurrentWeek && (
            <button
              type="button"
              onClick={() =>
                setViewWeekStart(startOfWeek(startOfTodayLocal()))
              }
              className="rounded-xl border border-brand-border bg-brand-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-brand-ink-muted hover:bg-brand-background-hover focus:outline-none focus:ring-2 focus:ring-brand-accent/30 touch-manipulation"
            >
              This week
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className={`${theme.btnPrimary} touch-manipulation px-4 sm:px-5 py-2.5 text-sm`}
          >
            <span aria-hidden>+</span>
            Add task
          </button>
        </div>
      </header>

      <section className="min-w-0 w-full max-w-full transition-smooth" aria-label="Gantt chart">
        <GanttGrid
          tasks={tasks}
          anchor={viewWeekStart}
          onTaskChange={handleTaskChange}
        />
      </section>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add task"
      >
        <TaskForm
          task={null}
          onSubmit={handleCreate}
          onCancelEdit={() => setIsAddModalOpen(false)}
          hideTitle
        />
      </Modal>
    </main>
  );
}
