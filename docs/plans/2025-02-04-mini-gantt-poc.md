# Mini Gantt POC — Single Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page Next.js “Mini Gantt” app with full CRUD for tasks, day-based Gantt chart, horizontal drag/resize on bars, vertical drag-to-reorder rows, and localStorage persistence—no backend.

**Architecture:** App Router single page at `/`. Left column: TaskForm + TaskTable (with row handle). Right column: GanttGrid (day-based, 60 days from today, 24px/day). All state in React state; sync to `localStorage` key `gantt_poc_tasks_v1` on every change. Native pointer events for drag/resize (no external drag libraries).

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS. No external drag/drop libs. `crypto.randomUUID()` for ids, ISO strings for datetimes.

---

## Rules (apply to all phases)

Follow these rules for every task and phase.

### Phase workflow
- **After each phase:** Stop and wait for the user to test the app and approve.
- **Commit only after approval:** Do not commit phase changes until the user has tested and explicitly approved.
- **Then continue:** Only after the user has approved and the phase is committed, start the next phase.

### Best practices
- **Code:** Prefer small, single-purpose functions and components; avoid duplication (DRY); use TypeScript types for all props and state; no `any` unless justified.
- **Structure:** Keep components under ~200 lines; extract reusable logic into `lib/` or hooks; use consistent naming (camelCase for code, kebab-case for files if preferred).
- **React:** Use controlled components for forms; key lists by stable id; avoid inline object/array creation in JSX where it hurts performance; clean up effects (e.g. pointer listeners) on unmount.
- **Data:** Validate and normalize data at boundaries (e.g. form submit, localStorage parse); keep row indices normalized (0..n-1) after any reorder or delete.

### Security checks
- **Input:** Validate and sanitize all user input (task name length, date ranges); reject or coerce invalid values; do not render or execute user content as code or HTML.
- **Storage:** Parse localStorage with try/catch; treat parsed data as untrusted and validate shape before use; limit stored payload size if needed (e.g. max tasks or name length).
- **XSS:** Render user-provided text as text (React default); do not inject raw HTML from task names or other inputs.

### Commits
- **One line only:** Every commit must have a single-line message (no body, no multiple paragraphs).
- **Format:** Use conventional style: `type: short description` (e.g. `feat: add TaskForm`, `fix: clamp bar to timeline`, `chore: add Prettier`). Keep the description under ~72 characters.

### Best UI practices
- **Accessibility:** Use semantic HTML (`button`, `label`, `input`); associate labels with inputs; ensure interactive elements are focusable and keyboard-usable; provide visible focus styles; use sufficient color contrast.
- **Feedback:** Show loading or disabled state when appropriate; display validation errors near the relevant field; confirm destructive actions (e.g. delete) or make undo obvious.
- **Layout:** Use a responsive layout (e.g. flex/grid); avoid horizontal scroll on small screens where possible; use consistent spacing and alignment (Tailwind scale).
- **Consistency:** Reuse the same patterns for buttons, inputs, and tables; keep status colors and typography consistent across the app.

---

## Plan overview (one plan, eight phases)

This is **one implementation plan**. Work through the phases in order. After each phase: **implement → notify user → WAIT for user to test and approve → commit → then proceed to next phase.**

| # | Phase | Tasks | What you can test after |
|---|--------|--------|--------------------------|
| 1 | Project setup and types | 1–4 | App runs at `/`, Prettier + lint + Husky run |
| 2 | Storage and dummy data | 5–6 | Build passes, storage/dummy modules exist |
| 3 | App state and CRUD | 7–10 | Create/edit/delete tasks, persistence |
| 4 | Gantt chart rendering | 11–12 | Gantt grid and bars visible |
| 5 | Bar interactions | 13–14 | Horizontal drag and resize on bars |
| 6 | Vertical reorder | 15–16 | Row reorder in table (and optional Gantt) |
| 7 | Top bar buttons | 17 | Reset dummy data, Clear |
| 8 | Polish and verification | 18–20 | Validation, README, full regression |

---

## Phase 1: Project setup and types

### Task 1: Next.js + TypeScript + Tailwind scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (placeholder)

