'use client';

import { DAYS_RANGE, DAY_WIDTH, ROW_HEIGHT } from '@/lib/constants';
import type { Task } from '@/lib/types';

type GanttGridProps = {
  tasks: Task[];
  anchor: Date;
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
        {/* Grid: one row per task with vertical lines */}
        {sorted.map((task) => (
          <div
            key={task.id}
            className="flex border-b border-gray-100"
            style={{ height: ROW_HEIGHT }}
          >
            {Array.from({ length: DAYS_RANGE }, (_, i) => (
              <div
                key={i}
                className="shrink-0 border-r border-gray-100"
                style={{ width: DAY_WIDTH }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
