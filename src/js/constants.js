// ── Paleta kolorów ──────────────────────────────────────────────────────────
export const COLORS = [
  '#7c6ff7', '#5ad4b0', '#f7a25e', '#f25e8a',
  '#4db8f5', '#c77dff', '#ffd166', '#ff6b6b',
];

// ── Rezultaty ───────────────────────────────────────────────────────────────
export const RESULT_TYPE_COLORS = {
  output: '#5ad4b0',
  state: '#7c6ff7',
  action: '#f7a25e',
  notification: '#4db8f5',
};

export const RESULT_TYPE_LABELS = {
  output: 'OUTPUT',
  state: 'STAN',
  action: 'AKCJA',
  notification: 'NOTIF',
};

// ── Statusy kroków ──────────────────────────────────────────────────────────
export const STEP_STATUS_COLORS = {
  done: '#5ad4b0',
  'in-progress': '#f7a25e',
  todo: '#5a5a78',
};

// ── Severity labels (Alternate Flows) ───────────────────────────────────────
export const SEV_LABELS = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

// ── Zoom ────────────────────────────────────────────────────────────────────
export const ZOOM_MIN  = 0.15;
export const ZOOM_MAX  = 3.0;
export const ZOOM_STEP = 0.15;

// ── localStorage keys ───────────────────────────────────────────────────────
export const LS_KEY     = 'hpb_projects';
export const LS_CURRENT = 'hpb_current_project';
export const LS_PANEL   = 'hpb_panel';
