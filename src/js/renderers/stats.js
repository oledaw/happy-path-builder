import { state } from '../state.js';

export function renderStats() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('stat-steps',     state.steps.length);
  set('stat-actors',    state.actors.length);
  set('stat-processes', state.processes.length);
  set('stat-results',   state.results.length);
  set('stat-af',        (state.alternativeFlows || []).length);

  _renderStatsBarControls();
}

function _renderStatsBarControls() {
  const controlsEl = document.getElementById('stats-bar-controls');
  if (!controlsEl) return;

  let html = '';

  // View-specific controls
  if (state.currentView === 'steps') {
    html += `<button class="btn btn-ghost btn-sm" onclick="toggleStepsViewMode()" id="steps-view-mode-btn">
      Widok: Pełny
    </button>`;
  }

  if (state.currentView === 'timeline') {
    html += `<button class="btn btn-ghost btn-sm btn--icon-left" onclick="openFullscreen()">
      <span>⛶</span> Pełny ekran
    </button>`;
  }

  if (state.currentView === 'export') {
    html += `<button class="btn btn-ghost btn-sm" id="export-format-toggle" onclick="toggleExportFormat()">Sformatowany</button>`;
    html += `<button class="btn btn-ghost btn-sm" onclick="copyExport()">Kopiuj</button>`;
  }

  controlsEl.innerHTML = html;
}
