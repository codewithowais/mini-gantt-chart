'use client';

import {
  DAYS_RANGE,
  DAY_WIDTH,
  MS_PER_DAY,
  ROW_HEIGHT,
} from '@/lib/constants';
import type { Task } from '@/lib/types';
import { clamp } from '@/lib/utils';

type GanttGridProps = {
  tasks: Task[];
  anchor: Date;
};

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

export default function GanttGrid({ tasks, anchor }: GanttGridProps) {
  const sorted = [...tasks].sort((a, b) => a.row - b.row);

  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white">
      <div className="min-w-max">
        {/* Header row with day numbers */}
        <div
          className="flex border-b border-gray-200 bg-gray-100"
          style={{ height: ROW_HEIGHT }}
        >
          {Array.from({ length: DAYS_RANGE }, (_, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center justify-center border-r border-gray-200 text-xs text-gray-600"
              style={{ width: DAY_WIDTH }}
            >
              {i}
            </div>
          ))}
        </div>
        {/* Grid rows with bars */}
        {sorted.map((task) => {
          const { leftDays, widthDays } = barPosition(task, anchor);
          return (
            <div
              key={task.id}
              className="relative flex border-b border-gray-100"
              style={{ height: ROW_HEIGHT }}
            >
              {Array.from({ length: DAYS_RANGE }, (_, i) => (
                <div
                  key={i}
                  className="shrink-0 border-r border-gray-100"
                  style={{ width: DAY_WIDTH }}
                />
              ))}
              <div
                className={`absolute top-1 bottom-1 rounded border ${STATUS_COLORS[task.status]}`}
                style={{
                  left: leftDays * DAY_WIDTH,
                  width: widthDays * DAY_WIDTH,
                }}
                title={task.name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
