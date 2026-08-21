(() => {
  const adminName = document.getElementById('admin-name');
  const adminRole = document.getElementById('admin-role');
  const logoutButton = document.getElementById('logout-button');
  const sessionStatus = document.getElementById('session-status');

  async function loadSession() {
    try {
      const response = await fetch('/api/admin/session', { credentials: 'same-origin' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        window.location.replace('/admin/login');
        return;
      }
      adminName.textContent = result.user.fullName || result.user.username || 'Administrator';
      adminRole.textContent = result.user.role || 'admin';
    } catch {
      sessionStatus.textContent = 'Could not verify your admin session. Please sign in again.';
      setTimeout(() => window.location.replace('/admin/login'), 900);
    }
  }

  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = 'Logging Out…';
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      window.location.replace('/admin/login');
    }
  });

  loadSession();
})();
