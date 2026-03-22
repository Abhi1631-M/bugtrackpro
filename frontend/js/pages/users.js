/* ============================================================
   users.js — User management page
   ============================================================ */

const UsersPage = {
  users: [],

  async render() {
    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1>👥 Users</h1>
          <p>Manage team members and their roles.</p>
        </div>
        <button class="btn btn-primary" id="new-user-btn">+ Add User</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Status</th>
          </tr></thead>
          <tbody id="users-tbody">
            <tr class="loading-row"><td colspan="4">Loading users…</td></tr>
          </tbody>
        </table>
      </div>
    `;
  },

  async init() {
    document.getElementById('new-user-btn')?.addEventListener('click', () => this.openCreateModal());
    try {
      this.users = await API.getAllUsers() || [];
      this.renderTable();
    } catch (err) {
      Toast.error(err.message || 'Failed to load users');
      document.getElementById('users-tbody').innerHTML =
        `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">Could not load users.</td></tr>`;
    }
  },

  renderTable() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    if (!this.users || this.users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">No users found.</td></tr>`;
      return;
    }
    tbody.innerHTML = this.users.map(u => `
      <tr>
        <td>
          <div class="flex items-center gap-2">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#2563eb);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0">
              ${(u.name || u.email || '?')[0].toUpperCase()}
            </div>
            <strong>${u.name}</strong>
          </div>
        </td>
        <td class="text-muted">${u.email}</td>
        <td><span class="badge badge-${(u.role||'').toLowerCase()}">${(u.role||'').replace('_',' ')}</span></td>
        <td><span class="badge badge-${(u.status||'active').toLowerCase()}">${u.status || 'ACTIVE'}</span></td>
      </tr>
    `).join('');
  },

  openCreateModal() {
    Modal.open(
      'Add New User',
      `
        <div class="form-group">
          <label for="nu-name">Full Name</label>
          <input type="text" id="nu-name" placeholder="Jane Smith" required />
        </div>
        <div class="form-group">
          <label for="nu-email">Email Address</label>
          <input type="email" id="nu-email" placeholder="jane@company.com" required />
        </div>
        <div class="form-group">
          <label for="nu-password">Password</label>
          <div class="password-wrap">
            <input type="password" id="nu-password" placeholder="Minimum 8 characters" required />
            <button type="button" class="eye-btn" onclick="(function(btn){var i=document.getElementById('nu-password');var h=i.type==='password';i.type=h?'text':'password';btn.textContent=h?'🙈':'👁';})(this)" title="Show/hide password">👁</button>
          </div>
        </div>
        <div class="form-group">
          <label for="nu-role">Role</label>
          <select id="nu-role">
            <option value="DEVELOPER">Developer</option>
            <option value="TESTER">Tester</option>
            <option value="PROJECT_ADMIN">Project Admin</option>
            <option value="VIEWER">Viewer</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
      `,
      async () => {
        const name     = Modal.val('nu-name');
        const email    = Modal.val('nu-email');
        const password = Modal.val('nu-password');
        const role     = Modal.val('nu-role');
        if (!name || !email || !password) { Toast.error('All fields are required'); return; }
        try {
          const user = await API.createUser({ name, email, password, role });
          this.users.push(user);
          this.renderTable();
          Modal.close();
          Toast.success('User created!');
        } catch (err) {
          Toast.error(err.message || 'Failed to create user');
        }
      },
      'Create User'
    );
  },
};
