/* ============================================================
   api.js — Centralized API client with JWT + auto-refresh
   ============================================================ */

const BASE_URL = CONFIG.BASE_URL;  // defined in js/config.js

async function apiCall(method, path, body = null, retry = true) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  let res = await fetch(`${BASE_URL}${path}`, opts);

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refreshToken = Auth.getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          Auth.setTokens(data.accessToken, data.refreshToken || refreshToken);
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          opts.headers = headers;
          res = await fetch(`${BASE_URL}${path}`, opts);
        } else {
          Auth.logout();
          return null;
        }
      } catch {
        Auth.logout();
        return null;
      }
    } else {
      Auth.logout();
      return null;
    }
  }

  if (!res.ok) {
    let errMsg = `Error ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.message || err.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  // No content
  if (res.status === 204) return null;

  try { return await res.json(); } catch { return null; }
}

// ── Auth ──────────────────────────────────────────────────
const API = {
  login:   (email, password) => apiCall('POST', '/api/auth/login', { email, password }),
  refresh: (refreshToken)   => apiCall('POST', '/api/auth/refresh', { refreshToken }, false),
  logout:  (refreshToken)   => apiCall('POST', '/api/auth/logout', { refreshToken }, false),

  // Users
  createUser:   (dto)  => apiCall('POST', '/api/users', dto),
  getAllUsers:   ()     => apiCall('GET',  '/api/users'),

  // Projects
  createProject:       (dto)               => apiCall('POST', '/api/projects', dto),
  getAllProjects:       ()                  => apiCall('GET',  '/api/projects'),
  assignUserToProject: (projectId, userId) => apiCall('POST', `/api/projects/${projectId}/users/${userId}`),

  // Bugs
  createBug:    (dto)            => apiCall('POST', '/api/bugs', dto),
  getBugsByProject: (projectId)  => apiCall('GET',  `/api/bugs/project/${projectId}`),
  assignBug:   (bugId, userId)   => apiCall('PUT',  `/api/bugs/${bugId}/assign/${userId}`),
  updateBugStatus: (bugId, status) => apiCall('PUT', `/api/bugs/${bugId}/status?status=${status}`),

  // Comments
  addComment:  (bugId, dto) => apiCall('POST', `/api/bugs/${bugId}/comments`, dto),
  getComments: (bugId)      => apiCall('GET',  `/api/bugs/${bugId}/comments`),
};
