'use client';

import { useRef, useState, useCallback, useMemo, memo } from 'react';
import { DAYS_RANGE, MS_PER_DAY, TASK_CATEGORIES } from '@/lib/constants';
import type { Task } from '@/lib/types';
import { theme, getCategoryColor } from '@/lib/theme';
import { clamp } from '@/lib/utils';

type GanttGridProps = {
  tasks: Task[];
  anchor: Date;
  onTaskChange?: (
    taskId: string,
    updates: { startAt?: string; endAt?: string }
  ) => void;
};

/** One row in the Gantt: either a category header or a task bar row. */
type GanttRow =
  | { type: 'category'; category: string }
  | { type: 'bar'; task: Task; laneIndex: number };

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

/** Milliseconds from local midnight for a date (0 .. MS_PER_DAY). Used to preserve time-of-day when committing drag. */
function getTimeOfDayMs(date: Date): number {
  const d = new Date(date);
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  return clamp(d.getTime() - midnight.getTime(), 0, MS_PER_DAY - 1);
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

/** Assign lane index to each task so overlapping tasks (by time) get different lanes. */
function assignLanes(tasks: Task[]): Map<string, number> {
  const byStart = [...tasks].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
  const laneEnds: number[] = [];
  const taskLane = new Map<string, number>();
  for (const task of byStart) {
    const start = new Date(task.startAt).getTime();
    const end = new Date(task.endAt).getTime();
    let k = 0;
    while (k < laneEnds.length && start < laneEnds[k]) k++;
    if (k === laneEnds.length) laneEnds.push(end);
    else laneEnds[k] = end;
    taskLane.set(task.id, k);
  }
  return taskLane;
}

/** True if task overlaps the visible week [anchorMs, anchorMs + DAYS_RANGE days). */
function taskOverlapsWeek(task: Task, anchorMs: number): boolean {
  const weekEndMs = anchorMs + DAYS_RANGE * MS_PER_DAY;
  const startMs = new Date(task.startAt).getTime();
  const endMs = new Date(task.endAt).getTime();
  return startMs < weekEndMs && endMs > anchorMs;
}

/** Group tasks by category, assign lanes within each category, return flat list of rows. */
function buildGanttRows(tasks: Task[]): GanttRow[] {
  const byCategory = new Map<string, Task[]>();
  for (const task of tasks) {
    const cat = task.category?.trim() || TASK_CATEGORIES[0];
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(task);
  }
  const orderedCategories = [
    ...TASK_CATEGORIES.filter((c) => byCategory.has(c)),
    ...Array.from(byCategory.keys()).filter((c) => !(TASK_CATEGORIES as readonly string[]).includes(c)).sort(),
  ];
  const rows: GanttRow[] = [];
  for (const category of orderedCategories) {
    const catTasks = byCategory.get(category)!;
    // Stable order by task.row so extending a task doesn't make it jump up/down
    const sorted = [...catTasks].sort(
      (a, b) => a.row - b.row || new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
    const laneMap = assignLanes(sorted);
    rows.push({ type: 'category', category });
    for (const task of sorted) {
      rows.push({ type: 'bar', task, laneIndex: laneMap.get(task.id)! });
    }
  }
  return rows;
}

/** Min width for timeline grid so day columns stay usable on small screens (horizontal scroll). */
const TIMELINE_MIN_WIDTH_PX = 280;
const RESIZE_HANDLE_WIDTH = 8;
/** Responsive row height: 36px on small screens, 40px from sm up. */
const ROW_HEIGHT_CLASS = 'h-9 sm:h-10';

/** Returns day offset (0..DAYS_RANGE, can be fractional) from left of timeline from a viewport clientX. Scroll-invariant. */
type GetDayOffsetFromClientX = (clientX: number) => number;

type GanttBarRowProps = {
  task: Task;
  anchor: Date;
  gridCols: { gridTemplateColumns: string };
  onTaskChange?: GanttGridProps['onTaskChange'];
  getDayWidthPx: () => number;
  getDayOffsetFromClientX: GetDayOffsetFromClientX;
};

const GanttBarRow = memo(function GanttBarRow({
  task,
  anchor,
  gridCols,
  onTaskChange,
  getDayWidthPx,
  getDayOffsetFromClientX,
}: GanttBarRowProps) {
  const { leftDays, widthDays } = barPosition(task, anchor);
  const anchorMs = anchor.getTime();

  // Preview deltas (in days, can be fractional) during drag/resize; commit on pointer up
  const [dragPreviewDays, setDragPreviewDays] = useState<number | null>(null);
  const [resizePreviewDays, setResizePreviewDays] = useState<number | null>(null);

  const dragRef = useRef<{
    startDayOffset: number;
    startAt: string;
    endAt: string;
  } | null>(null);
  const resizeRef = useRef<{
    startX: number;
    endAt: string;
    dayWidthPx: number;
  } | null>(null);

  // Batch preview updates to once per frame to avoid re-render storms during drag/resize
  const dragDeltaRef = useRef(0);
  const resizeDeltaRef = useRef(0);
  const rafDragIdRef = useRef<number | null>(null);
  const rafResizeIdRef = useRef<number | null>(null);

  // Visual position: base + preview, clamped to valid range (like real Gantt)
  const dragDelta = dragPreviewDays ?? 0;
  const resizeDelta = resizePreviewDays ?? 0;
  const visualLeftDays = clamp(leftDays + dragDelta, 0, DAYS_RANGE - 1);
  // During drag: clamp width so bar never extends past grid (avoids card width jumping when moving left/right).
  // During resize: same clamp so the bar doesn't extend past the grid.
  const visualWidthDays =
    resizePreviewDays !== null
      ? clamp(widthDays + resizeDelta, 1, DAYS_RANGE - visualLeftDays)
      : Math.min(widthDays, Math.max(1, DAYS_RANGE - visualLeftDays));
  const visualLeftPct = (visualLeftDays / DAYS_RANGE) * 100;
  const visualWidthPct = (visualWidthDays / DAYS_RANGE) * 100;

  function handleBarPointerDown(e: React.PointerEvent) {
    if (e.button !== 0 || !onTaskChange) return;
    const target = e.target as HTMLElement;
    if (target.dataset.resize === 'true') return;
    const startDayOffset = getDayOffsetFromClientX(e.clientX);
    if (Number.isNaN(startDayOffset)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startDayOffset,
      startAt: task.startAt,
      endAt: task.endAt,
    };
    setDragPreviewDays(0);
  }

  function handleBarPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const { startDayOffset } = dragRef.current;
    dragDeltaRef.current = getDayOffsetFromClientX(e.clientX) - startDayOffset;
    if (rafDragIdRef.current === null) {
      rafDragIdRef.current = requestAnimationFrame(() => {
        setDragPreviewDays(dragDeltaRef.current);
        rafDragIdRef.current = null;
      });
    }
  }

  function handleBarPointerUp(e: React.PointerEvent) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (rafDragIdRef.current !== null) {
      cancelAnimationFrame(rafDragIdRef.current);
      rafDragIdRef.current = null;
    }
    if (dragRef.current && onTaskChange) {
      const { startDayOffset, startAt, endAt } = dragRef.current;
      const currentDayOffset = getDayOffsetFromClientX(e.clientX);
      const deltaDays = Math.round(currentDayOffset - startDayOffset);
      if (deltaDays !== 0) {
        const startMs = new Date(startAt).getTime();
        const endMs = new Date(endAt).getTime();
        let newStartDays = Math.floor((startMs - anchorMs) / MS_PER_DAY) + deltaDays;
        let newEndDays = Math.floor((endMs - anchorMs) / MS_PER_DAY) + deltaDays;
        newStartDays = clamp(newStartDays, 0, DAYS_RANGE - 1);
        newEndDays = clamp(newEndDays, newStartDays + 1, DAYS_RANGE);
        // Preserve time-of-day so bar width (ceil((end-start)/day)) matches task dates
        const startTimeOfDayMs = getTimeOfDayMs(new Date(startAt));
        const endTimeOfDayMs = getTimeOfDayMs(new Date(endAt));
        let newStartMs = anchorMs + newStartDays * MS_PER_DAY + startTimeOfDayMs;
        let newEndMs = anchorMs + newEndDays * MS_PER_DAY + endTimeOfDayMs;
        if (newEndMs <= newStartMs) {
          newEndMs = newStartMs + MS_PER_DAY;
        }
        const newStartAt = new Date(newStartMs).toISOString();
        const newEndAt = new Date(newEndMs).toISOString();
        onTaskChange(task.id, { startAt: newStartAt, endAt: newEndAt });
      }
    }
    dragRef.current = null;
    setDragPreviewDays(null);
  }

  function handleResizePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    if (e.button !== 0 || !onTaskChange) return;
    const dayWidthPx = getDayWidthPx();
    if (dayWidthPx <= 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = {
      startX: e.clientX,
      endAt: task.endAt,
      dayWidthPx,
    };
    setResizePreviewDays(0);
  }

  function handleResizePointerMove(e: React.PointerEvent) {
    if (!resizeRef.current) return;
    const { startX, dayWidthPx } = resizeRef.current;
    resizeDeltaRef.current = (e.clientX - startX) / dayWidthPx;
    if (rafResizeIdRef.current === null) {
      rafResizeIdRef.current = requestAnimationFrame(() => {
        setResizePreviewDays(resizeDeltaRef.current);
        rafResizeIdRef.current = null;
      });
    }
  }

  function handleResizePointerUp(e: React.PointerEvent) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (rafResizeIdRef.current !== null) {
      cancelAnimationFrame(rafResizeIdRef.current);
      rafResizeIdRef.current = null;
    }
    if (resizeRef.current && onTaskChange) {
      const { startX, endAt, dayWidthPx } = resizeRef.current;
      const deltaPx = e.clientX - startX;
      const deltaDays = Math.round(deltaPx / dayWidthPx);
      if (deltaDays !== 0) {
        const startMs = new Date(task.startAt).getTime();
        let endMs = new Date(endAt).getTime();
        endMs = endMs + deltaDays * MS_PER_DAY;
        const minEndMs = startMs + MS_PER_DAY;
        endMs = Math.max(minEndMs, endMs);
        const maxEndMs = anchorMs + DAYS_RANGE * MS_PER_DAY;
        endMs = Math.min(maxEndMs, endMs);
        onTaskChange(task.id, { endAt: new Date(endMs).toISOString() });
      }
    }
    resizeRef.current = null;
    setResizePreviewDays(null);
  }

  return (
    <div
      className={`relative grid w-full border-b ${theme.border.light} ${ROW_HEIGHT_CLASS}`}
      style={gridCols}
    >
      {Array.from({ length: DAYS_RANGE }, (_, i) => (
        <div
          key={i}
          className={`border-r ${theme.border.light} last:border-r-0`}
        />
      ))}
      <div
        className={`select-none absolute top-1 bottom-1 flex cursor-grab items-center rounded-lg active:cursor-grabbing touch-none ${getCategoryColor(task.category)} hover:brightness-110`}
        style={{
          left: `${visualLeftPct}%`,
          width: `${visualWidthPct}%`,
        }}
        title={task.name}
        onPointerDown={handleBarPointerDown}
        onPointerMove={handleBarPointerMove}
        onPointerUp={handleBarPointerUp}
        onPointerCancel={handleBarPointerUp}
      >
        <span className="pointer-events-none truncate px-3 text-left text-xs font-medium opacity-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
          {task.name}
        </span>
        <div
          data-resize="true"
          className={`absolute right-0 top-0 h-full w-2 touch-none ${theme.resizeHandle}`}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          onPointerCancel={handleResizePointerUp}
        />
      </div>
    </div>
  );
});

