# Mini Gantt POC — Complete Plan

> **For Claude:** This file combines project requirements + implementation plan. Follow this document for the full build.

---

# PART 1: PROJECT REQUIREMENTS

## Goal

Build a POC "Mini Gantt" web app using Next.js (App Router) + TypeScript + Tailwind CSS.

A single-page app at route `/` that supports full CRUD for tasks with real start/end datetime, renders a day-based Gantt chart, supports:

- horizontal drag to move tasks in time (updates real dates)
- resize to change task end date (updates real dates)
- vertical drag-and-drop to reorder tasks (move up/down rows)

Persists to localStorage. Keep it simple, clean, and fast—NO backend.

## Tech Requirements

- Next.js (App Router) + TypeScript
- Tailwind CSS
- No external drag/drop libraries (use native pointer events)
- Store everything in localStorage key: `gantt_poc_tasks_v1`
- Use ISO strings for datetimes (startAt/endAt)
- Use `crypto.randomUUID()` for ids
- Code should run without errors

## Data Model

```typescript
type Task = {
  id: string;
  name: string;
  startAt: string;   // ISO datetime
  endAt: string;     // ISO datetime
  status: 'todo' | 'doing' | 'done';
  row: number;       // row ordering (0..n-1)
};
```

## Features

### 1. Dummy Data
- If localStorage is empty on first load, auto-seed with ~50 dummy tasks
- Provide a "Reset dummy data" button to overwrite current tasks with fresh dummy tasks
- Provide a "Clear" button to remove all tasks

### 2. CRUD
- **Create:** name, start datetime, end datetime, status
- **Read:** table list on left, Gantt view on right
- **Update:** click task in table to load into form, save updates
- **Delete:** delete from table row
- **Validation:**
  - end must be after start
  - minimum duration for display is 1 day
- Always keep tasks sorted by `row` for display. After any reorder/delete, re-normalize rows to 0..n-1

### 3. Gantt Chart (day-based rendering, REAL datetime storage)
- Timeline range: 60 days starting from anchor = start of "today" (local time)
- dayWidth: 24px (constant)
- Convert datetime → day offset:
  - `leftDays = floor((startAt - anchorStartOfDay) / MS_PER_DAY)`
  - `widthDays = max(1, ceil((endAt - startAt) / MS_PER_DAY))`
- Clamp bars so they stay within 0..59 days
- The Gantt shows a header row with day numbers and a grid background
- **Overlapping tasks (same category):** When tasks overlap on the same date within the same category, lay them out vertically (stacked like cards one below the other) within that category row instead of overlapping. Each overlapping task gets its own horizontal “lane” (up/down) inside the category row.

### 4. Interactions on Bars (horizontal drag + resize)
- **Horizontal drag on the bar body:**
  - shifts BOTH startAt and endAt by deltaDays
  - snap to whole days
  - clamp so bar stays in range
- **Resize from a RIGHT handle:**
  - adjusts ONLY endAt by deltaDays
  - snap to whole days
  - enforce min duration = 1 day
  - clamp endAt within range
- Use pointer events (pointerdown/move/up), setPointerCapture, and clean up listeners
- Update the real dates in state and localStorage; table updates live

### 5. Vertical Drag-and-Drop to Reorder Tasks (up/down)
- Allow dragging a task row vertically by grabbing a "drag handle" icon on the left of the row
- While dragging, show a simple visual indicator (dragged row becomes slightly transparent, placeholder line shows insertion position)
- On drop, reorder tasks by changing their order and reassigning `row` sequentially
- Implementation approach (no library):
  - On pointerdown on row handle, record: draggedTaskId, start pointerY, original index
  - On pointermove, compute hover index based on: container top + rowHeight, clamp to [0, tasks.length-1]
  - On pointerup, commit reorder: move item from original index to hover index, renormalize rows 0..n-1
- Ensure vertical reordering does NOT interfere with horizontal bar drag/resize

## UI / Layout (Tailwind)

- Clean, minimal UI
- Top bar: title + buttons (Reset dummy data, Clear)
- Two-column layout:
  - Left: TaskForm (create/edit) + TaskTable (list with reorder handle)
  - Right: GanttGrid (rows align with table ordering)
- TaskTable columns: Drag handle, Name, Start, End, Duration (computed), Status, Actions
- TaskForm:
  - Inputs: name (text), startAt (datetime-local), endAt (datetime-local), status (select)
  - Button: Create or Update depending on mode
  - Cancel edit button resets form to create mode

