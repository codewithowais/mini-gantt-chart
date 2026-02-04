You are building a POC “Mini Gantt” web app using Next.js (App Router) + TypeScript + Tailwind CSS.

GOAL: A single-page app at route `/` that supports full CRUD for tasks with real start/end datetime, renders a day-based Gantt chart, supports:

- horizontal drag to move tasks in time (updates real dates),
- resize to change task end date (updates real dates),
- vertical drag-and-drop to reorder tasks (move up/down rows),
  and persists to localStorage. Keep it simple, clean, and fast—NO backend.

TECH REQUIREMENTS

- Next.js (App Router) + TypeScript
- Tailwind CSS
- No external drag/drop libraries (use native pointer events)
- Store everything in localStorage key: `gantt_poc_tasks_v1`
- Use ISO strings for datetimes (startAt/endAt)
- Use `crypto.randomUUID()` for ids
- Code should run without errors

DATA MODEL
type Task = {
id: string
name: string
startAt: string // ISO datetime
endAt: string // ISO datetime
status: "todo" | "doing" | "done"
row: number // row ordering (0..n-1)
}

FEATURES

1. Dummy data:
   - If localStorage is empty on first load, auto-seed with ~50 dummy tasks.
   - Provide a “Reset dummy data” button to overwrite current tasks with fresh dummy tasks.
   - Provide a “Clear” button to remove all tasks.

2. CRUD:
   - Create task: name, start datetime, end datetime, status.
   - Read: table list on left, Gantt view on right.
   - Update: click task in table to load into form, save updates.
   - Delete: delete from table row.
   - Validation:
     - end must be after start
     - minimum duration for display is 1 day
   - Always keep tasks sorted by `row` for display. After any reorder/delete, re-normalize rows to 0..n-1.

3. Gantt chart (day-based rendering, REAL datetime storage):
   - Timeline range: 60 days starting from anchor = start of “today” (local time).
   - dayWidth: 24px (constant).
   - Convert datetime → day offset:
     leftDays = floor((startAt - anchorStartOfDay) / MS_PER_DAY)
     widthDays = max(1, ceil((endAt - startAt) / MS_PER_DAY))
   - Clamp bars so they stay within 0..59 days.
   - The Gantt shows a header row with day numbers and a grid background.

4. Interactions on bars (horizontal drag + resize):
   - Horizontal drag on the bar body:
     - shifts BOTH startAt and endAt by deltaDays
     - snap to whole days
     - clamp so bar stays in range
   - Resize from a RIGHT handle:
     - adjusts ONLY endAt by deltaDays
     - snap to whole days
     - enforce min duration = 1 day
     - clamp endAt within range
   - Use pointer events (pointerdown/move/up), setPointerCapture, and clean up listeners.
   - Update the real dates in state and localStorage; table updates live.

5. Vertical drag-and-drop to reorder tasks (up/down):
   - Allow dragging a task row vertically by grabbing a “drag handle” icon on the left of the row (both in table AND optionally in Gantt row label area—at least in table).
   - While dragging, show a simple visual indicator (e.g., the dragged row becomes slightly transparent and a placeholder line shows insertion position).
   - On drop, reorder tasks by changing their order and reassigning `row` sequentially.
   - Implementation approach (no library):
     - On pointerdown on row handle, record:
       - draggedTaskId
       - start pointerY
       - original index
     - On pointermove, compute hover index based on:
       - container top + rowHeight (constant, e.g., 36–44px)
       - clamp hover index to [0, tasks.length-1]
     - On pointerup, commit reorder:
       - move item from original index to hover index
       - renormalize rows 0..n-1
   - Ensure vertical reordering does NOT interfere with horizontal bar drag/resize:
     - Only start vertical reorder when user grabs the dedicated row handle.
     - Horizontal drag starts only when user grabs the bar body; resize only on the resize handle.

UI / LAYOUT (Tailwind)

- Clean, minimal UI.
- Top bar: title + buttons (Reset dummy data, Clear).
- Two-column layout:
  - Left: TaskForm (create/edit) + TaskTable (list with reorder handle)
  - Right: GanttGrid (rows align with table ordering)
- TaskTable columns: Drag handle, Name, Start, End, Duration (computed), Status, Actions.
- TaskForm:
  - Inputs: name (text), startAt (datetime-local), endAt (datetime-local), status (select).
  - Button: Create or Update depending on mode.
  - Cancel edit button resets form to create mode.

IMPLEMENTATION NOTES

- Use helper utilities:
  - startOfTodayLocal(): Date (00:00 local)
  - clamp(n, min, max)
  - addDaysISO(iso: string, deltaDays: number): string
  - toDatetimeLocalValue(iso) and fromDatetimeLocalValue(value) conversions
  - durationDays(task): computed
- Persist to localStorage on every change (simple is fine; optional small debounce ok).
- Keep files minimal (prefer 1 page + a few small components).
- Provide instructions to run: `npm i` then `npm run dev`.

DELIVERABLE

- Provide the complete code for the Next.js project’s relevant files (at least `app/page.tsx`, and any components/utils you add, plus Tailwind setup references if needed).
- Ensure it runs and all interactions work: CRUD, dummy data, horizontal drag, resize, vertical reorder, persistence.
