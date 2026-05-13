import { state, uid } from '../state.js';
import { renderStats } from '../renderers/stats.js';
import { renderTimeline } from '../renderers/timeline.js';
import { renderExport } from '../renderers/export.js';

export function addStep() {
  const actorId = state.actors.length ? state.actors[0].id : null;
  state.steps.push({
    id:      uid(),
    actor:   actorId,
    action:  '',
    desc:    '',
    results: [],
    status:  'todo',
  });

  window.render();
  window.autoSave();

  // Focus na nowo dodanym polu akcji
  setTimeout(() => {
    const inputs = document.querySelectorAll('.step-action-input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 50);
}

export function removeStep(id) {
  state.processes.forEach(p => { p.stepIds = p.stepIds.filter(s => s !== id); });
  state.steps = state.steps.filter(s => s.id !== id);
  window.render();
  window.autoSave();
}

export function duplicateStep(id) {
  const s = state.steps.find(x => x.id === id);
  if (!s) return;

  const idx  = state.steps.indexOf(s);
  const copy = { ...s, id: uid(), results: [...(s.results || [])] };
  state.steps.splice(idx + 1, 0, copy);

  window.render();
  window.autoSave();
}

export function moveStep(id, dir) {
  const idx    = state.steps.findIndex(s => s.id === id);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.steps.length) return;

  [state.steps[idx], state.steps[newIdx]] = [state.steps[newIdx], state.steps[idx]];
  window.render();
  window.autoSave();
}

export function updateStep(id, field, val) {
  const s = state.steps.find(x => x.id === id);
  if (s) s[field] = val;

  renderStats();
  window.autoSave();

  // Synchronizuj zależne widoki bez pełnego re-renderu
  if (state.currentView === 'timeline') renderTimeline();
  if (state.currentView === 'export')   renderExport();
}

export function unlinkResult(sid, rid) {
  const s = state.steps.find(x => x.id === sid);
  if (s) s.results = s.results.filter(r => r !== rid);
  window.render();
  window.autoSave();
}

export function setStepActor(sid, aid) {
  const s = state.steps.find(x => x.id === sid);
  if (s) s.actor = aid;
  closeAllDropdowns();
  window.render();
  window.autoSave();
}

// ── Actor dropdown ────────────────────────────────────────────────────────────
export function toggleActorDropdown(e, sid) {
  e.stopPropagation();
  closeAllDropdowns();
  document.getElementById(`dd-${sid}`)?.classList.remove('hidden');
}

export function closeAllDropdowns() {
  document.querySelectorAll('.actor-dropdown').forEach(d => d.classList.add('hidden'));
}

document.addEventListener('click', closeAllDropdowns);

// ── Drag & drop kroków ────────────────────────────────────────────────────────
export function onDragStart(e, id) {
  state.dragStepId = id;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

export function onDragOver(e, id) {
  e.preventDefault();
  if (state.dragStepId === id) return;
  e.currentTarget.classList.add('drag-over');
}

export function onDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }

export function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging', 'drag-over');
  state.dragStepId = null;
}

export function onDrop(e, id) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (state.dragStepId === id) return;

  const from = state.steps.findIndex(s => s.id === state.dragStepId);
  const to   = state.steps.findIndex(s => s.id === id);
  if (from === -1 || to === -1) return;

  const [removed] = state.steps.splice(from, 1);
  state.steps.splice(to, 0, removed);

  state.dragStepId = null;
  window.render();
  window.autoSave();
}
