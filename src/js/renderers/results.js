import { state, escHtml } from '../state.js';
import { RESULT_TYPE_COLORS, RESULT_TYPE_LABELS } from '../constants.js';

export function renderResults() {
  const el = document.getElementById('results-list');

  if (!state.results.length) {
    el.innerHTML = '<div class="results-list__empty">Brak rezultatów.</div>';
    return;
  }

  el.innerHTML = state.results.map(r => _buildResultItemHTML(r)).join('');
}

function _buildResultItemHTML(r) {
  const col    = RESULT_TYPE_COLORS[r.type] || '#888';
  const uses   = state.steps.filter(s => (s.results || []).includes(r.id));
  const labels = uses.map(s => `k.${state.steps.indexOf(s) + 1}`).join(', ');

  const usageBadge = uses.length
    ? `<span class="result-badge result-badge--used">✓ ${labels}</span>`
    : `<span class="result-badge result-badge--unused">nieprzypisany</span>`;

  return `
    <div class="result-item" style="border-left:3px solid ${col}"
      draggable="true" data-rid="${r.id}"
      ondragstart="onResultDragStart(event,'${r.id}')"
      ondragover="onResultDragOver(event,'${r.id}')"
      ondrop="onResultDrop(event,'${r.id}')"
      ondragleave="onResultDragLeave(event)"
      ondragend="onResultDragEnd(event)">
      <div class="result-item__header">
        <div class="result-item__type-row">
          <span class="drag-handle">⠿</span>
          <span class="result-type-badge" style="background:${col}22;color:${col}">
            ${RESULT_TYPE_LABELS[r.type]}
          </span>
        </div>
        ${usageBadge}
      </div>
      <div class="ri-title">${escHtml(r.name)}</div>
      <div class="ri-desc">${escHtml(r.desc)}</div>
      <div class="result-item__actions">
        <button class="btn-icon" onclick="duplicateResult('${r.id}')"
          style="width:22px;height:22px;font-size:11px">⎘</button>
        <button class="btn-icon" onclick="editResult('${r.id}')"
          style="width:22px;height:22px;font-size:11px">✎</button>
        <button class="btn-icon danger" onclick="removeResult('${r.id}')"
          style="width:22px;height:22px;font-size:12px">×</button>
      </div>
    </div>`;
}
