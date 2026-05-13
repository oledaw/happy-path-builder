import { state, escHtml } from '../state.js';

export function renderProcesses() {
  const el = document.getElementById('processes-list');

  if (!state.processes.length) {
    el.innerHTML = '<div class="processes-list__empty">Brak procesów.</div>';
    return;
  }

  el.innerHTML = state.processes.map(p => _buildProcessChipHTML(p)).join('');
}

function _buildProcessChipHTML(p) {
  const count = p.stepIds.filter(sid => state.steps.find(s => s.id === sid)).length;

  return `
    <div class="process-chip" style="border-left:3px solid ${p.color}">
      <div class="process-swatch" style="background:${p.color}"></div>
      <input class="process-name-input"
        value="${escHtml(p.name)}"
        onchange="renameProcess('${p.id}', this.value)"
        onkeydown="if(event.key==='Enter') this.blur()">
      <span class="process-step-count">${count}k</span>
      <button class="btn-icon" onclick="editProcess('${p.id}')"
        style="width:22px;height:22px;font-size:11px">✎</button>
      <button class="btn-icon danger" onclick="removeProcess('${p.id}')"
        style="width:22px;height:22px;font-size:12px">×</button>
    </div>`;
}
