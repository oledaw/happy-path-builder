import { LS_PANEL } from '../constants.js';

let panelVisible = localStorage.getItem(LS_PANEL) !== 'hidden';

export function togglePanel() {
  panelVisible = !panelVisible;
  _applyPanelState(true);
}

export function _applyPanelState(save = false) {
  const workspace = document.getElementById('workspace');
  const toggle    = document.getElementById('panel-toggle');
  const arrow     = toggle?.querySelector('.panel-toggle-arrow');

  if (panelVisible) {
    workspace.classList.remove('panel-collapsed');
    toggle?.setAttribute('data-tip', 'Ukryj panel  [ ]');
    if (arrow) arrow.textContent = '‹';
  } else {
    workspace.classList.add('panel-collapsed');
    toggle?.setAttribute('data-tip', 'Pokaż panel  [ ]');
    if (arrow) arrow.textContent = '›';
  }

  if (save) localStorage.setItem(LS_PANEL, panelVisible ? 'visible' : 'hidden');
}
