import { state, escHtml, hexAlpha, getProcessForStep } from '../state.js';

export function renderTimeline() {
  const el  = document.getElementById('timeline-content');
  const sub = document.getElementById('tl-toolbar-sub');

  if (sub) sub.textContent = `${state.steps.length} kroków · ${state.actors.length} aktorów`;

  if (!state.actors.length || !state.steps.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-title">Dodaj aktorów i kroki</div></div>';
    return;
  }

  const minW   = state.actors.length * 160;
  const header = _buildTlHeader();
  const rows   = _buildTlRows();

  el.innerHTML = `
    <div style="display:inline-block;min-width:${minW}px;width:100%">
      ${header}
      <div>${rows}</div>
    </div>`;
}

function _buildTlHeader() {
  const cols = state.actors
    .map(a => `
      <div class="tl-actor-col" style="color:${a.color};border-bottom-color:${a.color}">
        <div style="width:8px;height:8px;border-radius:50%;background:${a.color};display:inline-block;margin-right:6px"></div>
        ${escHtml(a.name)}
      </div>`)
    .join('');

  return `<div style="display:flex;position:sticky;top:0;z-index:10;background:var(--bg)">${cols}</div>`;
}

function _buildTlRows() {
  const seenProcesses = new Set();

  return state.steps.map((step, i) => {
    const proc    = getProcessForStep(step.id);
    const pc      = proc ? proc.color : null;
    const rowBg   = pc ? hexAlpha(pc, 0.07) : 'transparent';
    const isFirst = proc && !seenProcesses.has(proc.id);
    if (proc) seenProcesses.add(proc.id);

    const bTop      = isFirst ? `border-top:2px solid ${hexAlpha(pc, 0.5)};` : '';
    const watermark = proc
      ? `<div class="tl-process-label">
           <span class="tl-process-label-text" style="color:${pc}">${escHtml(proc.name)}</span>
         </div>`
      : '';

    const cells = state.actors.map(a => {
      if (a.id !== step.actor) return '<div class="tl-cell"></div>';
      return `
        <div class="tl-cell">
          <div class="tl-step-bubble" style="border-color:${a.color}55;border-left:3px solid ${a.color}">
            <div class="tl-step-num">krok ${i + 1}</div>
            ${escHtml(step.action)}
          </div>
        </div>`;
    }).join('');

    return `
      <div class="tl-row ${isFirst ? 'process-first' : ''}"
        style="background:${rowBg};${bTop}">
        ${watermark}${cells}
      </div>`;
  }).join('');
}
