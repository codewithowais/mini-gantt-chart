/**
 * Modern theme: white-led surfaces, soft gray background, teal accent.
 * Single source of truth for colors and UI strings.
 */

// —— Body & layout ——
export const body = 'bg-brand-background text-brand-ink antialiased';

// —— Surfaces (white-first for cards and modals) ——
export const surface = {
  page: 'bg-brand-background',
  card: 'bg-brand-white',
  elevated: 'bg-brand-border-light',
  hover: 'bg-brand-background-hover',
  hoverStrong: 'bg-brand-background-hover',
  cellHover: 'bg-brand-border-light',
};

// —— Borders (neutral, subtle) ——
export const border = {
  default: 'border-brand-border',
  light: 'border-brand-border-light',
};

// —— Typography (clear hierarchy) ——
export const text = {
  heading: 'text-brand-ink',
  body: 'text-brand-ink',
  muted: 'text-brand-ink-muted',
  mutedLight: 'text-brand-ink-muted',
  icon: 'text-brand-ink-subtle',
  placeholder: 'placeholder-brand-ink-subtle',
};

// —— Primary (accent teal – CTAs, focus, links) ——
export const primary = {
  button:
    'bg-brand-accent text-white shadow-card hover:bg-brand-accent-hover hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 active:scale-[0.98]',
  buttonBase:
    'transition-smooth inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
  inputFocus:
    'focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:ring-offset-0',
  ring: 'focus:ring-brand-accent',
  ringMuted: 'focus:ring-brand-accent/30',
  ringMuted20: 'focus:ring-brand-accent/20',
  link: 'text-brand-accent',
  linkHover: 'hover:bg-brand-accent-light',
  resizeHandleHover: 'hover:bg-brand-accent-muted/50',
};

// —— Accent (secondary accent usage) ——
export const accent = {
  button:
    'bg-brand-accent text-white shadow-card hover:bg-brand-accent-hover hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 active:scale-[0.98]',
};

// —— Secondary (neutral buttons) ——
export const secondary = {
  button:
    'border border-brand-border bg-brand-white text-brand-ink-muted hover:bg-brand-background-hover focus:outline-none focus:ring-2 focus:ring-brand-border focus:ring-offset-2 active:scale-[0.98]',
  buttonBase: 'transition-smooth rounded-xl px-5 py-2.5 text-sm font-medium',
};

// —— Danger ——
export const danger = {
  alert: 'bg-red-50 text-red-700',
  button:
    'text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1',
  buttonBase: 'transition-fast rounded px-2 py-1 text-xs font-medium hover:scale-105 active:scale-95',
};

// —— Status (todo / doing / done) – soft fills ——
export const status: Record<'todo' | 'doing' | 'done', string> = {
  todo: 'bg-brand-teal-light border border-brand-teal/40',
  doing: 'bg-brand-mint-light border border-brand-mint/50',
  done: 'bg-brand-aqua-light border border-brand-aqua/50',
};

// —— Category colors: gradients + shadow (Gantt bars & table pills) ——
export const categoryColors: Record<string, string> = {
  Frontend:
    'bg-gradient-to-r from-brand-dark to-brand-dark-light border border-brand-dark/90 text-white shadow-gantt hover:shadow-gantt-hover',
  Backend:
    'bg-gradient-to-r from-brand-teal to-brand-mint border border-brand-teal/90 text-white shadow-gantt hover:shadow-gantt-hover',
  DevOps:
    'bg-gradient-to-r from-brand-mint to-brand-aqua border border-brand-mint/90 text-white shadow-gantt hover:shadow-gantt-hover',
  Design:
    'bg-gradient-to-r from-brand-aqua to-brand-mint border border-brand-aqua/90 text-white shadow-gantt hover:shadow-gantt-hover',
  Other:
    'bg-gradient-to-r from-brand-border-light to-brand-teal/20 border border-brand-border text-brand-ink shadow-card',
};

/** Resolve category color; falls back to Other for unknown categories. */
export function getCategoryColor(category: string): string {
  const key = category?.trim() || 'Other';
  return categoryColors[key] ?? categoryColors.Other;
}

// —— Compound components ——
export const theme = {
  body,
  surface,
  border,

  pageTitle: `font-heading text-display font-bold md:text-display-md ${text.heading}`,
  pageSubtitle: `mt-1.5 text-sm font-medium ${text.muted}`,
  btnPrimary: `transition-smooth rounded-xl ${primary.buttonBase} ${primary.button}`,
  btnSecondary: `transition-smooth rounded-xl ${secondary.buttonBase} ${secondary.button}`,

  card: `rounded-2xl border ${border.default} ${surface.card} shadow-card`,
  cardSm: `rounded-2xl border ${border.default} ${surface.card} shadow-card hover:shadow-card-hover`,
  modalPanel: `rounded-2xl border ${border.default} ${surface.card} shadow-modal`,
  formSection: `rounded-2xl border ${border.default} bg-brand-white p-6 shadow-card`,

  tableHeader: `border-b ${border.default} ${surface.elevated} text-xs font-semibold uppercase tracking-wide ${text.muted}`,
  tableHeaderSm: `border-b ${border.default} ${surface.elevated} px-3 text-xs font-medium ${text.muted}`,
  tableRow: `border-b ${border.light} last:border-b-0 ${surface.hover}`,
  tableRowGantt: `border-b ${border.light} ${text.body} ${surface.hover}`,
  ganttDateCell: `border-r ${border.default} text-xs font-semibold ${text.muted} last:border-r-0 ${surface.cellHover}`,

  input: `transition-fast w-full rounded-xl border ${border.default} bg-brand-white px-4 py-2.5 text-sm ${text.heading} ${text.placeholder} ${primary.inputFocus}`,
  label: `mb-1.5 block text-sm font-medium ${text.muted}`,

  errorAlert: `rounded-xl ${danger.alert} px-4 py-2.5 text-sm`,
  btnEdit: `transition-fast rounded px-2 py-1 text-xs font-medium ${primary.link} ${primary.linkHover} focus:outline-none focus:ring-2 ${primary.ring} focus:ring-offset-1 hover:scale-105 active:scale-95`,
  btnDanger: `transition-fast rounded px-2 py-1 text-xs font-medium ${danger.button} ${danger.buttonBase}`,

  overlay: 'bg-brand-ink/20 backdrop-blur-sm',
  modalHeader: `flex items-center justify-between border-b ${border.light} px-6 py-4`,
  modalTitle: `font-heading text-lg font-semibold ${text.heading}`,
  modalClose:
    'rounded-lg p-2 text-brand-ink-subtle hover:bg-brand-background-hover hover:text-brand-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:ring-offset-2',

  ganttLabelCol: `flex shrink-0 flex-col border-r ${border.default}`,
  resizeHandle: `cursor-ew-resize shrink-0 ${primary.resizeHandleHover}`,
  taskName: `font-medium ${text.heading}`,
  dragHandle: `shrink-0 cursor-grab ${text.icon}`,
  statusBadge: 'rounded-md border px-2 py-1 text-sm shadow-card',
} as const;
