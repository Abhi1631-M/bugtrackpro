/* ============================================================
   login.js — Login page
   ============================================================ */

const LoginPage = {
  render() {
    return `
      <div class="auth-page">
        <div class="auth-bg"></div>
        <div class="auth-card">
          <div class="auth-logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="url(#g2)"/>
              <path d="M14 24L20 30L34 18" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="g2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stop-color="#7C3AED"/><stop offset="1" stop-color="#2563EB"/>
              </linearGradient></defs>
            </svg>
            BugTrackPro
          </div>
          <p class="auth-subtitle">Sign in to your workspace</p>

          <form id="login-form" onsubmit="LoginPage.submit(event)">
            <div class="form-group">
              <label for="login-email">Email Address</label>
              <input type="email" id="login-email" placeholder="you@example.com" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <div class="password-wrap">
                <input type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password" />
                <button type="button" class="eye-btn" onclick="LoginPage.togglePassword('login-password', this)" title="Show/hide password">👁</button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-full" id="login-btn" style="margin-top:8px;justify-content:center;padding:12px">
              Sign In
            </button>
          </form>

          <div class="auth-link">
            Don't have an account?
            <a href="#register">Create one</a>
          </div>

          <div style="margin-top:20px;padding:12px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:8px;font-size:12px;color:var(--text-muted)">
            <strong style="color:var(--text-primary)">🔑 Demo credentials:</strong><br/>
            <span>Email: <code style="color:#a78bfa">devu@example.com</code></span><br/>
            <span>Password: <code style="color:#a78bfa">D12345678</code> (SUPER_ADMIN)</span>
          </div>
        </div>
      </div>
    `;
  },

  togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? '🙈' : '👁';
  },

  async submit(e) {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-btn');

    btn.disabled = true;
    btn.textContent = 'Signing in…';

    try {
      const data = await API.login(email, password);
      Auth.setTokens(data.accessToken, data.refreshToken);
      Auth.cacheUser(data);
      Toast.success('Welcome back!');
      window.location.hash = '#dashboard';
    } catch (err) {
      Toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  },
};
