/**
 * Punkt wejścia — ES module.
 * Importuje wszystkie moduły i eksponuje publiczne funkcje na window,
 * żeby działały inline onclick="" w HTML.
 */

// ── Core ──────────────────────────────────────────────────────────────────────
import { state, autoResize } from './state.js';
import { ZOOM_STEP } from './constants.js';

// ── UI ────────────────────────────────────────────────────────────────────────
import { showToast }                    from './ui/toast.js';
import { openModal, closeModal }        from './ui/modal.js';
import { togglePanel, _applyPanelState } from './ui/panel.js';
import { setView }                      from './ui/router.js';

// ── Renderers ─────────────────────────────────────────────────────────────────
import { renderStats }                                          from './renderers/stats.js';
import { renderActors }                                         from './renderers/actors.js';
import { renderProcesses }                                      from './renderers/processes.js';
import { renderResults }                                        from './renderers/results.js';
import { renderSteps, toggleStepsViewMode }                     from './renderers/steps.js';
import { renderTimeline }                                       from './renderers/timeline.js';
import { renderAf, setAfSeverity, setAfStep, goToStepAfs }      from './renderers/alternativeFlows.js';
import { renderExport, copyExport }                             from './renderers/export.js';

// ── Fullscreen ────────────────────────────────────────────────────────────────
import {
  fsState,
  openFullscreen, closeFullscreen, renderFullscreenTimeline,
  applyTransform, zoomBy, fitToScreen, resetZoom,
  onPanStart, onPanMove, onPanEnd, onWheelZoom,
  updateMinimap, updateMinimapViewport,
} from './fullscreen.js';

// ── Handlers — actors ─────────────────────────────────────────────────────────
import {
  addActor, removeActor, renameActor, saveActor,
  onActorDragStart, onActorDragOver, onActorDragLeave, onActorDragEnd, onActorDrop,
  initActorColorSwatches, selectActorColor,
} from './handlers/actors.js';

// ── Handlers — processes ──────────────────────────────────────────────────────
import {
  addProcess, removeProcess, renameProcess,
  editProcess, openProcessAssignForStep, saveProcess,
  renderProcessColorSwatches, selectProcessColor,
  renderProcessStepGrid, onProcessStepToggle,
} from './handlers/processes.js';

// ── Handlers — results ────────────────────────────────────────────────────────
import {
  addResult, editResult, saveResult, removeResult, duplicateResult,
  openLinkModal, linkResult, unlinkResultFromModal,
  onResultDragStart, onResultDragOver, onResultDragLeave, onResultDragEnd, onResultDrop,
} from './handlers/results.js';

// ── Handlers — steps ──────────────────────────────────────────────────────────
import {
  addStep, removeStep, duplicateStep, moveStep, updateStep, unlinkResult, setStepActor,
  toggleActorDropdown, closeAllDropdowns,
  onDragStart, onDragOver, onDragLeave, onDragEnd, onDrop,
} from './handlers/steps.js';

// ── Handlers — alternativeFlows ───────────────────────────────────────────────
import {
  openAfModal, toggleAfStep, saveAf, editAf, removeAf,
} from './handlers/alternativeFlows.js';

// ── Storage ───────────────────────────────────────────────────────────────────
import {
  autoSave, saveCurrentProject, loadProject, newProject, deleteCurrentProject, initStorage,
  setSaveState, toggleProjectsMenu, closeProjectsMenu, renderProjectsMenu,
  exportJSON, importJSON, handleJSONImport,
} from './storage.js';

// ── Globalny render (orchestracja) ───────────────────────────────────────────
function render() {
  renderActors();
  renderProcesses();
  renderResults();
  renderSteps();
  renderStats();

  if (state.currentView === 'af')       renderAf();
  if (state.currentView === 'timeline') renderTimeline();
  if (state.currentView === 'export')   renderExport();
  if (fsState.open)                     renderFullscreenTimeline();
}

// ── Expose on window (required for inline HTML onclick handlers) ──────────────
Object.assign(window, {
  // helpers used internally by modules via window.*
  render,
  autoSave,

  // ui
  showToast,
  openModal,
  closeModal,
  togglePanel,
  setView,

  // renderers
  renderStats,
  renderActors,
  renderProcesses,
  renderResults,
  renderSteps,
  renderTimeline,
  renderAf,
  renderExport,
  copyExport,
  toggleStepsViewMode,
  setAfSeverity,
  setAfStep,
  goToStepAfs,

  // fullscreen
  openFullscreen,
  closeFullscreen,
  zoomBy,
  fitToScreen,
  resetZoom,
  onPanStart,
  onPanMove,
  onPanEnd,
  onWheelZoom,

  // handlers — actors
  addActor,
  removeActor,
  renameActor,
  saveActor,
  onActorDragStart,
  onActorDragOver,
  onActorDragLeave,
  onActorDragEnd,
  onActorDrop,
  initActorColorSwatches,
  selectActorColor,

  // handlers — processes
  addProcess,
  removeProcess,
  renameProcess,
  editProcess,
  openProcessAssignForStep,
  saveProcess,
  renderProcessColorSwatches,
  selectProcessColor,
  renderProcessStepGrid,
  onProcessStepToggle,

  // handlers — results
  addResult,
  editResult,
  saveResult,
  removeResult,
  duplicateResult,
  openLinkModal,
  linkResult,
  unlinkResultFromModal,
  onResultDragStart,
  onResultDragOver,
  onResultDragLeave,
  onResultDragEnd,
  onResultDrop,

  // handlers — steps
  addStep,
  removeStep,
  duplicateStep,
  moveStep,
  updateStep,
  unlinkResult,
  setStepActor,
  toggleActorDropdown,
  closeAllDropdowns,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  autoResize,

  // handlers — alternativeFlows
  openAfModal,
  toggleAfStep,
  saveAf,
  editAf,
  removeAf,

  // storage
  saveCurrentProject,
  loadProject,
  newProject,
  deleteCurrentProject,
  toggleProjectsMenu,
  closeProjectsMenu,
  exportJSON,
  importJSON,
  handleJSONImport,
});

// ── Obsługa meta-inputów (panel boczny) ──────────────────────────────────────
function _hookMetaInputs() {
  ['proc-name', 'proc-goal', 'proc-trigger'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', autoSave);
  });
}

// ── Skróty klawiszowe ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

  // Skrót globalny — toggle panelu
  if (e.key === '[' && !inInput) { togglePanel(); return; }

  // Skróty tylko w trybie fullscreen
  if (!fsState.open || inInput) return;

  switch (e.key) {
    case 'Escape':    closeFullscreen(); break;
    case '+': case '=': e.preventDefault(); zoomBy(ZOOM_STEP);  break;
    case '-':           e.preventDefault(); zoomBy(-ZOOM_STEP); break;
    case '0':           e.preventDefault(); fitToScreen();       break;
    case '1':           e.preventDefault(); resetZoom();         break;
    case 'ArrowLeft':   fsState.panX += 40; applyTransform(false); updateMinimapViewport(); break;
    case 'ArrowRight':  fsState.panX -= 40; applyTransform(false); updateMinimapViewport(); break;
    case 'ArrowUp':     fsState.panY += 40; applyTransform(false); updateMinimapViewport(); break;
    case 'ArrowDown':   fsState.panY -= 40; applyTransform(false); updateMinimapViewport(); break;
  }
});

// ── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initActorColorSwatches();
  initStorage();
  _hookMetaInputs();
  _applyPanelState();
  render();
});
