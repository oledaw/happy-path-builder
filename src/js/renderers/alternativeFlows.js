import { state, escHtml } from '../state.js';
import { SEV_LABELS } from '../constants.js';

let afFilter     = 'all';
let afStepFilter = 'all';

export function setAfSeverity(filter, btn) {
  afFilter = filter;
  document.querySelectorAll('#af-filters .af-filter-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAf();
}

export function setAfStep(sid, btn) {
  afStepFilter = (afStepFilter === sid) ? 'all' : sid;
  document.querySelectorAll('#af-step-filters .af-step-filter-btn')
    .forEach(b => b.classList.remove('active'));
  if (afStepFilter !== 'all') btn.classList.add('active');
  renderAf();
}

export function resetAfFilters() {
  afFilter     = 'all';
  afStepFilter = 'all';
}

export function setAfStepFilter(sid) {
  afStepFilter = sid;
}

function renderAfStepFilters() {
  const el = document.getElementById('af-step-filters');
  if (!el) return;

  if (!state.steps.length) {
    el.innerHTML = '<span class="af-filters__empty">brak kroków</span>';
    return;
  }

  const html = state.steps
    .map((s, i) => {
      const actor    = state.actors.find(a => a.id === s.actor);
      const col      = actor ? actor.color : '#888';
      const isActive = afStepFilter === s.id;
      const count    = (state.alternativeFlows || [])
        .filter(af => (af.relatedSteps || []).includes(s.id)).length;

      if (!count) return '';

      return `
        <button class="af-step-filter-btn af-filter-btn ${isActive ? 'active' : ''}"
          onclick="setAfStep('${s.id}', this)"
          style="${isActive
            ? `background:${col}22;color:${col};border-color:${col}66`
            : `border-color:${col}44;color:var(--text3)`}">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${col};margin-right:4px;vertical-align:middle"></span>
          k.${i + 1} <span style="opacity:.6">${count}</span>
        </button>`;
    })
    .join('');

  el.innerHTML = html.trim() || '<span class="af-filters__empty">żaden krok nie ma AF</span>';
}

export function renderAf() {
  renderAfStepFilters();

  const afs = state.alternativeFlows || [];
  const el  = document.getElementById('af-list');
  if (!el) return;

  const filtered = afs.filter(af => {
    const sevOk  = afFilter === 'all'     ? true
                 : afFilter === 'manual'  ? af.requiresManualReview
                 : af.severity === afFilter;
    const stepOk = afStepFilter === 'all' ? true
                 : (af.relatedSteps || []).includes(afStepFilter);
    return sevOk && stepOk;
  });

  if (!filtered.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">↝</div>
        <div class="empty-title">${afs.length ? 'Brak wyników dla tego filtra' : 'Brak Alternate Flows'}</div>
      </div>`;
    return;
  }

  el.innerHTML = filtered.map(af => _buildAfCardHTML(af)).join('');
}

function _buildAfCardHTML(af) {
  const stepChips = (af.relatedSteps || []).map(sid => {
    const s   = state.steps.find(x => x.id === sid);
    const idx = state.steps.indexOf(s);
    return s
      ? `<span class="af-step-chip" onclick="setView('steps')">
           k.${idx + 1} ${escHtml(s.action.slice(0, 20))}${s.action.length > 20 ? '…' : ''}
         </span>`
      : `<span class="af-step-chip unlinked">${sid}</span>`;
  }).join('');

  return `
    <div class="af-card ${af.requiresManualReview ? 'manual' : ''}">
      <div class="af-card-top">
        <div class="af-title-row">
          <span class="af-id">${af.id}</span>
          <span class="af-title">${escHtml(af.title)}</span>
          <span class="sev-badge sev-${af.severity}">${SEV_LABELS[af.severity] || af.severity}</span>
          ${af.requiresManualReview ? '<span class="manual-badge">MANUAL</span>' : ''}
        </div>
        <div class="af-card__actions">
          <button class="btn-icon" onclick="editAf('${af.id}')"
            style="width:22px;height:22px;font-size:11px">✎</button>
          <button class="btn-icon danger" onclick="removeAf('${af.id}')"
            style="width:22px;height:22px;font-size:12px">×</button>
        </div>
      </div>
      <div class="af-trigger"><strong>Trigger:</strong> ${escHtml(af.trigger)}</div>
      <div class="af-body">${escHtml(af.outcome)}</div>
      ${(af.relatedSteps || []).length
        ? `<div class="af-steps-row">
             <span class="af-steps-label">Powiązane kroki:</span>
             ${stepChips}
           </div>`
        : ''}
    </div>`;
}

export function getStepAfBadge(stepId) {
  const count = (state.alternativeFlows || [])
    .filter(af => (af.relatedSteps || []).includes(stepId)).length;

  if (!count) return '';

  return `<span class="step-af-badge" onclick="goToStepAfs('${stepId}')">${count} alt</span>`;
}

export function goToStepAfs(stepId) {
  afFilter     = 'all';
  afStepFilter = stepId;
  // setView is exposed on window by main.js
  window.setView('af');
  document.querySelectorAll('#af-filters .af-filter-btn')
    .forEach((b, i) => b.classList.toggle('active', i === 0));
}
