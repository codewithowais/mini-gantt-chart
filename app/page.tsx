'use client';

import { useEffect, useRef, useState } from 'react';
import { generateDummyTasks } from '@/lib/dummy-data';
import { loadTasks, saveTasks } from '@/lib/storage';
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

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Mini Gantt</h1>
    </main>
  );
}
