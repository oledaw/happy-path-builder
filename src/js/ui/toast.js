let _toastTimeout = null;

/**
 * @param {string} msg
 * @param {string} [color] - CSS color value
 */
export function showToast(msg, color = 'var(--green)') {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  const dot   = document.getElementById('toast-dot');

  if (!toast || !msgEl || !dot) return;

  msgEl.textContent    = msg;
  dot.style.background = color;
  toast.classList.add('show');

  clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}
