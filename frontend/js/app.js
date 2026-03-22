/* ============================================================
   app.js — Main SPA router & page orchestrator
   ============================================================ */

const App = {
  currentPage: null,

  // ── Badge helpers (used across pages) ─────────────────────
  statusBadge(s) {
    const k = (s || 'OPEN').toLowerCase().replace('_', '_');
    return `<span class="badge badge-${k}">${(s||'').replace('_',' ')}</span>`;
  },
  priorityBadge(p) {
    return `<span class="badge badge-${(p||'').toLowerCase()}">${p||'—'}</span>`;
  },
  severityBadge(s) {
    return `<span class="badge badge-${(s||'').toLowerCase()}">${s||'—'}</span>`;
  },
  typeBadge(t) {
    return `<span class="badge badge-${(t||'').toLowerCase()}">${t||'—'}</span>`;
  },

  // ── Parse hash params ──────────────────────────────────────
  parseHash() {
    const hash  = window.location.hash || '#login';
    const [route, queryStr] = hash.replace('#', '').split('?');
    const params = {};
    if (queryStr) {
      queryStr.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        params[k] = decodeURIComponent(v);
      });
    }
    return { route: route || 'login', params };
  },

  // ── Render a page with sidebar ──────────────────────────────
  async navigate() {
    const { route, params } = this.parseHash();
    const app = document.getElementById('app');

    // Auth guard
    const publicRoutes = ['login', 'register'];
    if (!publicRoutes.includes(route) && !Auth.isAuthenticated()) {
      window.location.hash = '#login';
      return;
    }
    if (publicRoutes.includes(route) && Auth.isAuthenticated()) {
      window.location.hash = '#dashboard';
      return;
    }

    // Public pages (no layout)
    if (route === 'login') {
      app.innerHTML = LoginPage.render();
      return;
    }
    if (route === 'register') {
      app.innerHTML = RegisterPage.render();
      return;
    }

    // ── Protected layout ──────────────────────────────────────
    const pageMap = {
      dashboard:  { page: 'dashboard',  title: '📊 Dashboard'  },
      projects:   { page: 'projects',   title: '📁 Projects'   },
      bugs:       { page: 'bugs',       title: '🐛 Bugs'       },
      'bug-detail':{ page: 'bug-detail', title: '🐛 Bug Detail' },
      users:      { page: 'users',      title: '👥 Users'      },
    };

    const meta = pageMap[route] || pageMap['dashboard'];

    // Render shell immediately
    app.innerHTML = `
      <div class="layout">
        ${Navbar.render(meta.page)}
        <div class="main-content">
          <div class="topbar">
            <span class="topbar-title">${meta.title}</span>
            <div class="topbar-actions">
              <span style="font-size:12px;color:var(--text-muted)">${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</span>
            </div>
          </div>
          <div class="page-content" id="page-content">
            <div class="splash-spinner" style="margin:60px auto;display:block"></div>
          </div>
        </div>
      </div>
    `;

    Navbar.attachEvents();

    // Render page content
    const pageContent = document.getElementById('page-content');
    let pageHtml = '';
    let initFn = null;

    switch (route) {
      case 'dashboard':
        pageHtml = await DashboardPage.render();
        initFn = () => DashboardPage.init();
        break;
      case 'projects':
        pageHtml = await ProjectsPage.render();
        initFn = () => ProjectsPage.init();
        break;
      case 'bugs':
        pageHtml = await BugsPage.render(params);
        initFn = () => BugsPage.init();
        break;
      case 'bug-detail':
        pageHtml = await BugDetailPage.render(params);
        initFn = () => BugDetailPage.init().then(() => {
          // Try to inject bug data from the bugs page if we navigated from there
          if (BugsPage.bugs && BugsPage.bugs.length) {
            const bug = BugsPage.bugs.find(b => b.id === Number(params.bugId));
            if (bug) BugDetailPage.injectBug(bug);
          } else if (DashboardPage._bugCache) {
            const bug = DashboardPage._bugCache.find(b => b.id === Number(params.bugId));
            if (bug) BugDetailPage.injectBug(bug);
          }
        });
        break;
      case 'users':
        if (!Auth.isRole('SUPER_ADMIN', 'PROJECT_ADMIN')) {
          window.location.hash = '#dashboard';
          return;
        }
        pageHtml = await UsersPage.render();
        initFn = () => UsersPage.init();
        break;
      default:
        pageHtml = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Page not found</h3><p><a href="#dashboard" style="color:var(--accent-primary)">Go to Dashboard</a></p></div>`;
    }

    pageContent.innerHTML = pageHtml;
    if (initFn) {
      try { await initFn(); } catch (err) { console.error('Page init error:', err); }
    }
  },

  // ── Bootstrap ──────────────────────────────────────────────
  init() {
    // Initialize modal
    Modal.init();

    // Route on hash change
    window.addEventListener('hashchange', () => this.navigate());

    // Initial route
    this.navigate();
  },
};

// 🚀 Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
