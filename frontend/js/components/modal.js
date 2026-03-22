/* ============================================================
   modal.js — Reusable modal component
   ============================================================ */

const Modal = {
  _onSubmit: null,

  init() {
    document.getElementById('modal-close-btn').addEventListener('click', () => Modal.close());
    document.getElementById('modal-cancel-btn').addEventListener('click', () => Modal.close());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-overlay')) Modal.close();
    });
    document.getElementById('modal-submit-btn').addEventListener('click', () => {
      if (Modal._onSubmit) Modal._onSubmit();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Modal.close();
    });
  },

  /**
   * @param {string} title
   * @param {string} bodyHTML - inner HTML for the modal body
   * @param {Function} onSubmit
   * @param {string} [submitLabel]
   */
  open(title, bodyHTML, onSubmit, submitLabel = 'Submit') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-submit-btn').textContent = submitLabel;
    Modal._onSubmit = onSubmit;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  close() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
    Modal._onSubmit = null;
  },

  /** Helper: get value of a field in the modal body */
  val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  },
};