**Steps:**
1. Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm` (or create files manually if scaffolding fails in existing dir).
2. Ensure `app/globals.css` uses Tailwind directives and `app/layout.tsx` wraps children with `<html>`/`<body>` and imports globals.
3. Set `app/page.tsx` to a minimal placeholder (e.g. "Mini Gantt" heading).
4. Run `npm i` and `npm run dev`; confirm app loads at `/`.

**Commit:** `chore: init Next.js + TypeScript + Tailwind`

---

### Task 2: Prettier, ESLint, and Husky

**Files:**
- Create: `.prettierrc`, `.prettierignore` (optional)
- Modify: `package.json` (scripts, devDependencies)
- Create: `.husky/pre-commit` (or use `npx husky init`)

**Steps:**
1. Install Prettier: `npm i -D prettier`. Add config (e.g. `.prettierrc` with `semi: true`, `singleQuote: true`, `tabWidth: 2`) and `.prettierignore` (e.g. `node_modules`, `.next`, `out`).
2. Add scripts to `package.json`: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`. Optionally integrate with ESLint: `npm i -D eslint-config-prettier` and extend it in `.eslintrc.*` so Prettier and ESLint don’t conflict.
3. Install Husky: `npm i -D husky`. Run `npx husky init`. Add a pre-commit hook (e.g. `.husky/pre-commit`) that runs `npm run lint` and `npm run format:check` (or `prettier --check .`) so commits are blocked if lint or format fails.
4. Run `npm run format` once to format existing code; run `npm run lint` and `npm run format:check` to confirm they pass.

**Commit:** `chore: add Prettier, ESLint config, and Husky pre-commit`

---

### Task 3: Data model and constants

**Files:**
- Create: `lib/types.ts` (Task type, status union)
- Create: `lib/constants.ts` (STORAGE_KEY, MS_PER_DAY, DAYS_RANGE, DAY_WIDTH, ROW_HEIGHT, etc.)

**Steps:**
1. In `lib/types.ts`, define:
   - `type Task = { id: string; name: string; startAt: string; endAt: string; status: 'todo' | 'doing' | 'done'; row: number }`
2. In `lib/constants.ts`, define:
   - `STORAGE_KEY = 'gantt_poc_tasks_v1'`
   - `MS_PER_DAY`, `DAYS_RANGE = 60`, `DAY_WIDTH = 24`, `ROW_HEIGHT` (e.g. 40)

**Commit:** `feat: add Task type and constants`

---

### Task 4: Date/time and task helpers

**Files:**
- Create: `lib/utils.ts`

**Steps:**
1. Implement `startOfTodayLocal(): Date` (start of today in local timezone).
2. Implement `clamp(n: number, min: number, max: number): number`.
3. Implement `addDaysISO(iso: string, deltaDays: number): string` (parse ISO, add days, return ISO).
4. Implement `toDatetimeLocalValue(iso: string): string` and `fromDatetimeLocalValue(value: string): string` for `<input type="datetime-local">`.
5. Implement `durationDays(task: Task): number` (ceil of (endAt - startAt) / MS_PER_DAY, min 1).
6. Export all from `lib/utils.ts`.

**Commit:** `feat: add date and task utility functions`

---

