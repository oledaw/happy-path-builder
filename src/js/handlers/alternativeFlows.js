import { state, uid, escHtml } from '../state.js';
import { openModal, closeModal } from '../ui/modal.js';
import { showToast } from '../ui/toast.js';
import { renderAf } from '../renderers/alternativeFlows.js';
import { renderStats } from '../renderers/stats.js';

export function openAfModal(editId) {
  state.editingAfId = editId || null;
  const af = editId
    ? (state.alternativeFlows || []).find(x => x.id === editId)
    : null;

  document.getElementById('af-modal-title').textContent    = af ? 'Edytuj Alternate Flow' : 'Nowy Alternate Flow';
  document.getElementById('af-modal-save-btn').textContent = af ? 'Zapisz zmiany' : 'Dodaj';
  document.getElementById('af-title-input').value          = af ? af.title   : '';
  document.getElementById('af-trigger-input').value        = af ? af.trigger : '';
  document.getElementById('af-outcome-input').value        = af ? af.outcome : '';
  document.getElementById('af-severity-input').value       = af ? af.severity : 'medium';
  document.getElementById('af-manual-input').checked       = af ? !!af.requiresManualReview : false;

  _renderAfStepsSelector(af ? (af.relatedSteps || []) : []);
  openModal('af-modal');
}

function _renderAfStepsSelector(linked) {
  const sel = document.getElementById('af-steps-selector');
  if (!sel) return;

  sel.innerHTML = state.steps.map((s, i) => {
    const isLinked = linked.includes(s.id);
    return `
      <span class="af-step-chip ${isLinked ? '' : 'unlinked'}"
        style="${isLinked ? 'border-color:var(--accent);color:var(--accent)' : ''}"
        onclick="toggleAfStep('${s.id}', this)">
        k.${i + 1} ${escHtml(s.action.slice(0, 22))}${s.action.length > 22 ? '…' : ''}
      </span>`;
  }).join('');
}

export function toggleAfStep(sid, el) {
  el.classList.toggle('unlinked');
  if (el.classList.contains('unlinked')) {
    el.style.borderColor = '';
    el.style.color       = '';
  } else {
    el.style.borderColor = 'var(--accent)';
    el.style.color       = 'var(--accent)';
  }
}

export function saveAf() {
  const title = document.getElementById('af-title-input').value.trim();
  if (!title) return;

  // Odczytaj zaznaczone kroki z DOM (toggle approach)
  const relatedSteps = [
    ...document.querySelectorAll('#af-steps-selector .af-step-chip:not(.unlinked)'),
  ]
    .map(el => {
      // Wyciągamy ID z atrybutu onclick: toggleAfStep('ID', this)
      const match = el.getAttribute('onclick').match(/'([^']+)'/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  const data = {
    id:                   state.editingAfId || ('af' + uid()),
    title,
    trigger:              document.getElementById('af-trigger-input').value.trim(),
    outcome:              document.getElementById('af-outcome-input').value.trim(),
    severity:             document.getElementById('af-severity-input').value,
    requiresManualReview: document.getElementById('af-manual-input').checked,
    relatedSteps,
  };

  if (!state.alternativeFlows) state.alternativeFlows = [];

  if (state.editingAfId) {
    const idx = state.alternativeFlows.findIndex(x => x.id === state.editingAfId);
    if (idx !== -1) state.alternativeFlows[idx] = data;
    showToast('AF zaktualizowany', 'var(--accent)');
  } else {
    state.alternativeFlows.push(data);
    showToast('AF dodany', 'var(--accent3)');
  }

  closeModal('af-modal');
  renderAf();
  renderStats();
  window.autoSave();
}

export function editAf(id)   { openAfModal(id); }

export function removeAf(id) {
  state.alternativeFlows = (state.alternativeFlows || []).filter(x => x.id !== id);
  renderAf();
  renderStats();
  window.autoSave();
}
