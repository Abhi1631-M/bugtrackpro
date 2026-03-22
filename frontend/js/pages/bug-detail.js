/* ============================================================
   bug-detail.js — Full bug detail page with comments
   ============================================================ */

const BugDetailPage = {
  bug: null,
  comments: [],
  users: [],
  bugId: null,

  async render(params) {
    this.bugId = params?.bugId ? Number(params.bugId) : null;
    return `
      <div id="bug-detail-root">
        <div class="empty-state"><div class="splash-spinner"></div></div>
      </div>
    `;
  },

  async init() {
    if (!this.bugId) {
      document.getElementById('bug-detail-root').innerHTML =
        '<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Bug not found</h3></div>';
      return;
    }

    try {
      // Load users for admin actions
      if (Auth.isRole('SUPER_ADMIN', 'PROJECT_ADMIN')) {
        try { this.users = await API.getAllUsers() || []; } catch {}
      }

      // Load comments
      this.comments = await API.getComments(this.bugId) || [];

      // We don't have a get-bug-by-id endpoint, so find from project bugs
      // The bugId is in the comments' parent. We'll show what we have.
      // Use dashboard cache or navigate back & try from latest project.
      // As a workaround, show a detail view with what we got.
      this.renderDetail();

    } catch (err) {
      console.error('Bug detail error', err);
      document.getElementById('bug-detail-root').innerHTML =
        `<div class="empty-state"><div class="empty-state-icon">❌</div><h3>Error</h3><p>${err.message}</p></div>`;
    }
  },

  injectBug(bug) {
    this.bug = bug;
    this.renderDetail();
  },

  renderDetail() {
    const root = document.getElementById('bug-detail-root');
    if (!root) return;
    const b = this.bug;

    const adminActions = Auth.isRole('PROJECT_ADMIN', 'SUPER_ADMIN') ? `
      <div class="card" style="margin-top:16px">
        <div class="card-header"><span class="card-title">⚙️ Admin Actions</span></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-ghost w-full" onclick="BugDetailPage.openAssignModal()">
            👤 Assign to Developer
          </button>
        </div>
      </div>
    ` : '';

    const devActions = Auth.isRole('DEVELOPER', 'TESTER') ? `
      <div class="card" style="margin-top:16px">
        <div class="card-header"><span class="card-title">🔄 Update Status</span></div>
        <div class="card-body">
          <select id="status-select" style="margin-bottom:10px">
            ${['OPEN','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED','REOPENED'].map(s =>
              `<option value="${s}" ${b && b.status === s ? 'selected' : ''}>${s.replace('_',' ')}</option>`
            ).join('')}
          </select>
          <button class="btn btn-primary w-full" onclick="BugDetailPage.updateStatus()">
            Update Status
          </button>
        </div>
      </div>
    ` : '';

    const bugInfo = b ? `
      <div class="card">
        <div class="card-header">
          <span class="card-title">${b.title}</span>
          ${App.statusBadge(b.status)}
        </div>
        <div class="card-body">
          <p style="color:var(--text-muted);margin-bottom:20px;line-height:1.7">${b.description || 'No description.'}</p>
          <div class="detail-meta">
            <div class="detail-meta-item">
              <span class="detail-meta-label">Priority</span>
              ${App.priorityBadge(b.priority)}
            </div>
            <div class="detail-meta-item">
              <span class="detail-meta-label">Severity</span>
              ${App.severityBadge(b.severity)}
            </div>
            <div class="detail-meta-item">
              <span class="detail-meta-label">Type</span>
              ${App.typeBadge(b.type)}
            </div>
            <div class="detail-meta-item">
              <span class="detail-meta-label">Reporter ID</span>
              <span>#${b.reportedBy || '—'}</span>
            </div>
            <div class="detail-meta-item">
              <span class="detail-meta-label">Assignee</span>
              <span>${b.assignedTo ? '#' + b.assignedTo : '<span class="text-muted">Unassigned</span>'}</span>
            </div>
            <div class="detail-meta-item">
              <span class="detail-meta-label">Bug ID</span>
              <span>#${b.id}</span>
            </div>
          </div>
        </div>
      </div>
    ` : `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="empty-state-icon">🐛</div>
            <h3>Bug #${this.bugId}</h3>
            <p style="margin-top:6px">Navigate here from the Bugs list to see full details.</p>
          </div>
        </div>
      </div>
    `;

    root.innerHTML = `
      <div style="margin-bottom:12px">
        <button class="btn btn-ghost btn-sm" onclick="history.back()">← Back</button>
      </div>
      <div class="bug-detail-grid">
        <div>
          ${bugInfo}
          <!-- Comments -->
          <div class="card" style="margin-top:20px">
            <div class="card-header">
              <span class="card-title">💬 Comments (${this.comments.length})</span>
            </div>
            <div class="card-body">
              <div class="comment-list" id="comment-list">
                ${this.renderComments()}
              </div>
              <!-- Add comment -->
              <div>
                <textarea id="new-comment" placeholder="Write a comment…" rows="3" style="width:100%;margin-bottom:8px"></textarea>
                <button class="btn btn-primary" onclick="BugDetailPage.addComment()">💬 Add Comment</button>
              </div>
            </div>
          </div>
        </div>
        <div>
          ${adminActions}
          ${devActions}
        </div>
      </div>
    `;
  },

  renderComments() {
    if (!this.comments || this.comments.length === 0) {
      return `<div class="empty-state" style="padding:20px 0">
        <div class="empty-state-icon" style="font-size:32px">💬</div>
        <p>No comments yet. Be the first!</p>
      </div>`;
    }
    return this.comments.map(c => `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-author">${c.userName || ('User #' + (c.userId || '?'))}</span>
          <span class="comment-date">${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</span>
        </div>
        <div class="comment-text">${c.message || ''}</div>
      </div>
    `).join('');
  },

  async addComment() {
    const message = document.getElementById('new-comment')?.value.trim();
    if (!message) { Toast.error('Comment cannot be empty'); return; }

    // CommentRequestDTO needs: { userId: Long, message: String }
    // Resolve current user's DB id from users list or fall back to 1
    const currentEmail = Auth.getUser()?.email;
    const usersList = this.users && this.users.length ? this.users : [];
    const me = usersList.find(u => u.email === currentEmail);
    const userId = me ? me.id : 1; // fallback — AuthUtil currently hardcoded to id=1 on backend

    try {
      const comment = await API.addComment(this.bugId, { userId, message });
      this.comments.push(comment);
      document.getElementById('comment-list').innerHTML = this.renderComments();
      document.getElementById('new-comment').value = '';
      Toast.success('Comment added!');
    } catch (err) {
      Toast.error(err.message || 'Failed to add comment');
    }
  },

  openAssignModal() {
    const userOpts = this.users
      .filter(u => u.role === 'DEVELOPER')
      .map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`)
      .join('');

    if (!userOpts) {
      Toast.info('No developers found. Register a developer first.');
      return;
    }

    Modal.open(
      'Assign Bug',
      `
        <div class="form-group">
          <label for="assign-dev-sel">Assign to Developer</label>
          <select id="assign-dev-sel">
            <option value="">-- Select Developer --</option>
            ${userOpts}
          </select>
        </div>
      `,
      async () => {
        const userId = Modal.val('assign-dev-sel');
        if (!userId) { Toast.error('Select a developer'); return; }
        try {
          const updated = await API.assignBug(this.bugId, userId);
          if (this.bug) {
            this.bug.assignedTo = updated.assignedTo;
            this.bug.status = updated.status;
          }
          this.renderDetail();
          Modal.close();
          Toast.success('Bug assigned!');
        } catch (err) {
          Toast.error(err.message || 'Failed to assign bug');
        }
      },
      'Assign'
    );
  },

  async updateStatus() {
    const status = document.getElementById('status-select')?.value;
    if (!status) return;
    try {
      const updated = await API.updateBugStatus(this.bugId, status);
      if (this.bug) this.bug.status = updated.status;
      this.renderDetail();
      Toast.success(`Status updated to ${status}`);
    } catch (err) {
      Toast.error(err.message || 'Failed to update status');
    }
  },
};