**Checkpoint — test and commit (Phase 1):**  
Test: `npm i` → `npm run dev` (app at http://localhost:3000); `npm run lint` and `npm run format:check` pass; commit triggers Husky (lint + format check). Commit all Phase 1 changes, then continue to Phase 2 in this plan.

---

## Phase 2: Storage and dummy data

### Task 5: localStorage load/save and row normalization

**Files:**
- Create: `lib/storage.ts`

**Steps:**
1. Implement `loadTasks(): Task[]` — parse JSON from `localStorage.getItem(STORAGE_KEY)`; on null/invalid return `[]`.
2. Implement `saveTasks(tasks: Task[]): void` — sort by `row`, then `normalizeRows(tasks)` (reassign row 0..n-1), then `localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))`.
3. Implement `normalizeRows(tasks: Task[]): Task[]` — return new array with `row` set to index 0..n-1.

**Commit:** `feat: add localStorage load/save and row normalization`

---

### Task 6: Dummy data generator

**Files:**
- Create: `lib/dummy-data.ts`

**Steps:**
1. Implement `generateDummyTasks(): Task[]` — ~50 tasks with `crypto.randomUUID()`, varied names, startAt/endAt within 60-day window from `startOfTodayLocal()`, random status, row 0..n-1.
2. Ensure min duration 1 day and endAt > startAt.

**Commit:** `feat: add dummy task generator`

---

**Checkpoint — test and commit (Phase 2):**  
Test: `npm run dev` (app loads); `npm run build` (no errors in `lib/storage.ts`, `lib/dummy-data.ts`). Commit all Phase 2 changes, then continue to Phase 3 in this plan.

---

## Phase 3: App state and CRUD

### Task 7: Page state and initial load

**Files:**
- Modify: `app/page.tsx`

**Steps:**
1. Add state: `tasks: Task[]`, `editingId: string | null`, form fields (name, startAt, endAt, status).
2. On mount (useEffect): if `loadTasks()` is empty, seed with `generateDummyTasks()` and save; else set tasks from `loadTasks()`.
3. Add effect: when `tasks` changes, call `saveTasks(tasks)`.
4. Keep a single source of truth for tasks in state; all mutations go through setters that update state (saveTasks called from effect).

**Commit:** `feat: page state, initial load, and persist on change`

---

### Task 8: TaskForm component (create/update)

**Files:**
- Create: `components/TaskForm.tsx`

**Steps:**
1. Props: `task | null` (when editing), `onSubmit`, `onCancelEdit`.
2. Controlled inputs: name (text), startAt (datetime-local), endAt (datetime-local), status (select).
3. Use `toDatetimeLocalValue` / `fromDatetimeLocalValue` for inputs.
4. Validation: endAt > startAt; min duration 1 day (reject or adjust).
5. Button: "Create" when no task, "Update" when editing; show "Cancel" when editing.
6. On submit: call `onSubmit` with payload; parent creates or updates task (new id with crypto.randomUUID() for create).

**Commit:** `feat: add TaskForm for create and update`

---

### Task 9: TaskTable component (list + delete + select for edit)

**Files:**
- Create: `components/TaskTable.tsx`

**Steps:**
1. Props: `tasks` (sorted by row), `onSelectForEdit`, `onDelete`, `onReorder` (optional for later).
2. Columns: drag handle (placeholder div/icon for now), Name, Start, End, Duration (computed with `durationDays`), Status, Actions (Delete button).
3. Row click (or “Edit” action) calls `onSelectForEdit(task)` so parent sets `editingId` and fills form.
4. Delete calls `onDelete(task.id)`; parent removes task, re-normalizes rows, updates state.

**Commit:** `feat: add TaskTable with edit and delete`

---

### Task 10: Wire TaskForm and TaskTable into page

**Files:**
- Modify: `app/page.tsx`

**Steps:**
1. Add handlers: create (append with new id, max row), update (by id, keep row), delete (remove, then normalize rows), selectForEdit, cancelEdit.
2. Render two-column layout (left: TaskForm + TaskTable; right: placeholder for Gantt).
3. Pass tasks, editingId, form state and handlers to TaskForm and TaskTable.
4. Verify CRUD and persistence (reset page and check localStorage).

**Commit:** `feat: wire TaskForm and TaskTable; CRUD and persistence working`

---

**Checkpoint — test and commit (Phase 3):**  
Test: Empty storage → refresh → ~50 dummy tasks; create/edit/delete tasks; refresh → persistence. Commit Phase 3 changes, then continue to Phase 4 in this plan.

---

## Phase 4: Gantt chart rendering

### Task 11: Gantt header and grid background

**Files:**
- Create: `components/GanttGrid.tsx`

**Steps:**
1. Props: `tasks` (sorted by row), `anchor` = start of today (from `startOfTodayLocal()`).
2. Timeline: 60 days; day width from constants.
3. Render header row: day numbers 0..59 (or actual dates).
4. Render grid: vertical lines every 24px; horizontal lines per row (row height from constants).
5. No bars yet; just layout and background.

**Commit:** `feat: Gantt header and grid`

---

### Task 12: Gantt bars (position and width from dates)

**Files:**
- Modify: `components/GanttGrid.tsx`

**Steps:**
1. For each task, compute:
   - `leftDays = floor((startAt - anchor) / MS_PER_DAY)` (anchor as start-of-day timestamp).
   - `widthDays = max(1, ceil((endAt - startAt) / MS_PER_DAY))`.
2. Clamp: leftDays in [0, 59], end day (leftDays + widthDays) clamped so bar stays in [0, 59].
3. Render one bar per task: left = leftDays * dayWidth, width = widthDays * dayWidth, top = row * rowHeight. Style distinctly (e.g. bg color by status).
4. Rows aligned with TaskTable order (same task list by row).

**Commit:** `feat: render Gantt bars from task dates`

---

**Checkpoint — test and commit (Phase 4):**  
Test: Gantt shows 60-day header, grid, bars aligned with table; bar length matches duration. Commit Phase 4 changes, then continue to Phase 5 in this plan.

---

## Phase 5: Bar interactions (pointer events)

### Task 13: Horizontal drag on bar body

**Files:**
- Modify: `components/GanttGrid.tsx`

**Steps:**
1. On bar body: pointerdown → set pointer capture, record start X and task startAt/endAt.
2. pointermove: compute delta in pixels → deltaDays (round to integer), apply to both startAt and endAt via `addDaysISO`; clamp bar to [0, 59] days; call `onUpdateTask(taskId, { startAt, endAt })`.
3. pointerup/pointercancel: release capture, remove move/up listeners.
4. Parent updates task in state; storage persists via existing effect.

**Commit:** `feat: horizontal drag on Gantt bar`

---

### Task 14: Resize handle (right edge)

**Files:**
- Modify: `components/GanttGrid.tsx`

**Steps:**
1. Add a narrow resize handle on the right edge of each bar (e.g. 4–6px).
2. pointerdown on handle: capture, record task endAt and start X.
3. pointermove: deltaDays from movement; new endAt = addDaysISO(endAt, deltaDays); enforce endAt > startAt and min duration 1 day; clamp to timeline; call `onUpdateTask(taskId, { endAt })`.
4. pointerup/pointercancel: release and cleanup.
5. Ensure resize and body drag don’t conflict (different targets).

**Commit:** `feat: resize bar from right handle`

---

**Checkpoint — test and commit (Phase 5):**  
Test: Drag bar body (dates update, persist); resize from right edge (end date only, min 1 day). Commit Phase 5 changes, then continue to Phase 6 in this plan.

---

## Phase 6: Vertical reorder

### Task 15: Row drag handle in TaskTable

**Files:**
- Modify: `components/TaskTable.tsx`

**Steps:**
1. Add a visible drag handle (e.g. grip icon or “⋮⋮”) in the first column.
2. pointerdown on handle: set `draggedTaskId`, `startY`, `originalIndex`; setPointerCapture.
3. pointermove: compute hover index from (currentY - containerTop) / rowHeight, clamp to [0, tasks.length-1]; show placeholder (e.g. line or empty row) at hover index.
4. pointerup: move task from originalIndex to hover index (array reorder), normalize rows, call `onReorder(newTasks)`; clear drag state and release capture.
5. Style: dragged row slightly transparent; placeholder clearly visible.

**Commit:** `feat: vertical reorder in TaskTable with row handle`

---

### Task 16: Optional row handle in Gantt row label area

**Files:**
- Modify: `components/GanttGrid.tsx`

**Steps:**
1. If Gantt has a left “label” column (task name or row index), add same drag-handle behavior there: same pointer logic, call same `onReorder` so table and Gantt stay in sync.
2. If no label column, skip or add a minimal left column with handle only. Document behavior in plan.

**Commit:** `feat: optional reorder handle in Gantt row area`

---

**Checkpoint — test and commit (Phase 6):**  
Test: Row drag handle reorders rows; placeholder visible; table and Gantt in sync; order persists; bar drag/resize unchanged. Commit Phase 6 changes, then continue to Phase 7 in this plan.

---

## Phase 7: Top bar and dummy data buttons

### Task 17: Top bar (Reset dummy data, Clear)

**Files:**
- Modify: `app/page.tsx` (or small `components/TopBar.tsx`)

**Steps:**
1. Top bar: title “Mini Gantt” + “Reset dummy data” + “Clear”.
2. Reset: replace tasks with `generateDummyTasks()`, save, clear editing.
3. Clear: set tasks to `[]`, save, clear editing.
4. Style with Tailwind; layout clean and minimal.

**Commit:** `feat: top bar with Reset and Clear`

---

**Checkpoint — test and commit (Phase 7):**  
Test: “Reset dummy data” and “Clear” work; form clears; state persists after refresh. Commit Phase 7 changes, then continue to Phase 8 in this plan.

---

## Phase 8: Polish and verification

### Task 18: Validation and edge cases

**Files:**
- Modify: `components/TaskForm.tsx`, `lib/utils.ts` or `lib/storage.ts` as needed

**Steps:**
1. Ensure create/update: endAt > startAt, duration ≥ 1 day (show error or auto-adjust in form).
2. After delete: normalize rows; after reorder: normalize rows.
3. Ensure Gantt bar clamping and drag/resize never leave timeline or break min duration.

**Commit:** `fix: validation and row normalization edge cases`

---

### Task 19: Run and manual test checklist

**Files:**
- None (verification)

**Steps:**
1. Run `npm i` and `npm run dev`.
2. Test: load with empty storage → dummy data appears; Reset → new dummy set; Clear → empty.
3. Test: create task, edit task, delete task; check table and Gantt and localStorage.
4. Test: horizontal drag on bar; resize from right handle; vertical reorder from table handle.
5. Confirm no console errors and persistence survives refresh.

**Commit:** (none; verification only)

---

### Task 20: README run instructions

**Files:**
- Create or update: `README.md`

**Steps:**
1. Add: run with `npm i` then `npm run dev`.
2. Brief description: single-page Mini Gantt POC, CRUD, drag/resize, reorder, localStorage.

**Commit:** `docs: add README run instructions`

---

**Checkpoint — test and commit (Phase 8):**  
Test: Full regression (dummy data, CRUD, drag, resize, reorder, Reset, Clear, persistence); form validation; README run instructions work. Commit Phase 8 changes. Plan complete.

---

## Summary (same plan, one document)

All phases above are **one implementation plan** in this file. Execute in order: for each phase, do the tasks → use the checkpoint to test and commit → then continue to the next phase in this plan. Use **executing-plans** or **subagent-driven-development** for task-by-task implementation.
