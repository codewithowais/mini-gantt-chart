'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import GanttGrid from '@/components/GanttGrid';
import { generateDummyTasks } from '@/lib/dummy-data';
import { startOfTodayLocal } from '@/lib/utils';
import { loadTasks, saveTasks } from '@/lib/storage';
import type { Task } from '@/lib/types';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
            Mini Gantt
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Day-based timeline. Manage tasks in the Tasks section.
          </p>
        </div>
        <Link
          href="/tasks"
          className="transition-smooth rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:scale-[1.02] hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
        >
          Manage tasks
        </Link>
      </div>
      <div className="min-w-0 w-full transition-smooth">
        <GanttGrid tasks={tasks} anchor={startOfTodayLocal()} />
      </div>
    </main>
  );
}
