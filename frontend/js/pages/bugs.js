/* ============================================================
   bugs.js — Bug list page for a project (with filters)
   ============================================================ */

const BugsPage = {
  bugs: [],
  allBugs: [],
  projectId: null,
  projects: [],
  users: [],

  async render(params) {
    this.projectId = params?.projectId ? Number(params.projectId) : null;
    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1>🐛 Bugs</h1>
          <p id="bugs-page-subtitle">${this.projectId ? 'Loading project...' : 'Select a project from the left to filter.'}</p>
        </div>
        <div class="flex gap-2">
          ${Auth.isRole('TESTER') ? `
            <button class="btn btn-primary" id="report-bug-btn">+ Report Bug</button>
          ` : ''}
        </div>
      </div>

      <div class="filter-bar" id="filter-bar">
        <select id="filter-status" onchange="BugsPage.applyFilters()">
          <option value="">All Statuses</option>
          <option>OPEN</option><option>ASSIGNED</option><option>IN_PROGRESS</option>
          <option>RESOLVED</option><option>CLOSED</option><option>REOPENED</option>
        </select>
        <select id="filter-priority" onchange="BugsPage.applyFilters()">
          <option value="">All Priorities</option>
          <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
        </select>
        <select id="filter-severity" onchange="BugsPage.applyFilters()">
          <option value="">All Severities</option>
          <option>MINOR</option><option>MAJOR</option><option>BLOCKER</option>
        </select>
        <select id="filter-type" onchange="BugsPage.applyFilters()">
          <option value="">All Types</option>
          <option>BUG</option><option>FEATURE</option><option>TASK</option>
        </select>
        ${!this.projectId ? `
          <select id="filter-project" onchange="BugsPage.filterByProject(this.value)">
            <option value="">All Projects</option>
          </select>
        ` : ''}
      </div>

      <div class="table-wrap" id="bugs-table-wrap">
        <table>
          <thead><tr>
            <th>Title</th><th>Type</th><th>Status</th>
            <th>Priority</th><th>Severity</th><th>Reporter</th><th>Assignee</th><th></th>
          </tr></thead>
          <tbody id="bugs-tbody">
            <tr class="loading-row"><td colspan="8">Loading bugs…</td></tr>
          </tbody>
        </table>
      </div>
    `;
  },

  async init() {
    try {
      const [projectsRes, usersRes] = await Promise.allSettled([
        API.getAllProjects(),
        Auth.isRole('SUPER_ADMIN', 'PROJECT_ADMIN') ? API.getAllUsers() : Promise.resolve([]),
      ]);
      this.projects = projectsRes.status === 'fulfilled' ? (projectsRes.value || []) : [];
      this.users    = usersRes.status === 'fulfilled'    ? (usersRes.value    || []) : [];
    } catch {}

    // Populate project filter if no projectId
    if (!this.projectId) {
      const sel = document.getElementById('filter-project');
      if (sel) {
        this.projects.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id; opt.textContent = p.name;
          sel.appendChild(opt);
        });
      }
      // Load all bugs from all projects
      const allResults = await Promise.allSettled(
        this.projects.map(p => API.getBugsByProject(p.id))
      );
      this.allBugs = [];
      allResults.forEach(r => {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          this.allBugs = [...this.allBugs, ...r.value];
        }
      });
      this.bugs = this.allBugs;
    } else {
      const proj = this.projects.find(p => p.id === this.projectId);
      const subtitle = document.getElementById('bugs-page-subtitle');
      if (subtitle && proj) subtitle.textContent = `Project: ${proj.name}`;

      const result = await API.getBugsByProject(this.projectId);
      this.allBugs = this.bugs = result || [];
    }

    this.renderTable(this.bugs);

    // Report Bug button
    if (Auth.isRole('TESTER')) {
      document.getElementById('report-bug-btn')?.addEventListener('click', () => this.openCreateModal());
    }
  },

  filterByProject(projectId) {
    if (!projectId) {
      this.bugs = this.allBugs;
    } else {
      this.bugs = this.allBugs.filter(b => b.projectId === Number(projectId));
    }
    this.applyFilters();
  },

  applyFilters() {
    const status   = document.getElementById('filter-status')?.value;
    const priority = document.getElementById('filter-priority')?.value;
    const severity = document.getElementById('filter-severity')?.value;
    const type     = document.getElementById('filter-type')?.value;

    let filtered = this.bugs;
    if (status)   filtered = filtered.filter(b => b.status   === status);
    if (priority) filtered = filtered.filter(b => b.priority === priority);
    if (severity) filtered = filtered.filter(b => b.severity === severity);
    if (type)     filtered = filtered.filter(b => b.type     === type);

    this.renderTable(filtered);
  },

  renderTable(bugs) {
    const tbody = document.getElementById('bugs-tbody');
    if (!tbody) return;

    if (!bugs || bugs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">No bugs found.</td></tr>`;
      return;
    }

    tbody.innerHTML = bugs.map(b => `
      <tr onclick="window.location.hash='#bug-detail?bugId=${b.id}'">
        <td><strong>${b.title}</strong></td>
        <td>${App.typeBadge(b.type)}</td>
        <td>${App.statusBadge(b.status)}</td>
        <td>${App.priorityBadge(b.priority)}</td>
        <td>${App.severityBadge(b.severity)}</td>
        <td class="text-muted nowrap">#${b.reportedBy || '—'}</td>
        <td class="text-muted nowrap">${b.assignedTo ? '#' + b.assignedTo : '<span style="color:var(--text-faint)">Unassigned</span>'}</td>
        <td><span style="color:var(--accent-primary);font-size:12px">View →</span></td>
      </tr>
    `).join('');
  },

  openCreateModal() {
    const projectOpts = this.projects
      .map(p => `<option value="${p.id}" ${p.id === this.projectId ? 'selected' : ''}>${p.name}</option>`)
      .join('');

    const user = Auth.getUser();

    Modal.open(
      'Report a Bug',
      `
        <div class="form-group">
          <label for="b-title">Title</label>
          <input type="text" id="b-title" placeholder="Short, descriptive title" required />
        </div>
        <div class="form-group">
          <label for="b-desc">Description</label>
          <textarea id="b-desc" placeholder="Steps to reproduce, expected vs actual..." style="min-height:100px"></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label for="b-priority">Priority</label>
            <select id="b-priority">
              <option>LOW</option><option selected>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
            </select>
          </div>
          <div class="form-group">
            <label for="b-severity">Severity</label>
            <select id="b-severity">
              <option selected>MINOR</option><option>MAJOR</option><option>BLOCKER</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="b-type">Type</label>
          <select id="b-type">
            <option selected>BUG</option><option>FEATURE</option><option>TASK</option>
          </select>
        </div>
        <div class="form-group">
          <label for="b-project">Project</label>
          <select id="b-project">${projectOpts}</select>
        </div>
      `,
      async () => {
        const title       = Modal.val('b-title');
        const description = Modal.val('b-desc');
        const priority    = Modal.val('b-priority');
        const severity    = Modal.val('b-severity');
        const type        = Modal.val('b-type');
        const projectId   = Number(Modal.val('b-project'));

        if (!title) { Toast.error('Title is required'); return; }
        if (!projectId) { Toast.error('Please select a project'); return; }

        try {
          const bug = await API.createBug({
            title, description, priority, severity, type, projectId,
          });
          this.allBugs.push(bug);
          this.bugs.push(bug);
          this.applyFilters();
          Modal.close();
          Toast.success('Bug reported!');
        } catch (err) {
          Toast.error(err.message || 'Failed to report bug');
        }
      },
      'Report Bug'
    );
  },
};
