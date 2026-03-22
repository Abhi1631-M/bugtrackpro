/* ============================================================
   register.js — User registration page
   ============================================================ */

const RegisterPage = {
  render() {
    return `
      <div class="auth-page">
        <div class="auth-bg"></div>
        <div class="auth-card">
          <div class="auth-logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="url(#g3)"/>
              <path d="M14 24L20 30L34 18" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="g3" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stop-color="#7C3AED"/><stop offset="1" stop-color="#2563EB"/>
              </linearGradient></defs>
            </svg>
            BugTrackPro
          </div>
          <p class="auth-subtitle">Create your account</p>

          <form id="register-form" onsubmit="RegisterPage.submit(event)">
            <div class="form-group">
              <label for="reg-name">Full Name</label>
              <input type="text" id="reg-name" placeholder="John Doe" required />
            </div>
            <div class="form-group">
              <label for="reg-email">Email Address</label>
              <input type="email" id="reg-email" placeholder="you@example.com" required />
            </div>
            <div class="form-group">
              <label for="reg-password">Password</label>
              <div class="password-wrap">
                <input type="password" id="reg-password" placeholder="••••••••" required />
                <button type="button" class="eye-btn" onclick="RegisterPage.togglePassword('reg-password', this)" title="Show/hide password">👁</button>
              </div>
            </div>
            <div class="form-group">
              <label for="reg-role">Role</label>
              <select id="reg-role">
                <option value="DEVELOPER">Developer</option>
                <option value="TESTER">Tester</option>
                <option value="PROJECT_ADMIN">Project Admin</option>
                <option value="VIEWER">Viewer</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary w-full" id="reg-btn" style="margin-top:8px;justify-content:center;padding:12px">
              Create Account
            </button>
          </form>

          <div class="auth-link">
            Already have an account? <a href="#login">Sign in</a>
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
    const btn = document.getElementById('reg-btn');
    btn.disabled = true;
    btn.textContent = 'Creating…';

    try {
      await API.createUser({
        name:     document.getElementById('reg-name').value.trim(),
        email:    document.getElementById('reg-email').value.trim(),
        password: document.getElementById('reg-password').value,
        role:     document.getElementById('reg-role').value,
      });
      Toast.success('Account created! Please sign in.');
      window.location.hash = '#login';
    } catch (err) {
      Toast.error(err.message || 'Registration failed.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  },
};
