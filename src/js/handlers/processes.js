import { state, uid, escHtml, hexAlpha, getActor } from '../state.js';
import { COLORS } from '../constants.js';
import { openModal, closeModal } from '../ui/modal.js';
import { showToast } from '../ui/toast.js';

export function addProcess() {
  const inp  = document.getElementById('new-process-input');
  const name = inp.value.trim();
  if (!name) return;

  state.processes.push({
    id:      uid(),
    name,
    color:   COLORS[state.processes.length % COLORS.length],
    stepIds: [],
  });

  inp.value = '';
  window.render();
  window.autoSave();
  showToast('Proces dodany — przypisz kroki przez ✎', 'var(--accent)');
}

export function removeProcess(id) {
  state.processes = state.processes.filter(p => p.id !== id);
  window.render();
  window.autoSave();
}

export function renameProcess(id, name) {
  const p = state.processes.find(x => x.id === id);
  if (p && name.trim()) {
    p.name = name.trim();
    window.render();
    window.autoSave();
  }
}

export function editProcess(id) {
  const p = state.processes.find(x => x.id === id);
  if (!p) return;

  state.editingProcessId = id;
  document.getElementById('process-modal-title').textContent    = 'Edytuj Proces';
  document.getElementById('process-modal-save-btn').textContent = 'Zapisz zmiany';
  document.getElementById('process-name-input').value           = p.name;

  state.pendingProcessColor = p.color;
  renderProcessColorSwatches();
  renderProcessStepGrid(p.stepIds);
  openModal('process-modal');
}

export function openProcessAssignForStep(sid) {
  if (!state.processes.length) {
    showToast('Najpierw dodaj proces w panelu bocznym', 'var(--accent3)');
    return;
  }

  state.editingProcessId = null;
  document.getElementById('process-modal-title').textContent    = 'Nowy Proces';
  document.getElementById('process-modal-save-btn').textContent = 'Dodaj proces';
  document.getElementById('process-name-input').value           = '';

  state.pendingProcessColor = COLORS[state.processes.length % COLORS.length];
  renderProcessColorSwatches();
  renderProcessStepGrid([sid]);
  openModal('process-modal');
}

export function saveProcess() {
  const name = document.getElementById('process-name-input').value.trim();
  if (!name) return;

  const checked = [
    ...document.querySelectorAll(
      '#process-step-grid .process-step-toggle input[type=checkbox]:checked'
    ),
  ];
  const stepIds = checked.map(cb => cb.dataset.stepid);

  if (state.editingProcessId) {
    const p = state.processes.find(x => x.id === state.editingProcessId);
    if (p) { p.name = name; p.color = state.pendingProcessColor; p.stepIds = stepIds; }

    // odepnij kroki z innych procesów
    stepIds.forEach(sid => {
      state.processes.forEach(op => {
        if (op.id !== state.editingProcessId) op.stepIds = op.stepIds.filter(s => s !== sid);
      });
    });
    showToast('Proces zaktualizowany', 'var(--accent)');
  } else {
    const np = { id: uid(), name, color: state.pendingProcessColor, stepIds };
    state.processes.push(np);
    stepIds.forEach(sid => {
      state.processes.forEach(op => {
        if (op.id !== np.id) op.stepIds = op.stepIds.filter(s => s !== sid);
      });
    });
    showToast('Proces dodany', 'var(--accent)');
  }

  state.editingProcessId = null;
  closeModal('process-modal');
  window.render();
  window.autoSave();
}

export function renderProcessColorSwatches() {
  document.getElementById('process-color-row').innerHTML = COLORS
    .map(c => `
      <div class="color-swatch ${c === state.pendingProcessColor ? 'selected' : ''}"
        style="background:${c}"
        onclick="selectProcessColor('${c}', this)"></div>`)
    .join('');
}

export function selectProcessColor(c, el) {
  state.pendingProcessColor = c;
  document.querySelectorAll('#process-color-row .color-swatch')
    .forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

export function renderProcessStepGrid(selectedIds = []) {
  const el  = document.getElementById('process-step-grid');
  const col = state.pendingProcessColor;

  if (!state.steps.length) {
    el.innerHTML = '<div class="process-step-grid__empty">Brak kroków.</div>';
    return;
  }

  el.innerHTML = state.steps.map((s, i) => {
    const actor  = getActor(s.actor);
    const ac     = actor ? actor.color : '#888';
    const isOn   = selectedIds.includes(s.id);
    const owner  = state.processes.find(
      p => p.id !== state.editingProcessId && p.stepIds.includes(s.id)
    );
    const ownerNote = owner
      ? `<span style="font-size:9px;font-family:var(--mono);color:${owner.color};margin-left:4px">[${escHtml(owner.name)}]</span>`
      : '';

    return `
      <label class="process-step-toggle ${isOn ? 'selected' : ''}"
        style="${isOn
          ? `border-color:${hexAlpha(col, .4)};background:${hexAlpha(col, .08)}`
          : ''}">
        <input type="checkbox" data-stepid="${s.id}" ${isOn ? 'checked' : ''}
          onchange="onProcessStepToggle(this)">
        <span class="pst-num">${i + 1}</span>
        <span class="pst-name">${escHtml(s.action) || '(brak tytułu)'}</span>
        ${ownerNote}
        <span class="pst-actor" style="color:${ac}">${actor ? actor.name : '—'}</span>
      </label>`;
  }).join('');
}

export function onProcessStepToggle(cb) {
  const label = cb.closest('.process-step-toggle');
  const col   = state.pendingProcessColor;

  if (cb.checked) {
    label.classList.add('selected');
    label.style.borderColor = hexAlpha(col, .4);
    label.style.background  = hexAlpha(col, .08);
  } else {
    label.classList.remove('selected');
    label.style.borderColor = '';
    label.style.background  = '';
  }
}
