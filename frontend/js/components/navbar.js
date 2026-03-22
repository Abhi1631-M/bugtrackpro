/* ============================================================
   navbar.js — Sidebar navigation (role-aware)
   ============================================================ */

const Navbar = {
  render(activePage) {
    const user = Auth.getUser();
    if (!user) return '';

    const navItems = [
      { id: 'dashboard', icon: '📊', label: 'Dashboard', hash: '#dashboard' },
      { id: 'projects',  icon: '📁', label: 'Projects',  hash: '#projects'  },
      { id: 'bugs',      icon: '🐛', label: 'All Bugs',  hash: '#bugs'      },
      ...(Auth.isRole('SUPER_ADMIN', 'PROJECT_ADMIN')
        ? [{ id: 'users', icon: '👥', label: 'Users', hash: '#users' }]
        : []),
    ];

    const navHTML = navItems
      .map(item => `
        <button class="nav-item ${activePage === item.id ? 'active' : ''}" 
                onclick="window.location.hash = '${item.hash}'" 
                id="nav-${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `)
      .join('');

    const roleBadgeClass = `badge badge-${user.role.toLowerCase()}`;

    return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="url(#g1)"/>
            <path d="M14 24L20 30L34 18" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stop-color="#7C3AED"/><stop offset="1" stop-color="#2563EB"/>
            </linearGradient></defs>
          </svg>
          BugTrackPro
        </div>
        <nav class="sidebar-nav">
          ${navHTML}
        </nav>
        <div class="sidebar-footer">
          <div class="user-card">
            <div class="flex items-center gap-2" style="margin-bottom:6px">
              <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#2563eb);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0">
                ${(user.name || user.email || '?')[0].toUpperCase()}
              </div>
              <div style="min-width:0">
                <div class="user-card-name">${user.name || user.email}</div>
                <div class="user-card-email">${user.email}</div>
              </div>
            </div>
            <span class="${roleBadgeClass}" style="font-size:10px">${user.role.replace('_', ' ')}</span>
          </div>
          <button class="btn btn-danger w-full mt-4" id="logout-btn" style="margin-top:10px">
            🚪 Logout
          </button>
        </div>
      </aside>
    `;
  },

  attachEvents() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => Auth.logout());
    }
  },
};
