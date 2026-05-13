import { state, uid, escHtml } from '../state.js';
import { RESULT_TYPE_COLORS, RESULT_TYPE_LABELS } from '../constants.js';
import { openModal, closeModal } from '../ui/modal.js';
import { showToast } from '../ui/toast.js';
import { renderSteps } from '../renderers/steps.js';
import { renderResults } from '../renderers/results.js';
import { renderStats } from '../renderers/stats.js';

export function addResult() {
  state.editingResultId = null;
  document.getElementById('result-modal-title').textContent    = 'Nowy rezultat';
  document.getElementById('result-modal-save-btn').textContent = 'Dodaj rezultat';
  document.getElementById('result-name-input').value           = '';
  document.getElementById('result-desc-input').value           = '';
  document.getElementById('result-type-input').value           = 'output';

  openModal('result-modal');
  setTimeout(() => document.getElementById('result-name-input').focus(), 100);
}

export function editResult(id) {
  const r = state.results.find(x => x.id === id);
  if (!r) return;

  state.editingResultId = id;
  document.getElementById('result-modal-title').textContent    = 'Edytuj rezultat';
  document.getElementById('result-modal-save-btn').textContent = 'Zapisz zmiany';
  document.getElementById('result-name-input').value           = r.name;
  document.getElementById('result-desc-input').value           = r.desc;
  document.getElementById('result-type-input').value           = r.type;

  openModal('result-modal');
  setTimeout(() => document.getElementById('result-name-input').focus(), 100);
}

export function saveResult() {
  const name = document.getElementById('result-name-input').value.trim();
  if (!name) return;

  const desc = document.getElementById('result-desc-input').value.trim();
  const type = document.getElementById('result-type-input').value;

  if (state.editingResultId) {
    const r = state.results.find(x => x.id === state.editingResultId);
    if (r) { r.name = name; r.desc = desc; r.type = type; }
    state.editingResultId = null;
    showToast('Rezultat zaktualizowany', 'var(--accent)');
  } else {
    state.results.push({ id: uid(), name, desc, type });
  }

  closeModal('result-modal');
  window.render();
  window.autoSave();
}

export function removeResult(id) {
  state.results = state.results.filter(r => r.id !== id);
  state.steps.forEach(s => {
    s.results = (s.results || []).filter(r => r !== id);
  });
  window.render();
  window.autoSave();
}

export function duplicateResult(id) {
  const r = state.results.find(x => x.id === id);
  if (!r) return;

  const idx  = state.results.indexOf(r);
  const copy = { ...r, id: uid(), name: r.name + ' (Kopia)' };
  state.results.splice(idx + 1, 0, copy);

  renderResults();
  renderStats();
  window.autoSave();
  showToast('Rezultat zduplikowany', 'var(--accent)');
}

// ── Link modal ───────────────────────────────────────────────────────────────
export function openLinkModal(stepId) {
  state.linkingStepId = stepId;
  _renderLinkModalContent(stepId);
  openModal('link-modal');
}

function _renderLinkModalContent(stepId) {
  const step   = state.steps.find(s => s.id === stepId);
  const linked = step ? (step.results || []) : [];
  const el     = document.getElementById('link-results-list');

  if (!state.results.length) {
    el.innerHTML = '<div class="link-results-list__empty">Brak rezultatów.</div>';
    return;
  }

  el.innerHTML = state.results.map(r => {
    const col      = RESULT_TYPE_COLORS[r.type];
    const isLinked = linked.includes(r.id);

    return `
      <div class="link-result-row" style="border-color:${isLinked ? col : 'var(--border)'}">
        <div>
          <div class="link-result-row__top">
            <span class="result-type-badge" style="background:${col}22;color:${col}">
              ${RESULT_TYPE_LABELS[r.type]}
            </span>
            <span class="link-result-row__name">${escHtml(r.name)}</span>
          </div>
          <div class="link-result-row__desc">${escHtml(r.desc)}</div>
        </div>
        <button class="btn btn-sm ${isLinked ? 'btn-ghost' : 'btn-success'}"
          onclick="${isLinked
            ? `unlinkResultFromModal('${r.id}')`
            : `linkResult('${r.id}')`}">
          ${isLinked ? 'Odepnij' : 'Powiąż'}
        </button>
      </div>`;
  }).join('');
}

export function linkResult(rid) {
  const s = state.steps.find(x => x.id === state.linkingStepId);
  if (s && !s.results.includes(rid)) {
    s.results.push(rid);
    _renderLinkModalContent(state.linkingStepId);
    renderSteps();
    renderStats();
    window.autoSave();
  }
}

export function unlinkResultFromModal(rid) {
  const s = state.steps.find(x => x.id === state.linkingStepId);
  if (s) s.results = s.results.filter(r => r !== rid);
  _renderLinkModalContent(state.linkingStepId);
  renderSteps();
  renderStats();
  window.autoSave();
}

// ── Drag & drop rezultatów ───────────────────────────────────────────────────
export function onResultDragStart(e, id) {
  state.dragResultId = id;
  e.dataTransfer.effectAllowed = 'move';
}

export function onResultDragOver(e, id) {
  e.preventDefault();
  if (state.dragResultId === id) return;
  e.currentTarget.classList.add('result-drag-over');
}

export function onResultDragLeave(e) { e.currentTarget.classList.remove('result-drag-over'); }

export function onResultDragEnd(e) {
  e.currentTarget.classList.remove('result-drag-over');
  state.dragResultId = null;
}

export function onResultDrop(e, id) {
  e.preventDefault();
  e.currentTarget.classList.remove('result-drag-over');
  if (!state.dragResultId || state.dragResultId === id) return;

  const from = state.results.findIndex(r => r.id === state.dragResultId);
  const to   = state.results.findIndex(r => r.id === id);
  if (from === -1 || to === -1) return;

  const [removed] = state.results.splice(from, 1);
  state.results.splice(to, 0, removed);

  state.dragResultId = null;
  renderResults();
  window.autoSave();
}
