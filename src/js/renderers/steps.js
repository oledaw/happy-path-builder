import { state, escHtml, hexAlpha, getActor, getResult, getProcessForStep } from '../state.js';
import { RESULT_TYPE_COLORS, STEP_STATUS_COLORS } from '../constants.js';
import { getStepAfBadge } from './alternativeFlows.js';

export function toggleStepsViewMode() {
  state.stepsViewMode = state.stepsViewMode === 'full' ? 'compact' : 'full';
  renderSteps();
  // autoSave is called via window to avoid circular deps
  window.autoSave();
}

export function renderSteps() {
  const listEl  = document.getElementById('steps-list');
  const modeBtn = document.getElementById('steps-view-mode-btn');

  if (modeBtn) {
    modeBtn.textContent = state.stepsViewMode === 'compact'
      ? 'Widok: Kompaktowy'
      : 'Widok: Pełny';
  }

  listEl.classList.toggle('compact', state.stepsViewMode === 'compact');

  if (!state.steps.length) {
    listEl.innerHTML = _buildStepsEmptyState();
    return;
  }

  listEl.innerHTML = state.steps.map((step, i) => _buildStepRowHTML(step, i)).join('');
}

function _buildStepsEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">⟶</div>
      <div class="empty-title">Brak kroków</div>
      <div class="empty-sub">Dodaj pierwszy krok.</div>
    </div>`;
}

function _buildStepRowHTML(step, i) {
  const actor  = getActor(step.actor);
  const ac     = actor ? actor.color : '#888';
  const an     = actor ? actor.name  : 'Nieprzypisany';
  const proc   = getProcessForStep(step.id);
  const cbg    = proc ? hexAlpha(proc.color, 0.04) : 'var(--surface)';
  const isLast = i === state.steps.length - 1;

  return `
    <div class="step-row">
      <div class="step-connector">
        <div class="step-num" style="background:${ac}22;color:${ac};border:2px solid ${ac}44">
          ${i + 1}
        </div>
        <div class="step-line"></div>
      </div>
      <div class="step-card" draggable="true" data-id="${step.id}"
        style="background:${cbg}"
        ondragstart="onDragStart(event,'${step.id}')"
        ondragover="onDragOver(event,'${step.id}')"
        ondrop="onDrop(event,'${step.id}')"
        ondragleave="onDragLeave(event)"
        ondragend="onDragEnd(event)">
        ${_buildProcessTag(step, proc)}
        <div class="step-top">
          ${_buildActorBadge(step, ac, an)}
          <div class="step-actions-row">
            <button class="btn-icon" onclick="moveStep('${step.id}',-1)" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button class="btn-icon" onclick="moveStep('${step.id}',1)"  ${isLast  ? 'disabled' : ''}>↓</button>
            <button class="btn-icon" onclick="duplicateStep('${step.id}')">⎘</button>
            <button class="btn-icon danger" onclick="removeStep('${step.id}')">×</button>
          </div>
        </div>
        <input class="step-action-input"
          value="${escHtml(step.action)}"
          placeholder="Opisz akcję aktora..."
          onchange="updateStep('${step.id}','action',this.value)">
        <textarea class="step-desc-input" rows="2"
          placeholder="Szczegóły..."
          onchange="updateStep('${step.id}','desc',this.value)"
          oninput="autoResize(this)">${escHtml(step.desc)}</textarea>
        ${_buildStepResultsChips(step)}
        ${_buildStepBottom(step)}
      </div>
    </div>`;
}

function _buildProcessTag(step, proc) {
  if (proc) {
    return `
      <div class="step-process-tag"
        style="background:${hexAlpha(proc.color,0.12)};color:${proc.color};border-color:${hexAlpha(proc.color,0.25)}"
        onclick="editProcess('${proc.id}')">
        <span style="display:inline-block;width:6px;height:6px;border-radius:2px;background:${proc.color};flex-shrink:0"></span>
        ${escHtml(proc.name)}
      </div>`;
  }
  return `
    <div class="step-process-tag step-process-tag--unassigned"
      onclick="openProcessAssignForStep('${step.id}')">+ Proces</div>`;
}

function _buildActorBadge(step, ac, an) {
  const actorOptions = state.actors
    .map(a => `
      <div class="actor-option" onclick="setStepActor('${step.id}','${a.id}')">
        <div class="actor-dot" style="background:${a.color}"></div>
        ${escHtml(a.name)}
      </div>`)
    .join('');

  return `
    <div style="position:relative">
      <div class="step-actor-badge"
        onclick="toggleActorDropdown(event,'${step.id}')"
        style="border-color:${ac}44">
        <div class="step-actor-dot" style="background:${ac}"></div>
        ${an}
        <span class="step-actor-badge__caret">▾</span>
      </div>
      <div class="actor-dropdown hidden" id="dd-${step.id}">
        ${actorOptions}
      </div>
    </div>`;
}

function _buildStepResultsChips(step) {
  const chips = (step.results || [])
    .map(rid => {
      const r = getResult(rid);
      if (!r) return '';
      const col = RESULT_TYPE_COLORS[r.type] || '#888';
      return `
        <span class="chip" style="background:${col}22;color:${col}">
          ${escHtml(r.name)}
          <span class="chip-remove" onclick="unlinkResult('${step.id}','${rid}')">×</span>
        </span>`;
    })
    .join('');

  const linkBtn = (!step.results || !step.results.length)
    ? `<button class="compact-link-btn" onclick="openLinkModal('${step.id}')">+</button>`
    : '';

  return `
    <div class="step-results-chips">
      ${chips}
      ${linkBtn}
      ${getStepAfBadge(step.id)}
    </div>`;
}

function _buildStepBottom(step) {
  const hasResults = step.results && step.results.length;
  const sc = STEP_STATUS_COLORS;

  return `
    <div class="step-bottom">
      <button class="step-result-badge ${hasResults ? 'linked' : ''}"
        onclick="openLinkModal('${step.id}')">
        ${hasResults ? '+ Powiąż kolejny rezultat' : '+ Powiąż rezultat'}
      </button>
      <div class="step-status">
        <div class="status-dot" style="background:${sc[step.status]}"></div>
        <select class="step-status-select"
          onchange="updateStep('${step.id}','status',this.value)">
          <option value="todo"        ${step.status === 'todo'        ? 'selected' : ''}>do zrobienia</option>
          <option value="in-progress" ${step.status === 'in-progress' ? 'selected' : ''}>w toku</option>
          <option value="done"        ${step.status === 'done'        ? 'selected' : ''}>gotowe</option>
        </select>
      </div>
    </div>`;
}