## Helper Utilities Needed

- `startOfTodayLocal(): Date` (00:00 local)
- `clamp(n, min, max)`
- `addDaysISO(iso: string, deltaDays: number): string`
- `toDatetimeLocalValue(iso)` and `fromDatetimeLocalValue(value)` conversions
- `durationDays(task): computed`

---

# PART 2: RULES (apply to all phases)

Follow these rules for every task and phase.

## Phase Workflow
- **After each phase:** Stop and wait for the user to test the app and approve
- **Commit only after approval:** Do not commit phase changes until the user has tested and explicitly approved
- **Then continue:** Only after the user has approved and the phase is committed, start the next phase
- **UI/UX:** Apply best UI/UX practices: clear hierarchy and spacing consistency
- **Readability & maintainability:** Keep code readable and maintainable (clear names, small units, minimal coupling)
- **Responsiveness:** The app must be responsive and work well across screen sizes (mobile, tablet, desktop)

## Best Practices
- **Code:** Prefer small, single-purpose functions and components; avoid duplication (DRY); use TypeScript types for all props and state; no `any` unless justified
- **Structure:** Keep components under ~200 lines; extract reusable logic into `lib/` or hooks; use consistent naming (camelCase for code, kebab-case for files if preferred)
- **React:** Use controlled components for forms; key lists by stable id; avoid inline object/array creation in JSX where it hurts performance; clean up effects (e.g. pointer listeners) on unmount
- **Data:** Validate and normalize data at boundaries (e.g. form submit, localStorage parse); keep row indices normalized (0..n-1) after any reorder or delete

## Security Checks
- **Input:** Validate and sanitize all user input (task name length, date ranges); reject or coerce invalid values; do not render or execute user content as code or HTML
- **Storage:** Parse localStorage with try/catch; treat parsed data as untrusted and validate shape before use; limit stored payload size if needed (e.g. max tasks or name length)
- **XSS:** Render user-provided text as text (React default); do not inject raw HTML from task names or other inputs

## Commits
- **One line only:** Every commit must have a single-line message (no body, no multiple paragraphs)
- **Format:** Use conventional style: `type: short description` (e.g. `feat: add TaskForm`, `fix: clamp bar to timeline`, `chore: add Prettier`). Keep the description under ~72 characters

## Best UI Practices
- **Accessibility:** Use semantic HTML (`button`, `label`, `input`); associate labels with inputs; ensure interactive elements are focusable and keyboard-usable; provide visible focus styles; use sufficient color contrast
- **Feedback:** Show loading or disabled state when appropriate; display validation errors near the relevant field; confirm destructive actions (e.g. delete) or make undo obvious
- **Layout:** Use a responsive layout (e.g. flex/grid); avoid horizontal scroll on small screens where possible; use consistent spacing and alignment (Tailwind scale)
- **Consistency:** Reuse the same patterns for buttons, inputs, and tables; keep status colors and typography consistent across the app

---

# PART 3: IMPLEMENTATION PLAN

## Plan Overview (8 phases)

Work through phases in order. After each phase: **implement → notify user → WAIT for user to test and approve → commit → proceed to next phase.**

| # | Phase | Tasks | What you can test after |
|---|-------|-------|-------------------------|
| 1 | Project setup and types | 1–4 | App runs at `/`, Prettier + lint + Husky run |
| 2 | Storage and dummy data | 5–6 | Build passes, storage/dummy modules exist |
| 3 | App state and CRUD | 7–10 | Create/edit/delete tasks, persistence |
| 4 | Gantt chart rendering | 11–12 | Gantt grid and bars visible |
| 5 | Bar interactions | 13–14 | Horizontal drag and resize on bars |
| 6 | Vertical reorder | 15–16 | Row reorder in table (and optional Gantt) |
| 7 | Top bar buttons | 17 | Reset dummy data, Clear |
| 8 | Polish and verification | 18–20 | Validation, README, full regression |

---

## Phase 1: Project Setup and Types

### Task 1: Next.js + TypeScript + Tailwind scaffold

**Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`

**Steps:**
1. Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm`
2. Ensure `app/globals.css` uses Tailwind directives and `app/layout.tsx` wraps children with `<html>`/`<body>`
3. Set `app/page.tsx` to a minimal placeholder (e.g. "Mini Gantt" heading)
4. Run `npm i` and `npm run dev`; confirm app loads at `/`

**Commit:** `chore: init Next.js + TypeScript + Tailwind`

---

### Task 2: Prettier, ESLint, and Husky

