/* ============================================================
   auth.js — Token storage, JWT decoding, role helpers
   ============================================================ */

const Auth = {
  getToken()        { return localStorage.getItem('btp_access'); },
  getRefreshToken() { return localStorage.getItem('btp_refresh'); },

  setTokens(access, refresh) {
    localStorage.setItem('btp_access', access);
    if (refresh) localStorage.setItem('btp_refresh', refresh);
  },

  clearTokens() {
    localStorage.removeItem('btp_access');
    localStorage.removeItem('btp_refresh');
    localStorage.removeItem('btp_user');
  },

  /**
   * Decode the JWT payload (no signature verification — that's the server's job)
   */
  decodeToken(token) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  },

  /**
   * Returns { email, role, name, sub } from the stored access token.
   * Role is the first authority string after "ROLE_".
   */
  getUser() {
    const cached = localStorage.getItem('btp_user');
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodeToken(token);
    if (!payload) return null;
    // Spring Security sets 'sub' as username (email) and 'roles' or 'authorities'
    const role = (payload.role || 
                  (payload.authorities && payload.authorities[0]?.replace('ROLE_', '')) ||
                  (Array.isArray(payload.roles) ? payload.roles[0] : null) ||
                  '').replace('ROLE_', '');
    const user = {
      email: payload.sub || payload.email || '',
      name:  payload.name || payload.sub || 'User',
      role:  role.toUpperCase(),
    };
    localStorage.setItem('btp_user', JSON.stringify(user));
    return user;
  },

  /** Cache user info after login (from response or decoded token) */
  cacheUser(data) {
    const payload = this.decodeToken(data.accessToken);
    if (!payload) return;
    const role = (payload.role || 
                  (payload.authorities && payload.authorities[0]?.replace('ROLE_', '')) ||
                  '').replace('ROLE_', '').toUpperCase();
    const user = {
      email: payload.sub || '',
      name:  payload.name || payload.sub || 'User',
      role,
    };
    localStorage.setItem('btp_user', JSON.stringify(user));
    return user;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  isRole(...roles) {
    const user = this.getUser();
    if (!user) return false;
    return roles.map(r => r.toUpperCase()).includes(user.role.toUpperCase());
  },

  async logout() {
    const refresh = this.getRefreshToken();
    if (refresh) {
      try { await API.logout(refresh); } catch {}
    }
    this.clearTokens();
    window.location.hash = '#login';
  },
};
