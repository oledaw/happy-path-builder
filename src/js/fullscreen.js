import { state, escHtml, hexAlpha, getResult, getProcessForStep } from './state.js';
import { RESULT_TYPE_COLORS, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from './constants.js';

export const fsState = {
  open:       false,
  zoom:       1,
  panX:       0,
  panY:       0,
  isPanning:  false,
  panStartX:  0,
  panStartY:  0,
  panOriginX: 0,
  panOriginY: 0,
};

// ── Open / close ─────────────────────────────────────────────────────────────
export function openFullscreen() {
  Object.assign(fsState, { open: true, zoom: 1, panX: 0, panY: 0 });
  document.getElementById('fs-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  renderFullscreenTimeline();
  requestAnimationFrame(() => requestAnimationFrame(fitToScreen));
}

export function closeFullscreen() {
  fsState.open = false;
  document.getElementById('fs-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Render ────────────────────────────────────────────────────────────────────
export function renderFullscreenTimeline() {
  const wrap   = document.getElementById('sl-wrap');
  const legend = document.getElementById('sl-legend');
  const pn     = document.getElementById('proc-name').value || 'Swim Lane';

  const ftTitle = document.getElementById('fs-title');
  const ftSub   = document.getElementById('fs-subtitle');
  if (ftTitle) ftTitle.textContent = pn;
  if (ftSub)   ftSub.textContent   = `${state.steps.length} kroków · ${state.actors.length} aktorów`;

  if (!state.actors.length || !state.steps.length) {
    wrap.innerHTML   = '<div class="empty-state"><div class="empty-title">Brak danych</div></div>';
    legend.innerHTML = '';
    return;
  }

  wrap.innerHTML   = _buildSlHeader() + _buildSlRows();
  legend.innerHTML = _buildSlLegend();

  applyTransform(true);
  updateMinimap();
}

function _buildSlHeader() {
  const cols = state.actors
    .map(a => `
      <div class="sl-actor-col" style="color:${a.color};border-bottom-color:${a.color}">
        <div style="width:9px;height:9px;border-radius:50%;background:${a.color};
          display:inline-block;margin-right:7px;vertical-align:middle"></div>
        ${escHtml(a.name)}
      </div>`)
    .join('');
  return `<div class="sl-header">${cols}</div>`;
}

function _buildSlRows() {
  const seenProcesses = new Set();

  return state.steps.map((step, i) => {
    const proc    = getProcessForStep(step.id);
    const pc      = proc ? proc.color : null;
    const rowBg   = pc ? hexAlpha(pc, 0.07) : 'transparent';
    const isFirst = proc && !seenProcesses.has(proc.id);
    if (proc) seenProcesses.add(proc.id);

    const bTop      = isFirst ? `border-top:2px solid ${hexAlpha(pc, 0.45)};` : '';
    const watermark = proc
      ? `<div class="sl-process-label">
           <span class="sl-process-label-text" style="color:${pc}">${escHtml(proc.name)}</span>
         </div>`
      : '';

    const cells = state.actors.map(a => {
      if (a.id !== step.actor) return '<div class="sl-cell"></div>';

      const resultChips = (step.results || [])
        .map(rid => {
          const r   = getResult(rid);
          if (!r) return '';
          const col = RESULT_TYPE_COLORS[r.type] || '#888';
          return `<span class="sl-result-chip" style="background:${col}22;color:${col}">${escHtml(r.name)}</span>`;
        })
        .join('');

      return `
        <div class="sl-cell">
          <div class="sl-bubble" style="border-color:${a.color}55;border-left:3px solid ${a.color}">
            <div class="sl-step-num">krok ${i + 1}</div>
            <div>${escHtml(step.action)}</div>
            ${resultChips ? `<div class="sl-result-chips">${resultChips}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    return `
      <div class="sl-row ${isFirst ? 'process-first' : ''}"
        style="background:${rowBg};${bTop}">
        ${watermark}${cells}
      </div>`;
  }).join('');
}

function _buildSlLegend() {
  const usedProcesses = state.processes.filter(p =>
    p.stepIds.some(sid => state.steps.find(s => s.id === sid))
  );

  if (!usedProcesses.length) return '';

  return `
    <span class="sl-legend-label">Procesy:</span>
    ${usedProcesses.map(p => `
      <span class="sl-legend-item">
        <span class="sl-legend-swatch" style="background:${p.color}"></span>
        ${escHtml(p.name)}
        <span style="color:var(--text3);font-size:9px">
          (${p.stepIds.filter(sid => state.steps.find(s => s.id === sid)).length}k)
        </span>
      </span>`).join('')}`;
}

// ── Transform ─────────────────────────────────────────────────────────────────
export function applyTransform(animate = false) {
  const canvas = document.getElementById('fs-canvas');
  canvas.style.transition = animate ? 'transform .35s cubic-bezier(.4,0,.2,1)' : 'none';
  canvas.style.transform  = `translate(${fsState.panX}px,${fsState.panY}px) scale(${fsState.zoom})`;

  document.getElementById('zoom-level-display').textContent =
    Math.round(fsState.zoom * 100) + '%';

  updateMinimapViewport();
}

// ── Zoom ──────────────────────────────────────────────────────────────────────
export function zoomBy(delta, px, py) {
  const vp = document.getElementById('fs-viewport');
  const cx = px !== undefined ? px : vp.clientWidth  / 2;
  const cy = py !== undefined ? py : vp.clientHeight / 2;

  const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, fsState.zoom + delta));
  if (newZoom === fsState.zoom) return;

  const ratio  = newZoom / fsState.zoom;
  fsState.panX = cx - ratio * (cx - fsState.panX);
  fsState.panY = cy - ratio * (cy - fsState.panY);
  fsState.zoom = newZoom;

  applyTransform(Math.abs(delta) > ZOOM_STEP);
  updateMinimap();
}

export function fitToScreen() {
  const vp = document.getElementById('fs-viewport');
  const c  = document.getElementById('fs-canvas');
  const vw = vp.clientWidth, vh = vp.clientHeight;
  const cw = c.scrollWidth,  ch = c.scrollHeight;
  if (!cw || !ch) return;

  fsState.zoom = Math.min((vw - 80) / cw, (vh - 80) / ch, ZOOM_MAX);
  fsState.panX = (vw - cw * fsState.zoom) / 2;
  fsState.panY = (vh - ch * fsState.zoom) / 2;

  applyTransform(true);
  updateMinimap();
}

export function resetZoom() {
  const vp = document.getElementById('fs-viewport');
  const c  = document.getElementById('fs-canvas');

  fsState.zoom = 1;
  fsState.panX = vp.clientWidth  / 2 - c.scrollWidth  / 2;
  fsState.panY = 40;

  applyTransform(true);
  updateMinimap();
}

// ── Pan ───────────────────────────────────────────────────────────────────────
export function onPanStart(e) {
  if (e.button !== 0) return;
  Object.assign(fsState, {
    isPanning: true,
    panStartX: e.clientX,
    panStartY: e.clientY,
    panOriginX: fsState.panX,
    panOriginY: fsState.panY,
  });
  document.getElementById('fs-viewport').classList.add('panning');
}

export function onPanMove(e) {
  if (!fsState.isPanning) return;
  fsState.panX = fsState.panOriginX + (e.clientX - fsState.panStartX);
  fsState.panY = fsState.panOriginY + (e.clientY - fsState.panStartY);
  applyTransform(false);
  updateMinimapViewport();
}

export function onPanEnd() {
  fsState.isPanning = false;
  document.getElementById('fs-viewport').classList.remove('panning');
}

export function onWheelZoom(e) {
  e.preventDefault();
  const vp   = document.getElementById('fs-viewport');
  const rect = vp.getBoundingClientRect();
  zoomBy(
    e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP,
    e.clientX - rect.left,
    e.clientY - rect.top,
  );
}

// ── Minimap ───────────────────────────────────────────────────────────────────
export function updateMinimap() {
  const mc = document.getElementById('mm-canvas');
  if (!mc || !fsState.open) return;

  const dpr = window.devicePixelRatio || 1;
  const mw  = mc.offsetWidth;
  const mh  = mc.offsetHeight;

  mc.width  = mw * dpr;
  mc.height = mh * dpr;

  const ctx = mc.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, mw, mh);

  const c  = document.getElementById('fs-canvas');
  const cw = c.scrollWidth  || 800;
  const ch = c.scrollHeight || 600;
  const sx = mw / cw;
  const sy = mh / ch;

  // Kolumny aktorów
  state.actors.forEach((a, i) => {
    const colW = cw / state.actors.length;
    ctx.fillStyle = hexAlpha(a.color, 0.15);
    ctx.fillRect(i * colW * sx, 0, colW * sx, mh);
  });

  // Wiersze kroków
  const rowH = (ch - 80) / (state.steps.length || 1);
  state.steps.forEach((step, i) => {
    const proc = getProcessForStep(step.id);
    const y    = (40 + i * rowH) * sy;
    const h    = rowH * sy;

    if (proc) {
      ctx.fillStyle = hexAlpha(proc.color, 0.18);
      ctx.fillRect(0, y, mw, h);
    }

    const ai = state.actors.findIndex(a => a.id === step.actor);
    if (ai >= 0) {
      const actor = state.actors[ai];
      const colW  = mw / state.actors.length;
      ctx.fillStyle = actor.color;
      ctx.beginPath();
      ctx.roundRect(ai * colW + colW * 0.2, y + h * 0.25, colW * 0.6, h * 0.5, 2);
      ctx.fill();
    }
  });

  updateMinimapViewport();
}

export function updateMinimapViewport() {
  const mv = document.getElementById('mm-viewport');
  const mc = document.getElementById('mm-canvas');
  const vp = document.getElementById('fs-viewport');
  const c  = document.getElementById('fs-canvas');
  if (!mv || !mc || !vp || !c) return;

  const mw = mc.offsetWidth,  mh = mc.offsetHeight;
  const cw = c.scrollWidth  || 800;
  const ch = c.scrollHeight || 600;
  const vw = vp.clientWidth, vh = vp.clientHeight;

  mv.style.left   = Math.max(0, (-fsState.panX / fsState.zoom) / cw * mw) + 'px';
  mv.style.top    = Math.max(0, (-fsState.panY / fsState.zoom) / ch * mh) + 'px';
  mv.style.width  = Math.min(mw, (vw / fsState.zoom) / cw * mw) + 'px';
  mv.style.height = Math.min(mh, (vh / fsState.zoom) / ch * mh) + 'px';
}
