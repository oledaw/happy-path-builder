import { state, uid } from './state.js';
import { LS_KEY, LS_CURRENT } from './constants.js';
import { showToast } from './ui/toast.js';
import { renderAf, resetAfFilters } from './renderers/alternativeFlows.js';

let _saveTimeout     = null;
let currentProjectId = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function _getAllProjects() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
  catch { return {}; }
}

function _saveAllProjects(projects) {
  localStorage.setItem(LS_KEY, JSON.stringify(projects));
}

function _getProjectData() {
  return {
    meta: {
      name:    document.getElementById('proc-name').value,
      goal:    document.getElementById('proc-goal').value,
      trigger: document.getElementById('proc-trigger').value,
    },
    actors:           state.actors,
    processes:        state.processes,
    results:          state.results,
    steps:            state.steps,
    alternativeFlows: state.alternativeFlows || [],
  };
}

function _loadProjectData(data) {
  if (!data) return;

  if (data.meta) {
    document.getElementById('proc-name').value    = data.meta.name    || '';
    document.getElementById('proc-goal').value    = data.meta.goal    || '';
    document.getElementById('proc-trigger').value = data.meta.trigger || '';
  }

  state.actors           = data.actors           || [];
  state.processes        = data.processes        || [];
  state.results          = data.results          || [];
  state.steps            = data.steps            || [];
  state.alternativeFlows = data.alternativeFlows || [];
}

// ── Public API ────────────────────────────────────────────────────────────────
export function autoSave() {
  setSaveState('unsaved');
  clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => saveCurrentProject(true), 1200);
}

export function saveCurrentProject(silent = false) {
  const projects = _getAllProjects();
  if (!currentProjectId) currentProjectId = uid();

  const name = document.getElementById('proc-name').value || 'Bez nazwy';
  projects[currentProjectId] = {
    id:        currentProjectId,
    name,
    updatedAt: new Date().toISOString(),
    data:      _getProjectData(),
  };

  _saveAllProjects(projects);
  localStorage.setItem(LS_CURRENT, currentProjectId);
  setSaveState('saved');

  if (!silent) {
    showToast('Projekt zapisany', 'var(--green)');
    renderProjectsMenu();
  } else {
    renderProjectsMenu();
  }
}

export function loadProject(id) {
  const projects = _getAllProjects();
  const project  = projects[id];
  if (!project) return;

  currentProjectId = id;
  localStorage.setItem(LS_CURRENT, id);
  _loadProjectData(project.data);

  resetAfFilters();

  window.render();
  setSaveState('saved');
  closeProjectsMenu();
  showToast(`Załadowano: ${project.name}`, 'var(--accent)');
}

export function newProject() {
  if (state.steps.length > 0 || state.results.length > 0) saveCurrentProject(true);

  currentProjectId = uid();

  state.actors           = [{ id: uid(), name: 'Klient', color: '#f25e8a' }];
  state.processes        = [];
  state.results          = [];
  state.steps            = [];
  state.alternativeFlows = [];

  document.getElementById('proc-name').value    = 'Nowy proces';
  document.getElementById('proc-goal').value    = '';
  document.getElementById('proc-trigger').value = '';

  window.render();
  setSaveState('unsaved');
  closeProjectsMenu();
  showToast('Nowy projekt utworzony', 'var(--accent)');
  setTimeout(() => document.getElementById('proc-name').select(), 100);
}

export function deleteCurrentProject() {
  if (!currentProjectId) return;

  const projects = _getAllProjects();
  const name     = projects[currentProjectId]?.name || 'projekt';
  delete projects[currentProjectId];
  _saveAllProjects(projects);

  const ids = Object.keys(projects);
  ids.length > 0 ? loadProject(ids[ids.length - 1]) : newProject();

  showToast(`Usunięto: ${name}`, 'var(--danger)');
}

