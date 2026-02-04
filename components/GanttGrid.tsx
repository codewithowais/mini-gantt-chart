'use client';

import { DAYS_RANGE, MS_PER_DAY, ROW_HEIGHT } from '@/lib/constants';
import type { Task } from '@/lib/types';
import { clamp } from '@/lib/utils';

type GanttGridProps = {
  tasks: Task[];
  anchor: Date;
};

function getDateForDay(anchor: Date, dayOffset: number): Date {
  const d = new Date(anchor);
  d.setDate(d.getDate() + dayOffset);
  return d;
}

/** Use fixed locale so server and client render the same (avoids hydration mismatch). */
const DATE_LOCALE = 'en-US';

function formatHeaderDate(date: Date): string {
  return date.toLocaleDateString(DATE_LOCALE, {
    day: 'numeric',
    month: 'short',
  });
}

function barPosition(task: Task, anchor: Date): { leftDays: number; widthDays: number } {
  const anchorMs = anchor.getTime();
  const startMs = new Date(task.startAt).getTime();
  const endMs = new Date(task.endAt).getTime();
  let leftDays = Math.floor((startMs - anchorMs) / MS_PER_DAY);
  let widthDays = Math.max(1, Math.ceil((endMs - startMs) / MS_PER_DAY));
  leftDays = clamp(leftDays, 0, DAYS_RANGE - 1);
  widthDays = Math.min(widthDays, DAYS_RANGE - leftDays);
  widthDays = Math.max(1, widthDays);
  return { leftDays, widthDays };
}

const STATUS_COLORS: Record<Task['status'], string> = {
  todo: 'bg-amber-200 border-amber-400',
  doing: 'bg-blue-200 border-blue-400',
  done: 'bg-emerald-200 border-emerald-400',
};

const TASK_LABEL_WIDTH = 200;

export default function GanttGrid({ tasks, anchor }: GanttGridProps) {
  const sorted = [...tasks].sort((a, b) => a.row - b.row);

  const gridCols = {
    gridTemplateColumns: `repeat(${DAYS_RANGE}, minmax(0, 1fr))`,
  };

  return (
    <div className="transition-smooth w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md">
      <div className="flex min-w-0 w-full">
        {/* Left column: task names */}
        <div
          className="flex shrink-0 flex-col border-r border-gray-200"
          style={{ width: TASK_LABEL_WIDTH }}
        >
          <div
            className="flex items-center border-b border-gray-200 bg-gray-100 px-3 text-xs font-medium text-gray-600"
            style={{ height: ROW_HEIGHT }}
          >
            Task
          </div>
          {sorted.map((task) => (
            <div
              key={task.id}
              className="transition-fast flex items-center border-b border-gray-100 px-3 text-sm text-gray-900 hover:bg-gray-50/80"
              style={{ height: ROW_HEIGHT }}
            >
              <span className="truncate" title={task.name}>
                {task.name}
              </span>
            </div>
          ))}
        </div>
        {/* Right: date grid and bars */}
        <div className="min-w-0 flex-1">
          {/* Header row with calendar dates */}
          <div
            className="grid w-full border-b border-gray-200 bg-gray-100"
            style={{ height: ROW_HEIGHT, ...gridCols }}
          >
            {Array.from({ length: DAYS_RANGE }, (_, i) => {
              const date = getDateForDay(anchor, i);
              return (
                <div
                  key={i}
                  className="transition-fast flex items-center justify-center border-r border-gray-200 text-xs font-medium text-gray-600 last:border-r-0 hover:bg-gray-200/60"
                  title={date.toLocaleDateString(DATE_LOCALE, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                >
                  {formatHeaderDate(date)}
                </div>
              );
            })}
          </div>
          {/* Grid rows with bars */}
          {sorted.map((task) => {
            const { leftDays, widthDays } = barPosition(task, anchor);
            const leftPct = (leftDays / DAYS_RANGE) * 100;
            const widthPct = (widthDays / DAYS_RANGE) * 100;
            return (
              <div
                key={task.id}
                className="relative grid w-full border-b border-gray-100"
                style={{ height: ROW_HEIGHT, ...gridCols }}
              >
                {Array.from({ length: DAYS_RANGE }, (_, i) => (
                  <div
                    key={i}
                    className="border-r border-gray-100 last:border-r-0"
                  />
                ))}
                <div
                  className={`transition-smooth absolute top-1 bottom-1 rounded-md border ${STATUS_COLORS[task.status]} hover:shadow-md hover:brightness-95`}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                  }}
                  title={task.name}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
