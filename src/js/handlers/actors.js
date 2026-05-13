import { state, uid } from '../state.js';
import { COLORS } from '../constants.js';
import { closeModal } from '../ui/modal.js';
import { renderActors } from '../renderers/actors.js';
import { renderSteps } from '../renderers/steps.js';

export function addActor() {
  const inp  = document.getElementById('new-actor-input');
  const name = inp.value.trim();
  if (!name) return;

  state.actors.push({
    id:    uid(),
    name,
    color: COLORS[state.actors.length % COLORS.length],
  });

  inp.value = '';
  window.render();
  window.autoSave();
}

export function removeActor(id) {
  state.actors = state.actors.filter(a => a.id !== id);
  state.steps.forEach(s => {
    if (s.actor === id) s.actor = state.actors[0]?.id || null;
  });
  window.render();
  window.autoSave();
}

export function renameActor(id, name) {
  const a = state.actors.find(x => x.id === id);
  if (a && name.trim()) {
    a.name = name.trim();
    renderSteps();
    window.autoSave();
  }
}

export function saveActor() {
  const name = document.getElementById('actor-name-input').value.trim();
  if (!name) return;

  state.actors.push({ id: uid(), name, color: state.pendingActorColor });
  closeModal('actor-modal');
  window.render();
  window.autoSave();
}

// ── Drag & drop aktorów ──────────────────────────────────────────────────────
export function onActorDragStart(e, id) {
  state.dragActorId = id;
  e.dataTransfer.effectAllowed = 'move';
}

export function onActorDragOver(e, id) {
  e.preventDefault();
  if (state.dragActorId === id) return;
  e.currentTarget.classList.add('actor-drag-over');
}

export function onActorDragLeave(e) {
  e.currentTarget.classList.remove('actor-drag-over');
}

export function onActorDragEnd(e) {
  e.currentTarget.classList.remove('actor-drag-over');
  state.dragActorId = null;
}

export function onActorDrop(e, id) {
  e.preventDefault();
  e.currentTarget.classList.remove('actor-drag-over');

  if (!state.dragActorId || state.dragActorId === id) return;

  const from = state.actors.findIndex(a => a.id === state.dragActorId);
  const to   = state.actors.findIndex(a => a.id === id);
  if (from === -1 || to === -1) return;

  const [removed] = state.actors.splice(from, 1);
  state.actors.splice(to, 0, removed);

  state.dragActorId = null;
  renderActors();
  window.autoSave();
}

// ── Color picker ─────────────────────────────────────────────────────────────
export function initActorColorSwatches() {
  document.getElementById('actor-color-row').innerHTML = COLORS
    .map(c => `
      <div class="color-swatch ${c === state.pendingActorColor ? 'selected' : ''}"
        style="background:${c}"
        onclick="selectActorColor('${c}', this)"></div>`)
    .join('');
}

export function selectActorColor(c, el) {
  state.pendingActorColor = c;
  document.querySelectorAll('#actor-color-row .color-swatch')
    .forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}