**Files:** `.prettierrc`, `.prettierignore`, `package.json`, `.husky/pre-commit`

**Steps:**
1. Install Prettier: `npm i -D prettier`. Add `.prettierrc` with `semi: true`, `singleQuote: true`, `tabWidth: 2`
2. Add scripts: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`. Install `npm i -D eslint-config-prettier`
3. Install Husky: `npm i -D husky`. Run `npx husky init`. Add pre-commit hook that runs lint + format check
4. Run `npm run format` and verify `npm run lint` and `npm run format:check` pass

**Commit:** `chore: add Prettier, ESLint config, and Husky pre-commit`

---

### Task 3: Data model and constants

**Files:** `lib/types.ts`, `lib/constants.ts`

**Steps:**
1. In `lib/types.ts`: `type Task = { id: string; name: string; startAt: string; endAt: string; status: 'todo' | 'doing' | 'done'; row: number }`
2. In `lib/constants.ts`: `STORAGE_KEY = 'gantt_poc_tasks_v1'`, `MS_PER_DAY`, `DAYS_RANGE = 60`, `DAY_WIDTH = 24`, `ROW_HEIGHT = 40`

**Commit:** `feat: add Task type and constants`

---

### Task 4: Date/time and task helpers

**Files:** `lib/utils.ts`

**Steps:**
1. `startOfTodayLocal(): Date` — start of today in local timezone
2. `clamp(n: number, min: number, max: number): number`
3. `addDaysISO(iso: string, deltaDays: number): string` — parse ISO, add days, return ISO
4. `toDatetimeLocalValue(iso: string): string` and `fromDatetimeLocalValue(value: string): string`
5. `durationDays(startAt: string, endAt: string): number` — ceil of diff / MS_PER_DAY, min 1

**Commit:** `feat: add date and task utility functions`

---

**Phase 1 Checkpoint:** Test `npm run dev` (app at localhost:3000); `npm run lint` and `npm run format:check` pass; Husky triggers on commit.

---

## Phase 2: Storage and Dummy Data

### Task 5: localStorage load/save and row normalization

**Files:** `lib/storage.ts`

**Steps:**
1. `loadTasks(): Task[]` — parse JSON from localStorage; on null/invalid return `[]`
2. `saveTasks(tasks: Task[]): void` — sort by `row`, normalize rows, save to localStorage
3. `normalizeRows(tasks: Task[]): Task[]` — return new array with `row` set to index 0..n-1

**Commit:** `feat: add localStorage load/save and row normalization`

---

### Task 6: Dummy data generator

**Files:** `lib/dummy-data.ts`

**Steps:**
1. `generateDummyTasks(): Task[]` — ~50 tasks with `crypto.randomUUID()`, varied names, dates within 60-day window, random status, row 0..n-1
2. Ensure min duration 1 day and endAt > startAt

**Commit:** `feat: add dummy task generator`

---

**Phase 2 Checkpoint:** Test `npm run build` (no errors in lib modules).

---

## Phase 3: App State and CRUD

### Task 7: Page state and initial load

**Files:** `app/page.tsx`

**Steps:**
1. Add state: `tasks: Task[]`, `editingId: string | null`
2. On mount: if `loadTasks()` empty, seed with `generateDummyTasks()` and save; else load from storage
3. Add effect: when `tasks` changes, call `saveTasks(tasks)`

**Commit:** `feat: page state, initial load, and persist on change`

---

### Task 8: TaskForm component

**Files:** `components/TaskForm.tsx`

**Steps:**
1. Props: `task | null`, `onSubmit`, `onCancelEdit`
2. Controlled inputs: name, startAt (datetime-local), endAt (datetime-local), status (select)
3. Validation: endAt > startAt; min duration 1 day
4. Button: "Create" or "Update" + "Cancel" when editing

**Commit:** `feat: add TaskForm for create and update`

---

### Task 9: TaskTable component

**Files:** `components/TaskTable.tsx`

**Steps:**
1. Props: `tasks`, `onSelectForEdit`, `onDelete`, `onReorder`
2. Columns: drag handle (placeholder), Name, Start, End, Duration, Status, Actions
3. Edit action calls `onSelectForEdit(task)`; Delete calls `onDelete(task.id)`

**Commit:** `feat: add TaskTable with edit and delete`

---

### Task 10: Wire TaskForm and TaskTable into page

**Files:** `app/page.tsx`

**Steps:**
1. Add handlers: create, update, delete, selectForEdit, cancelEdit
2. Render two-column layout (left: form + table; right: Gantt placeholder)
3. Verify CRUD and persistence

**Commit:** `feat: wire TaskForm and TaskTable; CRUD working`

---

**Phase 3 Checkpoint:** Test create/edit/delete tasks; refresh → persistence works.

---

## Phase 4: Gantt Chart Rendering

### Task 11: Gantt header and grid background

**Files:** `components/GanttGrid.tsx`

**Steps:**
1. Props: `tasks`, `anchor` = startOfTodayLocal()
2. Timeline: 60 days; day width from constants
3. Render header row with day numbers
4. Render grid with vertical/horizontal lines

**Commit:** `feat: Gantt header and grid`

---

### Task 12: Gantt bars

**Files:** `components/GanttGrid.tsx`

**Steps:**
1. Compute `leftDays` and `widthDays` for each task
2. Clamp to [0, 59] days
3. Render bars with position/width; color by status

**Commit:** `feat: render Gantt bars from task dates`

---

**Phase 4 Checkpoint:** Test Gantt shows header, grid, bars aligned with table.

---

## Phase 5: Bar Interactions

### Task 13: Horizontal drag on bar body

**Files:** `components/GanttGrid.tsx`

**Steps:**
1. pointerdown → capture, record startX and task dates
2. pointermove → compute deltaDays, update both startAt/endAt, clamp
3. pointerup → release capture

**Commit:** `feat: horizontal drag on Gantt bar`

---

### Task 14: Resize handle (right edge)

**Files:** `components/GanttGrid.tsx`

**Steps:**
1. Add narrow resize handle on right edge
2. pointerdown → capture, record endAt
3. pointermove → update endAt only; enforce min 1 day
4. Ensure resize and drag don't conflict

**Commit:** `feat: resize bar from right handle`

---

**Phase 5 Checkpoint:** Test drag (dates update); resize (end date only, min 1 day).

---

## Phase 6: Vertical Reorder

### Task 15: Row drag handle in TaskTable

**Files:** `components/TaskTable.tsx`

**Steps:**
1. Add drag handle (grip icon) in first column
2. pointerdown → record draggedTaskId, startY, originalIndex
3. pointermove → compute hoverIndex, show placeholder
4. pointerup → reorder array, normalize rows, call `onReorder`

**Commit:** `feat: vertical reorder in TaskTable with row handle`

---

### Task 16: Optional row handle in Gantt

**Files:** `components/GanttGrid.tsx`

**Steps:**
1. If Gantt has label column, add same drag-handle behavior
2. Call same `onReorder` to keep table and Gantt in sync

**Commit:** `feat: optional reorder handle in Gantt row area`

---

**Phase 6 Checkpoint:** Test row reorder; table and Gantt sync; order persists.

---

## Phase 7: Top Bar Buttons

### Task 17: Top bar (Reset dummy data, Clear)

**Files:** `app/page.tsx`

**Steps:**
1. Top bar: title "Mini Gantt" + "Reset dummy data" + "Clear" buttons
2. Reset: replace tasks with `generateDummyTasks()`, save, clear editing
3. Clear: set tasks to `[]`, save, clear editing

**Commit:** `feat: top bar with Reset and Clear`

---

**Phase 7 Checkpoint:** Test Reset and Clear buttons work; state persists.

---

## Phase 8: Polish and Verification

### Task 18: Validation and edge cases

**Files:** `components/TaskForm.tsx`, `lib/utils.ts`, `lib/storage.ts`

**Steps:**
1. Ensure create/update: endAt > startAt, duration ≥ 1 day
2. Normalize rows after delete/reorder
3. Ensure Gantt bar clamping works correctly

**Commit:** `fix: validation and row normalization edge cases`

---

### Task 19: Manual test checklist

**Steps:**
1. Run `npm i` and `npm run dev`
2. Test: empty storage → dummy data; Reset → new set; Clear → empty
3. Test: create, edit, delete tasks; check table, Gantt, localStorage
4. Test: horizontal drag, resize, vertical reorder
5. Confirm no console errors; persistence survives refresh

---

### Task 20: README run instructions

**Files:** `README.md`

**Steps:**
1. Add: run with `npm i` then `npm run dev`
2. Brief description of the app

**Commit:** `docs: add README run instructions`

---

**Phase 8 Checkpoint:** Full regression test complete. Plan finished.

---

## Quick Reference

```bash
# Install
npm install

# Run dev server
npm run dev

# Lint
npm run lint

# Format
npm run format

# Build
npm run build
```
