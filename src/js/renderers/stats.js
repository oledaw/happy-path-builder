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
}