export default function GanttGrid({
  tasks,
  anchor,
  onTaskChange,
}: GanttGridProps) {
  const anchorMs = anchor.getTime();
  const tasksInWeek = tasks.filter((t) => taskOverlapsWeek(t, anchorMs));
  const ganttRows = buildGanttRows(tasksInWeek);
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getDayWidthPx = useCallback(() => {
    const el = timelineRef.current;
    if (!el) return 0;
    return el.offsetWidth / DAYS_RANGE;
  }, []);

  /** Day offset from left of timeline (0..DAYS_RANGE). Scroll-invariant for correct drag commit. */
  const getDayOffsetFromClientX = useCallback((clientX: number): number => {
    const timeline = timelineRef.current;
    const scrollEl = scrollContainerRef.current;
    if (!timeline || !scrollEl) return NaN;
    const rect = timeline.getBoundingClientRect();
    const scrollLeft = scrollEl.scrollLeft ?? 0;
    const dayWidthPx = timeline.offsetWidth / DAYS_RANGE;
    if (dayWidthPx <= 0) return NaN;
    // Content start in viewport = rect.left - scrollLeft; position in content = clientX - that
    return (clientX - rect.left + scrollLeft) / dayWidthPx;
  }, []);

  const gridCols = useMemo(
    () => ({ gridTemplateColumns: `repeat(${DAYS_RANGE}, minmax(0, 1fr))` }),
    []
  );

  return (
    <div
      ref={scrollContainerRef}
      className={`transition-smooth w-full max-w-full overflow-x-auto ${theme.card}`}
    >
      <div className="flex min-w-0 w-full">
        {/* Left column: fixed width so timeline bar % stays stable when scrolling/resizing */}
        <div
          className={`${theme.ganttLabelCol} w-[12rem] min-w-[12rem] max-w-[12rem] shrink-0`}
        >
          <div
            className={`flex items-center px-2 sm:px-4 ${theme.tableHeader} ${ROW_HEIGHT_CLASS}`}
          >
            <span className="truncate text-xs font-semibold uppercase tracking-wide text-brand-ink-muted">Task</span>
          </div>
          {ganttRows.length === 0 ? (
            <div
              className={`flex items-center border-b ${theme.border.light} px-2 sm:px-4 ${theme.tableRowGantt} min-h-[4.5rem] sm:min-h-[5rem]`}
            >
              <span className="text-xs sm:text-sm text-brand-ink-muted">No tasks this week</span>
            </div>
          ) : (
            ganttRows.map((row, idx) =>
              row.type === 'category' ? (
                <div
                  key={`cat-${row.category}-${idx}`}
                  className={`flex items-center border-b ${theme.border.light} px-2 sm:px-4 font-semibold ${theme.surface.elevated} text-brand-ink ${ROW_HEIGHT_CLASS}`}
                >
                  <span className="truncate text-xs sm:text-sm">{row.category}</span>
                </div>
              ) : (
                <div
                  key={row.task.id}
                  className={`transition-fast flex items-center border-b ${theme.border.light} px-2 sm:px-4 ${theme.tableRowGantt} ${ROW_HEIGHT_CLASS}`}
                >
                  <span className="truncate text-xs sm:text-sm font-medium text-brand-ink" title={row.task.name}>
                    {row.task.name}
                  </span>
                </div>
              )
            )
          )}
        </div>
        {/* Right: date grid and bars; min-width so columns stay usable, scroll on small viewports */}
        <div
          ref={timelineRef}
          className="min-w-0 flex-1"
          style={{ minWidth: TIMELINE_MIN_WIDTH_PX }}
        >
          {/* Header row with calendar dates */}
          <div
            className={`grid w-full border-b ${theme.border.default} ${theme.surface.elevated} ${ROW_HEIGHT_CLASS}`}
            style={gridCols}
          >
            {Array.from({ length: DAYS_RANGE }, (_, i) => {
              const date = getDateForDay(anchor, i);
              return (
                <div
                  key={i}
                  className={`transition-fast flex items-center justify-center text-[10px] sm:text-xs font-semibold ${theme.ganttDateCell}`}
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
          {/* Rows: category rows (empty) and bar rows, or empty state */}
          {ganttRows.length === 0 ? (
            <div
              className={`grid w-full border-b ${theme.border.light} items-center justify-center ${theme.surface.hover} min-h-[4.5rem] sm:min-h-[5rem]`}
              style={gridCols}
            >
              <span className="col-span-full text-center text-xs sm:text-sm text-brand-ink-muted">
                No tasks this week
              </span>
            </div>
          ) : (
            ganttRows.map((row, idx) =>
            row.type === 'category' ? (
              <div
                key={`grid-cat-${row.category}-${idx}`}
                className={`grid w-full border-b ${theme.border.light} ${ROW_HEIGHT_CLASS}`}
                style={gridCols}
              >
                {Array.from({ length: DAYS_RANGE }, (_, i) => (
                  <div
                    key={i}
                    className={`border-r ${theme.border.light} last:border-r-0`}
                  />
                ))}
              </div>
            ) : (
                <GanttBarRow
                  key={row.task.id}
                  task={row.task}
                  anchor={anchor}
                  gridCols={gridCols}
                  onTaskChange={onTaskChange}
                  getDayWidthPx={getDayWidthPx}
                  getDayOffsetFromClientX={getDayOffsetFromClientX}
                />
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
