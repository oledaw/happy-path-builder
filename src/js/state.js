/**
 * Centralny stan aplikacji.
 * Mutacje ZAWSZE przez dedykowane funkcje (handlers/).
 * Nie importuj i nie mutuj `state` bezpośrednio z rendererów.
 */
import { COLORS } from './constants.js';

export const state = {
  // -- dane domenowe --
  actors: [
    { id: 'a1', name: 'Klient',    color: '#f25e8a' },
    { id: 'a2', name: 'Sprzedawca',color: '#7c6ff7' },
    { id: 'a3', name: 'System',    color: '#5ad4b0' },
  ],
  processes: [
    { id: 'p1', name: 'Zamawianie',  color: '#7c6ff7', stepIds: ['s1','s2','s3'] },
    { id: 'p2', name: 'Fulfillment', color: '#f7a25e', stepIds: ['s4','s5'] },
  ],
  results: [
    { id:'r1', name:'Zamówienie złożone',    desc:'Klient potwierdził koszyk i wybrał metodę płatności',         type:'state' },
    { id:'r2', name:'Potwierdzenie email',   desc:'System wysyła email z podsumowaniem zamówienia',              type:'notification' },
    { id:'r3', name:'Płatność zaksięgowana', desc:'Transakcja zakończona sukcesem po stronie bramki',            type:'output' },
    { id:'r4', name:'Zamówienie spakowane',  desc:'Fizyczny pakiet gotowy do wysyłki z etykietą',               type:'output' },
    { id:'r5', name:'Przesyłka nadana',      desc:'Numer trackingowy wygenerowany i przekazany klientowi',       type:'notification' },
  ],
  steps: [
    { id:'s1', actor:'a1', action:'Wybiera produkty i składa zamówienie',       desc:'Klient przegląda katalog, dodaje do koszyka i klika "Zamów"',                                              results:['r1'], status:'done' },
    { id:'s2', actor:'a3', action:'Generuje potwierdzenie zamówienia',           desc:'System waliduje dostępność produktów i wysyła email z numerem zamówienia',                                results:['r2'], status:'done' },
    { id:'s3', actor:'a1', action:'Realizuje płatność online',                  desc:'Klient zostaje przekierowany do bramki płatniczej i finalizuje transakcję',                               results:['r3'], status:'done' },
    { id:'s4', actor:'a2', action:'Kompletuje i pakuje zamówienie',             desc:'Magazynier zbiera produkty z półek, pakuje i drukuje etykietę',                                          results:['r4'], status:'in-progress' },
    { id:'s5', actor:'a2', action:'Nadaje przesyłkę do kuriera',                desc:'Przekazanie paczki kurierowi i wygenerowanie numeru trackingowego',                                      results:['r5'], status:'todo' },
  ],
  alternativeFlows: [],

  // -- UI state --
  currentView:      'steps',
  stepsViewMode:    'full',   // 'full' | 'compact'
  linkingStepId:    null,
  editingResultId:  null,
  editingProcessId: null,
  editingAfId:      null,

  // -- drag state --
  dragStepId:   null,
  dragActorId:  null,
  dragResultId: null,

  // -- kolor pendingowy dla modali --
  pendingActorColor:   COLORS[0],
  pendingProcessColor: COLORS[0],
};

// ── Lookups (szybki dostęp, nie mutują state) ────────────────────────────────
export function getActor(id)           { return state.actors.find(a => a.id === id); }
export function getResult(id)          { return state.results.find(r => r.id === id); }
export function getProcessForStep(sid) { return state.processes.find(p => p.stepIds.includes(sid)) || null; }

// ── Helpers ──────────────────────────────────────────────────────────────────
export function uid() { return 'id' + Math.random().toString(36).slice(2, 8); }

export function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function escHtml(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
