/* ============================================================
   projects.js — Projects list page
   ============================================================ */

const ProjectsPage = {
  projects: [],
  users: [],

  async render() {
    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1>📁 Projects</h1>
          <p>Manage your projects and team assignments.</p>
        </div>
        ${Auth.isRole('SUPER_ADMIN') ? `
          <button class="btn btn-primary" id="new-project-btn">
            + New Project
          </button>
        ` : ''}
      </div>
      <div class="project-grid" id="project-grid">
        <div class="empty-state"><div class="splash-spinner"></div></div>
      </div>
    `;
  },

  async init() {
    if (Auth.isRole('SUPER_ADMIN')) {
      document.getElementById('new-project-btn')?.addEventListener('click', () => this.openCreateModal());
    }

    try {
      [this.projects, this.users] = await Promise.allSettled([
        API.getAllProjects(),
        Auth.isRole('SUPER_ADMIN', 'PROJECT_ADMIN') ? API.getAllUsers() : Promise.resolve([]),
      ]).then(r => [
        r[0].status === 'fulfilled' ? r[0].value || [] : [],
        r[1].status === 'fulfilled' ? r[1].value || [] : [],
      ]);
    } catch {}

    this.renderGrid();
  },

  renderGrid() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;

    if (!this.projects || this.projects.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">📁</div>
          <h3>No projects yet</h3>
          <p>${Auth.isRole('SUPER_ADMIN') ? 'Create your first project above.' : 'No projects assigned to you yet.'}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.projects.map(p => `
      <div class="project-card" onclick="window.location.hash='#bugs?projectId=${p.id}'">
        <div class="project-card-name">${p.name}</div>
        <div class="project-card-desc">${p.description || 'No description'}</div>
        <div class="project-card-footer">
          <span class="badge badge-${(p.status||'ACTIVE').toLowerCase()}">${p.status || 'ACTIVE'}</span>
          <span class="text-muted" style="font-size:12px">View Bugs →</span>
        </div>
        ${Auth.isRole('PROJECT_ADMIN', 'SUPER_ADMIN') ? `
          <div class="project-card-actions" onclick="event.stopPropagation()">
            <button class="btn btn-ghost btn-sm" onclick="ProjectsPage.openAssignModal(${p.id}, '${p.name}')">
              👤 Assign User
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  openCreateModal() {
    Modal.open(
      'Create New Project',
      `
        <div class="form-group">
          <label for="p-name">Project Name</label>
          <input type="text" id="p-name" placeholder="e.g. Payment Gateway" required />
        </div>
        <div class="form-group">
          <label for="p-desc">Description</label>
          <textarea id="p-desc" placeholder="What is this project about?"></textarea>
        </div>
      `,
      async () => {
        const name = Modal.val('p-name');
        const description = Modal.val('p-desc');
        if (!name) { Toast.error('Project name is required'); return; }
        try {
          const proj = await API.createProject({ name, description });
          this.projects.push(proj);
          this.renderGrid();
          Modal.close();
          Toast.success('Project created!');
        } catch (err) {
          Toast.error(err.message || 'Failed to create project');
        }
      },
      'Create Project'
    );
  },

  openAssignModal(projectId, projectName) {
    const userOptions = this.users
      .map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`)
      .join('');

    Modal.open(
      `Assign User to "${projectName}"`,
      `
        <div class="form-group">
          <label for="assign-user-sel">Select User</label>
          <select id="assign-user-sel">
            <option value="">-- Choose a user --</option>
            ${userOptions}
          </select>
        </div>
      `,
      async () => {
        const userId = Modal.val('assign-user-sel');
        if (!userId) { Toast.error('Please select a user'); return; }
        try {
          await API.assignUserToProject(projectId, userId);
          Modal.close();
          Toast.success('User assigned to project!');
        } catch (err) {
          Toast.error(err.message || 'Failed to assign user');
        }
      },
      'Assign'
    );
  },
};
