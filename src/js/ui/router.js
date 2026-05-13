import { state } from '../state.js';
import { renderStats } from '../renderers/stats.js';
import { renderTimeline } from '../renderers/timeline.js';
import { renderAf } from '../renderers/alternativeFlows.js';
import { renderExport } from '../renderers/export.js';

const VIEW_IDS = ['steps', 'timeline', 'af', 'export'];

export function setView(view) {
  state.currentView = view;

  document.querySelectorAll('.view-btn').forEach((btn, i) => {
    btn.classList.toggle('active', VIEW_IDS[i] === view);
  });

  VIEW_IDS.forEach(v => {
    document.getElementById(`view-${v}`)?.classList.toggle('hidden', v !== view);
  });

  // Leniwe renderowanie — tylko gdy widok jest aktywny
  if (view === 'timeline') renderTimeline();
  if (view === 'af')       renderAf();
  if (view === 'export')   renderExport();

  // Update stats bar controls based on current view
  renderStats();
}
