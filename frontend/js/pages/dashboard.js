/* ============================================================
   dashboard.js — Dashboard page with summary stats
   ============================================================ */

const DashboardPage = {
  async render() {
    const user = Auth.getUser();
    return `
      <div class="page-header">
        <div class="page-header-left">
          <h1>👋 Welcome back, ${user?.name || 'User'}!</h1>
          <p>Here's what's happening across your projects today.</p>
        </div>
      </div>

      <div class="stat-grid" id="stat-grid">
        ${[1,2,3,4].map(() => `
          <div class="stat-card">
            <div class="stat-label" style="height:12px;background:var(--border-color);border-radius:4px;width:60%"></div>
            <div class="stat-value" style="height:40px;background:var(--border-color);border-radius:4px;width:40%;margin-top:8px"></div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">🐛 Recent Bugs</span>
        </div>
        <div id="dashboard-bug-list" style="padding:20px">
          <div class="empty-state">
            <div class="splash-spinner"></div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    try {
      const projects = await API.getAllProjects();
      let allBugs = [];
      if (projects && projects.length > 0) {
        const bugLists = await Promise.allSettled(
          projects.map(p => API.getBugsByProject(p.id))
        );
        bugLists.forEach(r => {
          if (r.status === 'fulfilled' && Array.isArray(r.value)) {
            allBugs = [...allBugs, ...r.value];
          }
        });
      }

      // Compute stats
      const stats = {
        projects: projects?.length || 0,
        open:        allBugs.filter(b => b.status === 'OPEN').length,
        inProgress:  allBugs.filter(b => b.status === 'IN_PROGRESS').length,
        resolved:    allBugs.filter(b => b.status === 'RESOLVED').length,
      };

      const statGrid = document.getElementById('stat-grid');
      if (statGrid) {
        statGrid.innerHTML = `
          <div class="stat-card">
            <div class="stat-icon">📁</div>
            <div class="stat-label">Total Projects</div>
            <div class="stat-value">${stats.projects}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔴</div>
            <div class="stat-label">Open Bugs</div>
            <div class="stat-value" style="color:var(--color-open)">${stats.open}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔵</div>
            <div class="stat-label">In Progress</div>
            <div class="stat-value" style="color:var(--color-in-progress)">${stats.inProgress}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-label">Resolved</div>
            <div class="stat-value" style="color:var(--color-resolved)">${stats.resolved}</div>
          </div>
        `;
      }

      const bugListEl = document.getElementById('dashboard-bug-list');
      if (!bugListEl) return;

      const recent = allBugs.slice(-10).reverse();
      if (recent.length === 0) {
        bugListEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🎉</div>
            <h3>No bugs yet!</h3>
            <p>Go to a project and report your first bug.</p>
          </div>
        `;
        return;
      }

      bugListEl.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Title</th><th>Status</th><th>Priority</th><th>Type</th><th>Project</th>
            </tr></thead>
            <tbody>
              ${recent.map(b => {
                const proj = projects.find(p => p.id === b.projectId);
                return `
                  <tr onclick="window.location.hash='#bug-detail?bugId=${b.id}'">
                    <td><strong>${b.title}</strong></td>
                    <td>${App.statusBadge(b.status)}</td>
                    <td>${App.priorityBadge(b.priority)}</td>
                    <td>${App.typeBadge(b.type)}</td>
                    <td><span class="text-muted">${proj?.name || '—'}</span></td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      console.error('Dashboard error:', err);
    }
  },
};