export function initStorage() {
  const projects = _getAllProjects();
  const savedId  = localStorage.getItem(LS_CURRENT);

  if (savedId && projects[savedId]) {
    currentProjectId = savedId;
    _loadProjectData(projects[savedId].data);
    setSaveState('saved');
    return;
  }

  const ids = Object.keys(projects);
  if (ids.length > 0) {
    const lastId = ids[ids.length - 1];
    currentProjectId = lastId;
    _loadProjectData(projects[lastId].data);
    setSaveState('saved');
  } else {
    currentProjectId = uid();
    setSaveState('unsaved');
  }
}

// ── Save indicator ────────────────────────────────────────────────────────────
export function setSaveState(s) {
  const el    = document.getElementById('save-indicator');
  const label = document.getElementById('save-label');
  if (!el || !label) return;

  el.className      = `save-indicator ${s}`;
  label.textContent = s === 'saved'   ? 'zapisano'
                    : s === 'unsaved' ? 'niezapisane'
                    : '–';
}

// ── Projects menu ─────────────────────────────────────────────────────────────
export function toggleProjectsMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('projects-menu');
  if (menu.classList.contains('hidden')) {
    renderProjectsMenu();
    menu.classList.remove('hidden');
  } else {
    menu.classList.add('hidden');
  }
}

export function closeProjectsMenu() {
  document.getElementById('projects-menu').classList.add('hidden');
}

document.addEventListener('click', e => {
  if (!e.target.closest('#projects-btn') && !e.target.closest('#projects-menu')) {
    closeProjectsMenu();
  }
});

export function renderProjectsMenu() {
  const projects = _getAllProjects();
  const ids      = Object.keys(projects).sort((a, b) =>
    (projects[b].updatedAt || '').localeCompare(projects[a].updatedAt || '')
  );
  const el = document.getElementById('pm-list');

  if (!ids.length) {
    el.innerHTML = '<div class="pm-empty">Brak zapisanych projektów</div>';
    return;
  }

  el.innerHTML = ids.map(id => {
    const p        = projects[id];
    const isActive = id === currentProjectId;
    const date     = p.updatedAt
      ? new Date(p.updatedAt).toLocaleDateString('pl-PL', {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
        })
      : '—';

    return `
      <div class="pm-item" onclick="loadProject('${id}')">
        <div>
          <div class="pm-item-name" style="${isActive ? 'color:var(--accent)' : ''}">
            ${p.name || 'Bez nazwy'}
          </div>
          <div class="pm-item-meta">${date} · ${p.data?.steps?.length || 0} kroków</div>
        </div>
        ${isActive ? '<span class="pm-item-active">aktywny</span>' : ''}
      </div>`;
  }).join('');
}

// ── JSON import / export ──────────────────────────────────────────────────────
export function exportJSON() {
  const data = {
    version:    '1.2',
    exportedAt: new Date().toISOString(),
    meta: {
      name:    document.getElementById('proc-name').value,
      goal:    document.getElementById('proc-goal').value,
      trigger: document.getElementById('proc-trigger').value,
    },
    actors:           state.actors,
    processes:        state.processes,
    results:          state.results,
    steps:            state.steps,
    alternativeFlows: state.alternativeFlows || [],
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');

  a.href     = url;
  a.download = `${(data.meta.name || 'happy-path')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;

  a.click();
  URL.revokeObjectURL(url);
  showToast('Plik JSON pobrany', 'var(--green)');
}

export function importJSON() {
  document.getElementById('json-file-input').value = '';
  document.getElementById('json-file-input').click();
}

export function handleJSONImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.actors || !data.steps) throw new Error('Nieprawidłowy format');

      if (!Array.isArray(data.alternativeFlows)) data.alternativeFlows = [];
      if (!Array.isArray(data.processes))        data.processes        = [];

      if (state.steps.length > 0) saveCurrentProject(true);

      currentProjectId = uid();
      _loadProjectData(data);
      window.render();
      saveCurrentProject(true);
      showToast(`Zaimportowano: ${data.meta?.name || file.name}`, 'var(--accent)');
    } catch (err) {
      showToast('Błąd importu: ' + err.message, 'var(--danger)');
    }
  };
  reader.readAsText(file);
}
