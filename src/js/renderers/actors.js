import { state, escHtml } from '../state.js';

export function renderActors() {
  document.getElementById('actors-list').innerHTML = state.actors
    .map(a => _buildActorChipHTML(a))
    .join('');
}

function _buildActorChipHTML(a) {
  return `
    <div class="actor-chip" draggable="true" data-aid="${a.id}"
      ondragstart="onActorDragStart(event,'${a.id}')"
      ondragover="onActorDragOver(event,'${a.id}')"
      ondrop="onActorDrop(event,'${a.id}')"
      ondragleave="onActorDragLeave(event)"
      ondragend="onActorDragEnd(event)">
      <span class="drag-handle">⠿</span>
      <div class="actor-dot" style="background:${a.color}"></div>
      <input class="actor-name-input"
        value="${escHtml(a.name)}"
        onchange="renameActor('${a.id}', this.value)"
        onkeydown="if(event.key==='Enter') this.blur()">
      <button class="btn-icon danger" onclick="removeActor('${a.id}')"
        style="width:22px;height:22px;font-size:12px">×</button>
    </div>`;
}
