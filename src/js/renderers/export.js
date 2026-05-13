import { state, getActor, getResult } from '../state.js';
import { RESULT_TYPE_LABELS } from '../constants.js';

let _exportFormatMode = 'raw'; // 'raw' or 'formatted'

export function renderExport() {
  const markdown = _buildMarkdown();
  const preEl = document.getElementById('export-content');
  const renderedEl = document.getElementById('export-rendered');
  
  if (!preEl || !renderedEl) return;
  
  preEl.textContent = markdown;
  
  // Render HTML version using marked
  if (window.marked) {
    renderedEl.innerHTML = marked.parse(markdown);
  }
  
  // Show correct format
  _updateExportView();
}

export function toggleExportFormat() {
  _exportFormatMode = _exportFormatMode === 'raw' ? 'formatted' : 'raw';
  _updateExportView();
}

function _updateExportView() {
  const preEl = document.getElementById('export-content');
  const renderedEl = document.getElementById('export-rendered');
  const toggleBtn = document.getElementById('export-format-toggle');
  
  if (!preEl || !renderedEl || !toggleBtn) return;
  
  if (_exportFormatMode === 'raw') {
    preEl.classList.remove('hidden');
    renderedEl.classList.add('hidden');
    toggleBtn.textContent = 'Sformatowany';
  } else {
    preEl.classList.add('hidden');
    renderedEl.classList.remove('hidden');
    toggleBtn.textContent = 'Kod źródłowy';
  }
}

export function copyExport() {
  const preEl = document.getElementById('export-content');
  const text = preEl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    btn.textContent = 'Skopiowano!';
    setTimeout(() => (btn.textContent = 'Kopiuj'), 1500);
  });
}

function _buildMarkdown() {
  const name    = document.getElementById('proc-name').value    || 'Proces';
  const goal    = document.getElementById('proc-goal').value    || '';
  const trigger = document.getElementById('proc-trigger').value || '';

  let md = `# Happy Path: ${name}\n\n`;
  md    += `**Cel procesu:** ${goal}\n\n`;
  md    += `**Warunki wejścia:** ${trigger}\n\n---\n\n`;

  if (state.processes && state.processes.length) {
    md += _buildProcessesSection();
  } else {
    md += _buildFlatStepsSection();
  }

  md += _buildResultsSection();
  md += _buildAfsSection();

  return md;
}

function _buildProcessesSection() {
  let md       = '## Procesy\n\n';
  const assigned = new Set(state.processes.flatMap(p => p.stepIds));

  state.processes.forEach(proc => {
    const ps = proc.stepIds
      .map(sid => state.steps.find(s => s.id === sid))
      .filter(Boolean);

    md += `### 📦 Proces: ${proc.name}\n\n`;
    ps.forEach(step => {
      md += _buildStepMarkdown(step);
    });
  });

  const unassigned = state.steps.filter(s => !assigned.has(s.id));
  if (unassigned.length) {
    md += '### Kroki bez przypisanego procesu\n\n';
    unassigned.forEach(step => { md += _buildStepMarkdown(step); });
  }

  return md;
}

function _buildFlatStepsSection() {
  let md = '## Sekwencja kroków\n\n';
  state.steps.forEach(step => { md += _buildStepMarkdown(step); });
  return md;
}

function _buildStepMarkdown(step) {
  const idx   = state.steps.indexOf(step);
  const actor = getActor(step.actor);
  let md = `#### Krok ${idx + 1}: ${step.action}\n\n`;
  md    += `**Aktor:** ${actor ? actor.name : '—'}\n\n`;
  if (step.desc) md += `**Opis:** ${step.desc}\n\n`;
  if (step.results && step.results.length) {
    md += '**Rezultaty:**\n';
    step.results.forEach(rid => {
      const r = getResult(rid);
      if (r) md += `  - [${RESULT_TYPE_LABELS[r.type]}] ${r.name}: ${r.desc}\n`;
    });
    md += '\n';
  }
  return md;
}

function _buildResultsSection() {
  let md = '---\n\n## Oczekiwane rezultaty\n\n';
  state.results.forEach(r => {
    md += `- **[${RESULT_TYPE_LABELS[r.type]}] ${r.name}** — ${r.desc}\n`;
  });
  return md;
}

function _buildAfsSection() {
  if (!state.alternativeFlows || !state.alternativeFlows.length) return '';

  let md = '\n---\n\n## Alternate Flows\n\n';
  state.alternativeFlows.forEach(af => {
    md += `### ${af.title}\n\n`;
    md += `**Severity:** ${(af.severity || '').toUpperCase()}`;
    md += af.requiresManualReview ? ' · MANUAL REVIEW' : '';
    md += '\n\n';
    md += `**Trigger:** ${af.trigger}\n\n`;
    md += `**Outcome:** ${af.outcome}\n\n`;

    if (af.relatedSteps && af.relatedSteps.length) {
      const refs = af.relatedSteps
        .map(sid => {
          const s     = state.steps.find(x => x.id === sid);
          const actor = s ? getActor(s.actor) : null;
          const idx   = s ? state.steps.indexOf(s) + 1 : '?';
          return s
            ? `krok ${idx} (${actor ? actor.name : '—'}): ${s.action}`
            : `${sid} (nieznany)`;
        })
        .join('\n  - ');
      md += `**Powiązane kroki:**\n  - ${refs}\n\n`;
    }
  });
  return md;
}
